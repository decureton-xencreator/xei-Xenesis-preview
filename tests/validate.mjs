import fs from "node:fs";

const required = [
  "index.html",
  "src/ed-premiere-clean-v1.js",
  "src/ed-premiere-clean-v1.css",
  "src/xfs-xen-centric-finish-v1.js",
  "src/xfs-xen-centric-finish-v1.css",
  "governance/XFS-XEN-CENTRIC-RELEASE-MANIFEST.json",
  "docs/XEN-CENTRIC-XFS-INSTITUTIONAL-MEMORY-RELEASE.md",
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing required production asset: ${file}`);
  if (fs.statSync(file).size < 20) throw new Error(`Production asset is unexpectedly empty: ${file}`);
}

const html = fs.readFileSync("index.html", "utf8");
const controller = fs.readFileSync("src/ed-premiere-clean-v1.js", "utf8");
const controllerCss = fs.readFileSync("src/ed-premiere-clean-v1.css", "utf8");
const finish = fs.readFileSync("src/xfs-xen-centric-finish-v1.js", "utf8");
const finishCss = fs.readFileSync("src/xfs-xen-centric-finish-v1.css", "utf8");
const manifest = JSON.parse(fs.readFileSync("governance/XFS-XEN-CENTRIC-RELEASE-MANIFEST.json", "utf8"));

for (const asset of [
  "src/ed-premiere-clean-v1.css",
  "src/ed-premiere-clean-v1.js",
  "src/xfs-xen-centric-finish-v1.css",
  "src/xfs-xen-centric-finish-v1.js",
]) {
  if (!html.includes(asset)) throw new Error(`Current nine-scene asset is not active: ${asset}`);
}
if ((html.match(/class="scene/g) || []).length !== 9) {
  throw new Error("The production documentary must contain exactly nine scenes");
}
if ((html.match(/<script type="module"/g) || []).length !== 2) {
  throw new Error("The production documentary must have exactly two bounded module owners");
}
for (const forbidden of [
  "app-v6.js",
  "phone-gold-runtime",
  "mobile-entry",
  "premiere-entry.js",
  "premiere-stable-controller.js",
]) {
  if (html.includes(forbidden) || controller.includes(forbidden) || finish.includes(forbidden)) {
    throw new Error(`Retired runtime behavior detected: ${forbidden}`);
  }
}
for (const term of [
  "AN EXECUTIVE ENCOUNTERS XEN",
  "What if a company could learn?",
  "Marisol left the position. The department did not.",
  "XEN<br>MEMORY",
  "XEN<br>CORE",
  "Where should Xen prove itself next?",
  "It was proof Xen works.",
]) {
  if (!html.includes(term)) throw new Error(`Nine-scene narrative contract missing: ${term}`);
}
for (const term of [
  "addEventListener('click',begin",
  "progress.style.width",
  "dataset.label",
  "selectedPrinciple.textContent",
  "function reset()",
  "singleOwner:true",
]) {
  if (!controller.includes(term)) throw new Error(`Single-owner controller behavior missing: ${term}`);
}
for (const term of ["height:100dvh", "env(safe-area-inset-bottom)", ".scene.active", "prefers-reduced-motion"]) {
  if (!controllerCss.includes(term)) throw new Error(`Viewport or accessibility contract missing: ${term}`);
}
for (const term of ["MutationObserver", "institutional-memory", "XFS_RELEASE"]) {
  if (!finish.includes(term)) throw new Error(`XFS bounded finish behavior missing: ${term}`);
}
for (const term of ["contain:layout paint", ".institutional-scene", ".inheritance-flow", ".manual-proof"]) {
  if (!finishCss.includes(term)) throw new Error(`XFS compartment styling missing: ${term}`);
}
if (manifest.xen_is_protagonist !== true || manifest.scene_count !== 9) {
  throw new Error("Governance manifest does not preserve the Xen-centric nine-scene release");
}

console.log("PASS current nine-scene production shell, two bounded owners, deterministic navigation, institutional-memory proof, viewport safety, and retired-runtime exclusion");
