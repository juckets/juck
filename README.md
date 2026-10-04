# Jack Beckett — Engineering Portfolio

A single-page portfolio for graduate mechanical engineering roles. It's plain HTML, CSS and JS with no build step, so it runs on GitHub Pages as it is.

```
index.html               ← the portfolio (all sections)
cv.html                  ← printable CV (the source for the PDF)
assets/css/style.css     ← styles: change --accent in :root to rebrand
assets/js/main.js        ← nav, project filters, scroll reveal, hero flow animation
assets/img/              ← project images (SVG placeholders for now)
assets/docs/Jack-Beckett-CV.pdf  ← the file the "Download CV" buttons serve
```

## Publish on GitHub Pages
1. Merge this branch into `main`.
2. In the repo, go to **Settings → Pages → Build and deployment** and set Source to *Deploy from a branch*, Branch to `main`, folder `/ (root)`.
3. The site goes live at `https://juckets.github.io/juck/`. For a cleaner URL, rename the repo to `juckets.github.io`.

## Fill in the placeholders
Search for these markers:
- `[...]` in square brackets is information only you have, like results, dates, your store name and your GPA. On the site they show in **yellow italics**, and in `cv.html` they have a yellow highlight.
- `EDIT ME` comments in `index.html` mark spots to change.

Start with the **Result** lines on each project. Concrete numbers are what recruiters look for: "CFD within 8% of PIV" beats "good agreement".

### Replace the project images
Put photos or renders in `assets/img/` (JPG/WebP, about 1600px wide, under 300 KB each) and update each `<img src>`. Good choices are rig photos, CFD contours, PIV vector fields, the robot itself, Simulink diagrams, SAM output charts and FEA stress plots.

### Add a project
Copy any `<article class="project">…</article>` block over one of the dashed "Your next project" slots. Set `data-tags` to `fluids`, `controls`, `design` or `energy` so the filter buttons work.

### Add work experience
In the Experience section of `index.html`, replace the dashed `[Internship / Engineering role]` item. In `cv.html`, add the role above the Coles entry.

## Update the CV PDF
Edit `cv.html`, then do one of the following:
- **Browser:** open `cv.html` in Chrome, choose Print → Save as PDF (A4, Margins: None, untick Headers and footers), and save over `assets/docs/Jack-Beckett-CV.pdf`.
- **Command line** (needs Playwright):
  ```js
  // save as render-cv.js, run: node render-cv.js
  const { chromium } = require('playwright');
  (async () => {
    const b = await chromium.launch(); const p = await b.newPage();
    await p.goto('file://' + __dirname + '/cv.html', { waitUntil: 'networkidle' });
    await p.pdf({ path: 'assets/docs/Jack-Beckett-CV.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
    await b.close();
  })();
  ```
Check that it still fits on one page after you fill in the placeholders.
