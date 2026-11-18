"""Stories X-Ray website for Google and AI search (owner request 18/11/2026, SEO.md §3).
Builds site/ from videos/<id>/meta.json + script.json and the YouTube id that Make XR-10 writes to
publish/<id>/yt.json (or videos/<id>/yt.json for legacy videos). Only public videos (with a yt id) get a page.
Each page: embedded Short, short answer, transcript, FAQ, sources, VideoObject + FAQPage + BreadcrumbList schema.
Also index.html, sitemap.xml, robots.txt and llms.txt. en-US, aimed at the US and the other high-paying English markets.
Usage: python tools/site.py   (the GitHub Action .github/workflows/site.yml runs it on every push and deploys to Pages)"""
import datetime as dt, glob, html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f"{ROOT}/site"
BASE = "https://storiesxray-commits.github.io/storiesxray-publish"
CHANNEL = "https://www.youtube.com/@StoriesXray"
SUB = CHANNEL + "?sub_confirmation=1"
NAME = "Stories X-Ray"
INDEXNOW_KEY = "7e07299ef8cfa1d9164be2329c4b3e35"  # IndexNow (Bing, Yandex; Bing feeds ChatGPT search). Public by design.
TAG = re.compile(r"\[[a-z ]+\]\s*")
e = html.escape


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:80]


def clean_desc(d):
    """Description without the sources list and hashtags (those are rendered separately)."""
    body = re.split(r"\n\s*Sources?:", d)[0]
    body = re.sub(r"(?<!\w)#\w+", "", body)
    return body.strip()


def iso_dur(s):
    s = int(round(float(s or 0)))
    return f"PT{s // 60}M{s % 60}S" if s >= 60 else f"PT{s}S"


def load():
    vids = []
    for mp in sorted(glob.glob(f"{ROOT}/videos/*/meta.json")):
        vid = mp.split("/")[-2]
        yj = next((p for p in (f"{ROOT}/publish/{vid}/yt.json", f"{ROOT}/videos/{vid}/yt.json") if os.path.exists(p)), None)
        if not yj:
            continue
        yt = json.load(open(yj)); m = json.load(open(mp))
        sp = f"{ROOT}/videos/{vid}/script.json"
        script = [TAG.sub("", s[0]).strip() for s in json.load(open(sp))["sentences"]] if os.path.exists(sp) else []
        pm = f"{ROOT}/publish/{vid}/metadata.json"
        dur = json.load(open(pm)).get("duration_s") if os.path.exists(pm) else m.get("duration_s")
        seo = m.get("seo") or {}
        qs = [q for q in seo.get("questions", []) if isinstance(q, dict) and q.get("a")]
        vids.append(dict(id=vid, yt=yt["yt_video_id"], date=yt.get("published_at", ""), title=m["title"],
                         desc=clean_desc(m.get("description", "")), tags=m.get("tags") or [], sources=m.get("sources") or [],
                         series=seo.get("playlist") or m.get("series") or "Stories", playlist_id=yt.get("playlist_id"),
                         keyword=seo.get("keyword") or m["title"], faq=qs, script=script, dur=dur or 40,
                         slug=slug(seo.get("keyword") or m["title"])))
    vids.sort(key=lambda v: v["date"], reverse=True)
    return vids


CSS = """*{box-sizing:border-box}body{margin:0;font:17px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#14161a;background:#fafaf7}
a{color:#0a58ca}header,main,footer{max-width:760px;margin:0 auto;padding:0 20px}header{padding-top:22px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.brand{white-space:nowrap;font-weight:800;letter-spacing:.02em;text-decoration:none;color:#14161a;font-size:20px}.sub{white-space:nowrap;background:#e62117;color:#fff;text-decoration:none;padding:9px 16px;border-radius:999px;font-weight:700;font-size:15px}
h1{font-size:34px;line-height:1.15;margin:28px 0 10px}h2{font-size:22px;margin:34px 0 8px}.meta{color:#5b6070;font-size:14px}
.answer{background:#fff;border-left:5px solid #ffd60a;padding:14px 18px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.player{position:relative;width:100%;max-width:360px;aspect-ratio:9/16;margin:22px auto;border-radius:14px;overflow:hidden;background:#000}.player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
details{background:#fff;border-radius:8px;padding:12px 16px;margin:8px 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}summary{font-weight:700;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;padding:0;list-style:none}.card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.card a{text-decoration:none;color:#14161a}.card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.card div{padding:10px 12px;font-weight:700;line-height:1.3}
.tags{color:#5b6070;font-size:14px}footer{color:#5b6070;font-size:14px;padding:40px 20px}"""


