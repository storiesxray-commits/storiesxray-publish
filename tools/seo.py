"""SEO gate for every video (owner request 18/11/2026: "posicionamiento extremo" in search, not only the Shorts feed).
meta.json / publish/<id>/metadata.json must carry an `seo` block:

  "seo": {
    "keyword":   "why does my voice sound different on recordings",   # the exact US search phrase this video should rank for
    "title_alts": ["Your Recorded Voice Is the Real One", "..."],      # 2+ alternative titles: XR-10 swaps to #1 at 48 h if views are low
    "playlist":  "Weird Body Facts You Never Knew",                    # search-friendly playlist (one per series); XR-10 creates/fills it
    "questions": ["Why do I hate my voice on recordings?", "...", "..."]  # 3+ real questions people type; used by the website FAQ (Google / AI answers)
  }

Rules checked (SEO.md): keyword in the title or the first line of the description, keyword words in the first 150 characters
of the description, first tag = keyword, 10-20 tags with >= 2 long-tail (4+ words), 3-5 hashtags, 2 distinct alt titles
<= 100 chars without < >, playlist name, 3 questions ending in "?".
Usage: python tools/seo.py <video-id>   (handoff.py calls check() and puts the video on hold if anything fails)"""
import json, os, re, sys

STOP = set("a an the of to in on is are was were be your you my i do does did how why what who when it its this that for and or with at by from".split())


def words(s):
    return [w for w in re.findall(r"[a-z0-9']+", s.lower()) if w not in STOP]


def check(meta):
    errs, seo = [], meta.get("seo") or {}
    if not seo:
        return ["seo_block_missing"]
    kw = (seo.get("keyword") or "").strip().lower()
    title, desc = meta.get("title", ""), meta.get("description", "")
    tags = meta.get("tags") or []
    if isinstance(tags, str): tags = [t.strip() for t in tags.split(",") if t.strip()]
    if not kw or len(kw.split()) < 2: errs.append("seo_keyword_missing_or_too_short")
    kws = words(kw)
    if kws:
        first_line = desc.split("\n")[0].lower()
        in_title = sum(w in title.lower() for w in kws) / len(kws)
        in_first = sum(w in first_line for w in kws) / len(kws)
        if max(in_title, in_first) < 0.6: errs.append("seo_keyword_not_in_title_or_first_line")
        if sum(w in desc[:150].lower() for w in kws) / len(kws) < 0.5: errs.append("seo_keyword_not_in_first_150_chars")
    if not tags or tags[0].strip().lower() != kw: errs.append("seo_first_tag_must_be_keyword")
    if not 10 <= len(tags) <= 20: errs.append("seo_tags_not_10_to_20")
    if sum(len(t.split()) >= 4 for t in tags) < 2: errs.append("seo_fewer_than_2_longtail_tags")
    if len(",".join(tags)) > 480: errs.append("seo_tags_over_500_chars")
    n_hash = len(re.findall(r"(?<!\w)#\w+", desc))
    if not 3 <= n_hash <= 5: errs.append("seo_hashtags_not_3_to_5")
    alts = [a for a in (seo.get("title_alts") or []) if a and a.strip() != title.strip()]
    if len(set(alts)) < 2: errs.append("seo_fewer_than_2_title_alts")
    if any(len(a) > 100 or "<" in a or ">" in a for a in alts): errs.append("seo_title_alt_invalid")
    if not (seo.get("playlist") or "").strip(): errs.append("seo_playlist_missing")
    qs = [q for q in (seo.get("questions") or []) if q.strip().endswith("?")]
    if len(qs) < 3: errs.append("seo_fewer_than_3_questions")
    return errs


if __name__ == "__main__":
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    vid = sys.argv[1]
    p = f"{ROOT}/publish/{vid}/metadata.json"
    if not os.path.exists(p): p = f"{ROOT}/videos/{vid}/meta.json"
    e = check(json.load(open(p)))
    print("SEO OK" if not e else "SEO PROBLEMS: " + ", ".join(e))
    sys.exit(1 if e else 0)
