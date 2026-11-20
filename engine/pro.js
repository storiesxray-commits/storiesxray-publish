// "pro" render style for Stories X-Ray. Same scenes, more realistic finish:
// PBR materials + studio environment light, GTAO ambient occlusion, soft bloom, color grade, grain, vignette,
// light chromatic aberration and a subtle handheld camera. Opt-in: player.html?style=pro (render.py: RENDER_STYLE=pro).
import { THREE, W, H } from './engine.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { SubjectPro } from './character.js';
import { mat as worldMat } from './world.js';

const Finish = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.045 }, vig: { value: 0.32 }, ca: { value: 0.0016 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, grain, vig, ca; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time*7.0) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5; float r = dot(c, c);
      vec3 col; col.r = texture2D(tDiffuse, vUv + c*ca*r*4.).r; col.g = texture2D(tDiffuse, vUv).g; col.b = texture2D(tDiffuse, vUv - c*ca*r*4.).b;
      // grade: slight S-curve, warm highlights / cool shadows
      float l = dot(col, vec3(.2126,.7152,.0722));
      col = mix(vec3(l), col, 1.14);  // ACES eats saturation: give it back
      col = mix(col, col*col*(3.-2.*col), 0.18);
      col += vec3(.018,.008,-.012) * smoothstep(.45,1.,l) + vec3(-.01,.0,.018) * (1.-smoothstep(0.,.35,l));
      col *= 1. - vig * smoothstep(.12, .62, r*1.6);
      col += (h(vUv*vec2(${W}.,${H}.)) - .5) * grain;
      gl_FragColor = vec4(col, 1.);
    }`,
};

// cheap depth of field: disc blur scaled by circle of confusion around the focus depth (sampled on screen or given by the scene)
const DOF = {
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, near: { value: 0.1 }, far: { value: 100 }, focusUV: { value: new THREE.Vector2(0.5, 0.45) },
    focusDist: { value: -1 }, aperture: { value: 0.07 }, maxR: { value: 7.0 }, res: { value: new THREE.Vector2(W, H) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse, tDepth; uniform float near, far, focusDist, aperture, maxR; uniform vec2 focusUV, res; varying vec2 vUv;
    float lin(float d){ float z = d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
    float coc(float z, float zf){ return clamp(abs(1./zf - 1./z) * aperture * zf * 40., 0., 1.); }
    void main(){
      // auto focus: nearest thing around the focus point (the subject is almost always in front of the background)
      float zf = focusDist;
      if (zf <= 0.) { zf = 1e9; for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) zf = min(zf, lin(texture2D(tDepth, focusUV + vec2(float(i) * .14, float(j) * .16)).x)); }
      float z = lin(texture2D(tDepth, vUv).x); float c = coc(z, zf);
      vec4 base = texture2D(tDiffuse, vUv); if (c < 0.04) { gl_FragColor = base; return; }
      vec3 acc = base.rgb; float wsum = 1.;
      for (int i = 0; i < 16; i++) { float a = float(i) * 2.39996; float r = sqrt((float(i)+.5)/16.) * c * maxR;
        vec2 o = vec2(cos(a), sin(a)) * r / res; float zs = lin(texture2D(tDepth, vUv + o).x); float cs = coc(zs, zf);
        float w = zs < z ? cs : 1.;   // nearer sharp pixels must not bleed into the blur
        acc += texture2D(tDiffuse, vUv + o).rgb * w; wsum += w; }
      gl_FragColor = vec4(acc / wsum, base.a);
    }`,
};
class DofPass extends ShaderPass { render(r, w, rb, dt, m) { this.uniforms.tDepth.value = rb.depthTexture; super.render(r, w, rb, dt, m); } }

