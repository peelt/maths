"""Derive each 9MA0 spec point's teaching phase from the specification itself.

The spec marks AS Mathematics common content in bold: "To support the
co-teaching of this qualification with the AS Mathematics qualification,
common content has been highlighted in bold." That bold marking is the only
division of the content the board actually makes, so it -- not a guess -- is
what the site's "taught first / taught later" split is built from.

Bold is measured on the Content column only, per spec point. A point can be
part bold and part plain (binomial expansion is AS for positive integer n and
A level for rational n), which is why there are three states rather than two.
"""
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LTTextLine, LTChar
import re, json, sys
from collections import defaultdict

# Column geometry, measured off the rendered pages.
CODE_X0, CODE_X1, CONTENT_X1 = 165, 200, 350
CODE = re.compile(r"^(\d{1,2}\.\d{1,2})(?!\d)")
# The table header repeats on every page and is bold; it is not spec content.
HEADERS = {"Whatstudentsneedtolearn:", "Content", "Guidance", "Topics"}

def derive(path):
    tally = defaultdict(lambda: [0, 0]); order = []; cur = None; paper = None
    for page in extract_pages(path):
        flat = "".join("".join(e.get_text().split())
                       for e in page if isinstance(e, LTTextContainer))
        if "Paper1andPaper2:PureMathematics" in flat: paper = "pure"
        elif "Paper3:StatisticsandMechanics" in flat: paper = "p3"
        # Only the content tables carry this header. Everything else -- the
        # front matter, the appendices -- must not leak into the last code seen.
        if paper is None or "Whatstudentsneedtolearn" not in flat:
            cur = None
            continue
        lines = [ln for e in page if isinstance(e, LTTextContainer)
                 for ln in e if isinstance(ln, LTTextLine)]
        lines.sort(key=lambda l: (-round(l.y1, 1), l.x0))
        for ln in lines:
            if not (CODE_X0 <= ln.x0 < CONTENT_X1): continue
            cs = [c for c in ln if isinstance(c, LTChar) and c.get_text().strip()
                  and "verdana" in c.fontname.lower()]
            if not cs: continue
            txt = "".join(c.get_text() for c in cs).strip()
            if txt.replace(" ", "") in HEADERS: continue
            if CODE_X0 <= ln.x0 < CODE_X1:
                m = CODE.match(txt)
                if m:
                    cur = (paper, m.group(1))
                    if cur not in order: order.append(cur)
                    cs = cs[len(m.group(1)):]
            if cur is None or cur[0] != paper: continue
            for c in cs:
                tally[cur][0 if "bold" in c.fontname.lower() else 1] += 1

    out = {}
    for key in order:
        b, p = tally[key]
        if b + p < 12: continue
        frac = b / (b + p)
        out[f"{key[0]}:{key[1]}"] = {
            "bold": b, "plain": p, "frac": round(frac, 3),
            "phase": "first" if frac == 1 else ("later" if frac == 0 else "spanning"),
        }
    return out

if __name__ == "__main__":
    # Usage: python3 scripts/derive-phase.py <path to the 9MA0 specification PDF>
    # Writes phase.json next to it; the values are pasted into src/content/spec.
    res = derive(sys.argv[1] if len(sys.argv) > 1 else "spec.pdf")
    json.dump(res, open("phase.json", "w"), indent=1, sort_keys=True)
    from collections import Counter
    print("resolved:", len(res), Counter(v["phase"] for v in res.values()))
