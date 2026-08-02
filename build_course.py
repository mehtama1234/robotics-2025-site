from html import escape
from pathlib import Path

from course_spine import COURSE_SUBTITLE, COURSE_TITLE, INTRO, SECTIONS


def paragraph(text):
    return f"<p>{escape(text)}</p>"


def section_html(section):
    items = "".join(f"<li>{escape(item)}</li>" for item in section["applications"])
    return f"""
<section class="lesson">
  <h2>{escape(section["title"])}</h2>
  <div class="label">The problem</div>
  {paragraph(section["plain_problem"])}
  <div class="label">The first principle</div>
  {paragraph(section["first_principle"])}
  <div class="label">Why this matters</div>
  {paragraph(section["why_it_matters"])}
  <div class="label">Where it shows up</div>
  <ul>{items}</ul>
</section>"""


def build():
    intro = "\n".join(paragraph(p) for p in INTRO)
    sections = "\n".join(section_html(section) for section in SECTIONS)
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(COURSE_TITLE)}</title>
<style>
:root {{
  --ink:#0F1619; --paper:#F5F6F4; --panel:#FBFCFB; --tint:#E4ECEB;
  --line:#D7DCD9; --graphite:#59656A; --accent:#0E7C86; --accent-deep:#0A5A62;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,Roboto,Arial,sans-serif;
}}
* {{ box-sizing:border-box }}
body {{ margin:0; background:var(--paper); color:var(--ink); font-family:var(--sans); line-height:1.68 }}
a {{ color:var(--accent-deep) }}
.wrap {{ max-width:900px; margin:0 auto; padding:0 24px }}
header {{ background:var(--ink); color:#E7ECED; padding:44px 0 36px; border-bottom:1px solid #000 }}
.bug {{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:#4FC4CE }}
h1 {{ margin:11px 0 0; font-size:33px; letter-spacing:-.03em; color:#F8FAFA; line-height:1.12 }}
header p {{ margin:12px 0 0; color:#AEBABD; font-size:16px; max-width:68ch }}
nav {{ position:sticky; top:0; z-index:2; background:rgba(15,22,25,.96); border-bottom:1px solid #263237 }}
nav .wrap {{ display:flex; flex-wrap:wrap; gap:4px; padding:9px 24px }}
nav a {{ color:#AEBABD; text-decoration:none; font-family:var(--mono); font-size:12px; padding:6px 10px; border-radius:6px }}
nav a:hover {{ background:#1b262c; color:#fff }}
.intro {{ background:var(--panel); border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:0 10px 10px 0; padding:20px 24px; margin:26px 0 10px }}
.intro p, .lesson p, .lesson li {{ font-size:15.5px; color:#23302C }}
.lesson {{ background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:22px 24px; margin:14px 0 }}
.lesson h2 {{ margin:0 0 12px; font-size:22px; letter-spacing:-.01em }}
.label {{ margin-top:13px; font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--accent-deep) }}
.lesson p {{ margin:6px 0 0; max-width:74ch }}
.lesson ul {{ margin:7px 0 0; padding-left:22px }}
.lesson li {{ margin:5px 0 }}
footer {{ color:var(--graphite); font-family:var(--mono); font-size:11.5px; padding:26px 0 60px }}
</style>
</head>
<body>
<header><div class="wrap">
  <div class="bug">Robotics 2025 course</div>
  <h1>{escape(COURSE_TITLE)}</h1>
  <p>{escape(COURSE_SUBTITLE)}</p>
</div></header>
<nav><div class="wrap">
  <a href="index.html">Home</a>
  <a href="the-machine.html">The whole machine</a>
  <a href="math-explained.html">Math foundations</a>
  <a href="cross-conference.html">Cross-conference</a>
</div></nav>
<main class="wrap">
  <div class="intro">{intro}</div>
  {sections}
</main>
<footer><div class="wrap">Robotics 2025 course spine. Plain first-principles map across sensing, planning, control, learning, topology, and real-world use.</div></footer>
</body>
</html>
"""
    Path("course.html").write_text(html, encoding="utf-8")
    print(f"wrote course.html ({len(SECTIONS)} sections)")


if __name__ == "__main__":
    build()
