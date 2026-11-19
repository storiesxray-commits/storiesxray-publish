#!/usr/bin/env python3
"""Auditoría de "canal humano" (HUMAN.md).

Mira los últimos N videos de publish/ (y su carpeta videos/) y marca lo que
YouTube puede leer como contenido en serie / plantilla (política "inauthentic
content"): miniaturas casi iguales, títulos y comentarios fijados con la misma
fórmula, guiones que arrancan o cierran igual, poca variedad de narrador,
gancho o duración, horarios idénticos, datos de personas reales y la marca de
contenido sintético.

Uso:
  python tools/audit_human.py            # últimos 10, informe en out/human_audit.md + .json
  python tools/audit_human.py -n 15
  python tools/audit_human.py --id xr014-algo   # chequea un video nuevo contra los anteriores
                                                # (sale con código 2 si hay un ROJO)
Solo lee archivos del repo; no toca YouTube ni Make.
"""
import argparse, glob, json, os, re, sys
from collections import Counter
from itertools import combinations

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")

def load(p):
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return None

def dhash(path, size=16):
    from PIL import Image
    im = Image.open(path).convert("L").resize((size + 1, size))
    px = list(im.tobytes())
    bits = []
    for y in range(size):
        row = px[y * (size + 1):(y + 1) * (size + 1)]
        bits += [row[x] > row[x + 1] for x in range(size)]
    return bits

def colorsig(path):
    from PIL import Image
    im = Image.open(path).convert("RGB").resize((8, 14))
    b = im.tobytes(); return [tuple(b[i:i+3]) for i in range(0, len(b), 3)]

def ham(a, b):
    return sum(x != y for x, y in zip(a, b)) / len(a)

def colordist(a, b):
    d = sum(abs(p[i] - q[i]) for p, q in zip(a, b) for i in range(3))
    return d / (len(a) * 3 * 255)

def opener(text, n=2):
    w = re.findall(r"[a-z0-9']+", re.sub(r"\[[^\]]*\]", "", (text or "").lower()))
    return " ".join(w[:n])

def items(limit, only=None):
    out = []
    for d in sorted(glob.glob(os.path.join(ROOT, "publish", "xr*"))):
        vid = os.path.basename(d)
        m = load(os.path.join(d, "metadata.json")) or {}
        if m.get("status") == "hold" and vid != only:
            continue
        vm = load(os.path.join(ROOT, "videos", vid, "meta.json")) or {}
        sc = load(os.path.join(ROOT, "videos", vid, "script.json")) or {}
        sents = [s[0] if isinstance(s, list) else str(s) for s in sc.get("sentences", [])]
        out.append({
            "id": vid, "title": m.get("title", ""), "pinned": m.get("pinned_comment", ""),
            "desc": m.get("description", ""), "tags": m.get("tags", []),
            "time": m.get("publish_time_local") or m.get("publish_at_local") or "",
            "dur": m.get("duration_s"), "exp": vm.get("experiment") or m.get("experiment") or {},
            "synthetic": m.get("altered_or_synthetic_realistic"),
            "thumb": os.path.join(d, "thumb.jpg") if os.path.exists(os.path.join(d, "thumb.jpg")) else None,
            "first": sents[0] if sents else "", "last": sents[-1] if sents else "",
            "sents": sents, "style": vm.get("render_style", "toon"),
            "thumbcfg": vm.get("thumbnail") or {},
        })
    if only:
        target = [x for x in out if x["id"] == only]
        rest = [x for x in out if x["id"] != only][-limit:]
        return rest + target
    return out[-limit:]