def page(title, desc, path, body, ld, image=None):
    url = f"{BASE}/{path}"
    og = f'<meta property="og:image" content="{e(image)}">' if image else ""
    ld_html = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    return f"""<!DOCTYPE html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc[:300])}"><link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc[:300])}"><meta property="og:url" content="{url}">{og}
<meta name="twitter:card" content="summary_large_image"><style>{CSS}</style>{ld_html}</head><body>
<header><a class="brand" href="{BASE}/">STORIES X-RAY</a><a class="sub" href="{SUB}" rel="noopener">Subscribe on YouTube</a></header>
<main>{body}</main><footer>{NAME}: weird true stories and science facts, animated and explained in under a minute, with real sources. <a href="{CHANNEL}">Watch on YouTube</a>.</footer></body></html>"""


def video_page(v, all_v):
    path = f"v/{v['slug']}/"
    url = f"{BASE}/{path}"
    thumb = f"https://i.ytimg.com/vi/{v['yt']}/hqdefault.jpg"
    short_answer = v["faq"][0]["a"] if v["faq"] else v["desc"].split("\n")[0]
    transcript = " ".join(v["script"])
    desc_html = "".join(f"<p>{e(p).replace(chr(10), '<br>')}</p>" for p in v["desc"].split("\n\n") if p.strip())
    faq_html = "".join(f"<details open><summary>{e(q['q'])}</summary><p>{e(q['a'])}</p></details>" for q in v["faq"])
    src_html = "".join(f'<li><a href="{e(s["url"])}" rel="nofollow noopener">{e(s.get("title") or s["url"])}</a></li>' for s in v["sources"])
    related = [x for x in all_v if x["id"] != v["id"] and x["series"] == v["series"]][:3] or [x for x in all_v if x["id"] != v["id"]][:3]
    rel_html = "".join(f'<li class="card"><a href="{BASE}/v/{x["slug"]}/"><img loading="lazy" src="https://i.ytimg.com/vi/{x["yt"]}/hqdefault.jpg" alt="{e(x["title"])}"><div>{e(x["title"])}</div></a></li>' for x in related)
    pl = f' · <a href="https://www.youtube.com/playlist?list={e(v["playlist_id"])}">{e(v["series"])} playlist</a>' if v.get("playlist_id") else ""
    date = v["date"][:10]
    body = f"""<p class="meta"><a href="{BASE}/">Home</a> › {e(v['series'])}</p>
<h1>{e(v['title'])}</h1><p class="meta">Updated {date} · {int(round(float(v['dur'])))}-second video{pl}</p>
<div class="answer"><strong>Short answer:</strong> {e(short_answer)}</div>
<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/{v['yt']}?rel=0" title="{e(v['title'])}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
<p style="text-align:center"><a class="sub" href="{SUB}">Subscribe for a new story every day</a></p>
<h2>The story</h2>{desc_html}
{"<h2>People also ask</h2>" + faq_html if faq_html else ""}
{"<h2>Full transcript</h2><p>" + e(transcript) + "</p>" if transcript else ""}
{"<h2>Sources</h2><ul>" + src_html + "</ul>" if src_html else ""}
<p class="tags">Topics: {e(", ".join(v['tags'][:12]))}</p>
<h2>More stories</h2><ul class="grid">{rel_html}</ul>"""
    ld = [{"@context": "https://schema.org", "@type": "VideoObject", "name": v["title"], "description": (v["desc"] or v["title"])[:1000],
           "thumbnailUrl": [thumb], "uploadDate": v["date"] or None, "duration": iso_dur(v["dur"]),
           "embedUrl": f"https://www.youtube.com/embed/{v['yt']}", "contentUrl": f"https://www.youtube.com/shorts/{v['yt']}",
           "inLanguage": "en-US", "keywords": ", ".join(v["tags"][:15]), "transcript": transcript or None,
           "publisher": {"@type": "Organization", "name": NAME, "url": CHANNEL}},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": NAME, "item": f"{BASE}/"},
              {"@type": "ListItem", "position": 2, "name": v["title"], "item": url}]}]
    if v["faq"]:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q["q"], "acceptedAnswer": {"@type": "Answer", "text": q["a"]}} for q in v["faq"]]})
    for x in ld:
        for k in [k for k, val in x.items() if val is None]: del x[k]
    title = f"{v['title']} | {NAME}"
    return path, page(title, short_answer, path, body, ld, thumb)


