/*
 * add-protection.js
 * --------------------------------------------------------------
 * Injects a deterrent layer into every demo's index.html:
 *   1. A branded "DEMO" watermark badge (bottom-right) that also
 *      advertises you and marks the page as yours.
 *   2. Light tamper friction: blocks right-click, image-drag, and
 *      the common view-source / save / devtools shortcuts.
 *
 * IMPORTANT: this is FRICTION, not security. A determined person
 * can still copy a static page. The real protection is that they
 * don't have your hosting, domain, or the contract — and the
 * watermark makes any stolen copy obviously yours.
 *
 * Run:  node add-protection.js
 * Idempotent — safe to run repeatedly (skips already-protected files).
 * Edit CONTACT below to your real number before pushing.
 * --------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

const CONTACT = "text 702-555-0000 to make this site live"; // <-- EDIT to your number
const MARKER = "<!-- demo-protect -->";

const block = `${MARKER}
<div id="__wm">DEMO &middot; built by Justin &middot; ${CONTACT}</div>
<style>
#__wm{position:fixed;right:14px;bottom:14px;z-index:99999;background:rgba(15,15,15,.82);
color:#fff;font:600 12px/1.2 system-ui,-apple-system,sans-serif;padding:9px 13px;border-radius:8px;
letter-spacing:.2px;box-shadow:0 6px 18px rgba(0,0,0,.32);pointer-events:none;user-select:none;max-width:60vw}
@media print{#__wm{display:none}}
</style>
<script>
(function(){
  // Friction only -- deters casual copying, not a real lock.
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('dragstart',function(e){if(e.target&&e.target.tagName==='IMG')e.preventDefault();});
  document.addEventListener('keydown',function(e){
    var k=(e.key||'').toLowerCase(), m=e.ctrlKey||e.metaKey;
    if(e.key==='F12'||(m&&(k==='u'||k==='s'))||(m&&e.shiftKey&&(k==='i'||k==='j'||k==='c'))){e.preventDefault();}
  });
})();
</script>`;

const root = __dirname;
const folders = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith("."))
  .map(d => d.name);

let done = 0, skipped = 0;
for (const f of folders) {
  const file = path.join(root, f, "index.html");
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes(MARKER)) { skipped++; continue; }
  if (!html.includes("</body>")) { console.log(`  ! no </body> in ${f}, skipped`); continue; }
  html = html.replace("</body>", block + "\n</body>");
  fs.writeFileSync(file, html, "utf8");
  console.log(`  protected: ${f}/index.html`);
  done++;
}
console.log(`\nDone. Protected ${done}, already-protected ${skipped}.`);