def audit(vs, focus=None):
    F = []  # (nivel, regla, detalle, ids)
    def flag(level, rule, detail, ids):
        if focus and focus not in ids:
            return
        F.append({"level": level, "rule": rule, "detail": detail, "ids": ids})

    # 1. Miniaturas casi iguales (estructura y color)
    th = [(v["id"], dhash(v["thumb"]), colorsig(v["thumb"])) for v in vs if v["thumb"]]
    near = []
    for (a, ha, ca), (b, hb, cb) in combinations(th, 2):
        hd, cd = ham(ha, hb), colordist(ca, cb)
        if hd < 0.30 and cd < 0.12:
            near.append((a, b, round(hd, 2), round(cd, 2)))
    for a, b, hd, cd in near:
        flag("ROJO" if hd < 0.2 else "AMARILLO", "miniaturas casi iguales",
             f"estructura {hd} / color {cd} (0 = idénticas)", [a, b])
    # misma receta de miniatura (círculo + rayos + sello) en todos
    recipe = Counter(tuple(k for k in ("circle", "rays", "badge") if v["thumbcfg"].get(k)) for v in vs if v["thumbcfg"])
    if recipe and recipe.most_common(1)[0][1] >= max(4, int(0.8 * len(vs))):
        flag("AMARILLO", "misma receta de miniatura",
             f"{recipe.most_common(1)[0][1]}/{len(vs)} usan {'+'.join(recipe.most_common(1)[0][0]) or 'nada'}: rotar diseños (HUMAN.md §2)",
             [v["id"] for v in vs])
    # mismas posiciones de texto/sello
    pos = Counter((v["thumbcfg"].get("text_y", 0) // 300, v["thumbcfg"].get("badge_x", 0) // 300) for v in vs if v["thumbcfg"])
    if pos and len(vs) >= 5 and pos.most_common(1)[0][1] >= 0.6 * len(vs):
        flag("AMARILLO", "texto y sello siempre en el mismo lugar", str(pos.most_common(1)[0]), [v["id"] for v in vs])

    # 2. Fórmulas repetidas en textos
    def repeated(field, label, n=2, k=3, level="AMARILLO"):
        c = Counter(opener(v[field], n) for v in vs if v[field])
        for op, cnt in c.items():
            if op and cnt >= k:
                flag(level, f"{label} arrancan igual", f"\"{op}…\" en {cnt} videos",
                     [v["id"] for v in vs if opener(v[field], n) == op])
    repeated("pinned", "comentarios fijados", 2, 3)
    repeated("title", "títulos", 2, 3)
    repeated("first", "guiones", 2, 3)
    repeated("last", "cierres de guion", 2, 3)
    repeated("desc", "descripciones", 3, 3)
    # cierres pidiendo lo mismo (send/share/comment/follow)
    cta = Counter(next((w for w in ("send", "share", "comment", "follow", "subscribe", "tag") if w in v["last"].lower()), "") for v in vs)
    for w, cnt in cta.items():
        if w and cnt >= 4:
            flag("AMARILLO", "mismo llamado al final", f"\"{w}\" en {cnt} de {len(vs)} cierres", [v["id"] for v in vs if w in v["last"].lower()])
    # exceso de signos y etiquetas de actuación (suena a plantilla gritada)
    for v in vs:
        if v["sents"]:
            ex = sum(s.count("!") for s in v["sents"]) / len(v["sents"])
            tags = sum(len(re.findall(r"\[[^\]]+\]", s)) for s in v["sents"])
            if ex > 0.7:
                flag("AMARILLO", "guion gritado", f"{ex:.1f} '!' por frase (máx. 0,5)", [v["id"]])
            if tags > 4:
                flag("AMARILLO", "demasiadas etiquetas de actuación", f"{tags} (máx. 4)", [v["id"]])
    # tags casi iguales
    for a, b in combinations(vs, 2):
        A, B = set(map(str.lower, a["tags"])), set(map(str.lower, b["tags"]))
        if A and B and len(A & B) / len(A | B) > 0.5:
            flag("AMARILLO", "tags casi iguales", f"{len(A & B)} en común", [a["id"], b["id"]])

    # 3. Variedad de producción
    def variety(key, label, minimum):
        vals = [str(v["exp"].get(key)) for v in vs if v["exp"].get(key)]
        if len(vals) >= 5 and len(set(vals)) < minimum:
            flag("AMARILLO", f"poca variedad de {label}", f"{dict(Counter(vals))}", [v["id"] for v in vs])
    variety("voice", "narrador", 3)
    variety("hook_type", "tipo de gancho", 3)
    durs = [v["dur"] for v in vs if v["dur"]]
    if len(durs) >= 5 and max(durs) - min(durs) < 8:
        flag("AMARILLO", "duraciones casi iguales", f"{min(durs):.0f}–{max(durs):.0f} s", [v["id"] for v in vs])
    times = Counter(v["time"][:5] for v in vs if v["time"])
    if times and times.most_common(1)[0][1] >= 4:
        flag("AMARILLO", "misma hora de publicación", str(times.most_common(1)[0]), [v["id"] for v in vs])

    # 4. Personas reales y contenido sintético
    for v in vs:
        if v["synthetic"] is None:
            flag("ROJO", "falta altered_or_synthetic_realistic", "definirlo (HUMAN.md §5)", [v["id"]])
        if v["style"] == "pro" and v["synthetic"] is False and re.search(r"\b(real|footage|photo|cctv|news)\b", v["desc"].lower()):
            flag("AMARILLO", "revisar etiqueta de contenido sintético",
                 "estilo realista + descripción que sugiere imágenes reales", [v["id"]])
    return F

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-n", type=int, default=10)
    ap.add_argument("--id")
    a = ap.parse_args()
    vs = items(a.n, a.id)
    F = audit(vs, a.id)
    os.makedirs(OUT, exist_ok=True)
    red = [f for f in F if f["level"] == "ROJO"]
    lines = [f"# Auditoría de canal humano — {len(vs)} videos ({vs[0]['id'] if vs else '-'} … {vs[-1]['id'] if vs else '-'})", "",
             f"ROJO: {len(red)} · AMARILLO: {len(F) - len(red)}", ""]
    for f in sorted(F, key=lambda x: x["level"] != "ROJO"):
        lines.append(f"- **{f['level']}** {f['rule']}: {f['detail']} → {', '.join(f['ids'][:6])}{'…' if len(f['ids']) > 6 else ''}")
    if not F:
        lines.append("Sin hallazgos.")
    name = f"human_audit_{a.id}" if a.id else "human_audit"
    open(os.path.join(OUT, name + ".md"), "w").write("\n".join(lines) + "\n")
    json.dump({"videos": [v["id"] for v in vs], "findings": F}, open(os.path.join(OUT, name + ".json"), "w"), indent=1, ensure_ascii=False)
    print("\n".join(lines))
    sys.exit(2 if (a.id and red) else 0)

if __name__ == "__main__":
    main()