export function setup(renderer) {
  const Q = new URLSearchParams(location.search);
  globalThis.XR_PRO_SUBJECT = SubjectPro;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: Q.get('msaa') ? 4 : 0 });  // SMAA instead of MSAA: ~30% faster
  rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.UnsignedIntType;
  const composer = new EffectComposer(renderer, rt); composer.setSize(W, H);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera()); composer.addPass(rp);
  const dof = new DofPass(DOF); if (!Q.get('nodof')) composer.addPass(dof);
  const ao = new GTAOPass(new THREE.Scene(), new THREE.PerspectiveCamera(), W, H);
  ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 12 });
  ao.blendIntensity = 0.85; if (new URLSearchParams(location.search).get('ao')) composer.addPass(ao);  // off by default: GTAO paints black boxes behind sprites/particles
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.45, 0.97); if (!Q.get('nobloom')) composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fin = new ShaderPass(Finish); composer.addPass(fin);
  if (!Q.get('nosmaa')) composer.addPass(new SMAAPass(W, H));  // edge antialiasing
  const swapped = new WeakMap();
  function physical(m) {
    if (swapped.has(m)) return swapped.get(m);
    const cloth = m.color && (m.color.r + m.color.g + m.color.b) < 1.6;
    const p = new THREE.MeshPhysicalMaterial({
      color: m.color, map: m.map || null, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity ?? 1, emissiveMap: m.emissiveMap || null,
      transparent: m.transparent, opacity: m.opacity, side: m.side, depthWrite: m.depthWrite, alphaTest: m.alphaTest,
      roughness: cloth ? 0.72 : 0.48, metalness: 0, clearcoat: cloth ? 0.05 : 0.3, clearcoatRoughness: 0.45,
      sheen: cloth ? 0.35 : 0.0, sheenRoughness: 0.7, sheenColor: m.color.clone().multiplyScalar(1.4), envMapIntensity: 0.7,
    });
    // micro surface detail (smudges / tiny bumps) so flat-colored props stop reading as plastic toys
    if (!m.map) { const d = worldMat('smudge'); p.normalMap = d.normalMap; p.roughnessMap = d.roughnessMap; p.normalScale = new THREE.Vector2(0.35, 0.35); p.roughness = Math.min(1, p.roughness * 1.4); }
    p.name = m.name; swapped.set(m, p); return p;
  }
  return {
    upgrade(scene) {
      scene.environment = env; scene.environmentIntensity = 0.35;
      // the toon rig was tuned for flat shading: tame it so PBR + environment does not wash out
      scene.traverse(o => { if (o.isLight && !o.userData.proScaled) { o.intensity *= o.isHemisphereLight ? 0.45 : 0.75; o.userData.proScaled = true; } });
      scene.traverse(o => {
        if (o.userData && o.userData.outline) { o.visible = false; o.userData.keepHidden = true; return; }
        if (!o.isMesh || !o.material) return;
        if (Array.isArray(o.material)) o.material = o.material.map(m => m.isMeshToonMaterial ? physical(m) : m);
        else if (o.material.isMeshToonMaterial) o.material = physical(o.material);
      });
    },
    // k = progress of the shot (0..1); P = optional scene settings `pro: { focus: meters | [u, v], aperture, push, dof: false }`
    render(scene, camera, T, k = 0, P = {}) {
      scene.traverse(o => { if (o.userData && o.userData.keepHidden) o.visible = false; });
      // subtle handheld: < 0.4 deg, two incommensurate frequencies
      const rx = Math.sin(T * 1.3) * 0.0025 + Math.sin(T * 2.9) * 0.0012, ry = Math.cos(T * 1.1) * 0.003 + Math.sin(T * 2.3) * 0.001;
      camera.rotation.x += rx; camera.rotation.y += ry;
      // slow push-in through each shot (a lens zoom, so the scene's own framing is kept): feels like a camera operator
      const persp = camera.isPerspectiveCamera, fov0 = camera.fov;
      if (persp) { const e = k * k * (3 - 2 * k); camera.fov = fov0 * (1 - (P.push ?? 0.045) * e); camera.updateProjectionMatrix(); }
      dof.uniforms.near.value = camera.near; dof.uniforms.far.value = camera.far;
      dof.uniforms.aperture.value = persp && P.dof !== false ? (P.aperture ?? 0.07) : 0;
      if (Array.isArray(P.focus)) { dof.uniforms.focusUV.value.set(P.focus[0], P.focus[1]); dof.uniforms.focusDist.value = -1; }
      else if (typeof P.focus === 'number') dof.uniforms.focusDist.value = P.focus;
      else { dof.uniforms.focusUV.value.set(0.5, 0.45); dof.uniforms.focusDist.value = -1; }
      rp.scene = ao.scene = scene; rp.camera = ao.camera = camera; fin.uniforms.time.value = T;
      composer.render();
      camera.rotation.x -= rx; camera.rotation.y -= ry;
      if (persp) { camera.fov = fov0; camera.updateProjectionMatrix(); }
    },
  };
}
