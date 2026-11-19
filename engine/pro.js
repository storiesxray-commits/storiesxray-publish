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
      col = mix(col, col*col*(3.-2.*col), 0.18);
      col += vec3(.018,.008,-.012) * smoothstep(.45,1.,l) + vec3(-.01,.0,.018) * (1.-smoothstep(0.,.35,l));
      col *= 1. - vig * smoothstep(.12, .62, r*1.6);
      col += (h(vUv*vec2(${W}.,${H}.)) - .5) * grain;
      gl_FragColor = vec4(col, 1.);
    }`,
};

export function setup(renderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt); composer.setSize(W, H);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera()); composer.addPass(rp);
  const ao = new GTAOPass(new THREE.Scene(), new THREE.PerspectiveCamera(), W, H);
  ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 12 });
  ao.blendIntensity = 0.85; if (new URLSearchParams(location.search).get('ao')) composer.addPass(ao);  // off by default: GTAO paints black boxes behind sprites/particles
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.45, 0.97); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fin = new ShaderPass(Finish); composer.addPass(fin);
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
    render(scene, camera, T) {
      scene.traverse(o => { if (o.userData && o.userData.keepHidden) o.visible = false; });
      // subtle handheld: < 0.4 deg, two incommensurate frequencies
      const rx = Math.sin(T * 1.3) * 0.0025 + Math.sin(T * 2.9) * 0.0012, ry = Math.cos(T * 1.1) * 0.003 + Math.sin(T * 2.3) * 0.001;
      camera.rotation.x += rx; camera.rotation.y += ry;
      rp.scene = ao.scene = scene; rp.camera = ao.camera = camera; fin.uniforms.time.value = T;
      composer.render();
      camera.rotation.x -= rx; camera.rotation.y -= ry;
    },
  };
}