def build():
    vids = load()
    import shutil
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
    urls = [f"{BASE}/"]
    for v in vids:
        path, doc = video_page(v, vids)
        os.makedirs(f"{OUT}/{path}", exist_ok=True); open(f"{OUT}/{path}index.html", "w").write(doc); urls.append(f"{BASE}/{path}")
    groups = {}
    for v in vids: groups.setdefault(v["series"], []).append(v)
    body = (f"<h1>Weird true stories &amp; science facts, explained in under a minute</h1>"
            f"<p>{NAME} is a YouTube channel of short animated stories: real history, science and pop culture with sources you can check. Pick a story below or <a href=\"{SUB}\">subscribe on YouTube</a>.</p>")
    for g, vs in groups.items():
        body += f"<h2>{e(g)}</h2><ul class=\"grid\">" + "".join(
            f'<li class="card"><a href="{BASE}/v/{x["slug"]}/"><img loading="lazy" src="https://i.ytimg.com/vi/{x["yt"]}/hqdefault.jpg" alt="{e(x["title"])}"><div>{e(x["title"])}</div></a></li>' for x in vs) + "</ul>"
    ld = [{"@context": "https://schema.org", "@type": "WebSite", "name": NAME, "url": f"{BASE}/", "inLanguage": "en-US"},
          {"@context": "https://schema.org", "@type": "Organization", "name": NAME, "url": f"{BASE}/", "sameAs": [CHANNEL, "https://www.instagram.com/storiesxray/"]},
          {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [
              {"@type": "ListItem", "position": i + 1, "url": f"{BASE}/v/{v['slug']}/"} for i, v in enumerate(vids)]}]
    open(f"{OUT}/index.html", "w").write(page(f"{NAME}: Weird True Stories & Science Facts in Under a Minute",
                                              "Short animated videos about weird true history, science and pop culture, with real sources.", "", body, ld))
    today = dt.date.today().isoformat()
    open(f"{OUT}/sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                                          + "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls) + "</urlset>\n")
    open(f"{OUT}/robots.txt", "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n")
    llms = [f"# {NAME}", "", f"> Short animated YouTube videos about weird true stories, science and pop culture, each with sources. Channel: {CHANNEL}", ""]
    for v in vids:
        llms.append(f"## {v['title']}\n- Page: {BASE}/v/{v['slug']}/\n- Video: https://www.youtube.com/shorts/{v['yt']}")
        for q in v["faq"]: llms.append(f"- Q: {q['q']} A: {q['a']}")
        llms.append("")
    open(f"{OUT}/llms.txt", "w").write("\n".join(llms))
    open(f"{OUT}/.nojekyll", "w").write("")
    open(f"{OUT}/{INDEXNOW_KEY}.txt", "w").write(INDEXNOW_KEY)
    json.dump(dict(host="storiesxray-commits.github.io", key=INDEXNOW_KEY, keyLocation=f"{BASE}/{INDEXNOW_KEY}.txt", urlList=urls),
              open(f"{ROOT}/indexnow.json", "w"))
    print(f"site: {len(vids)} video pages -> {OUT}")


if __name__ == "__main__":
    build()
