const slides = [...document.querySelectorAll(".slide")]
const chapterButtons = [...document.querySelectorAll("[data-slide]")]
const previousButton = document.querySelector("#previous")
const nextButton = document.querySelector("#next")
const detailDialog = document.querySelector("#detail-dialog")
const tourDialog = document.querySelector("#tour-dialog")
const tourFrame = document.querySelector("#tour-frame")
const tourSnapshot = document.querySelector("#tour-snapshot")
const tourSnapshotButton = document.querySelector("#tour-snapshot-button")
let currentIndex = 0

function showSlide(index, { updateHash = true, focus = true } = {}) {
  if (index < 0 || index >= slides.length) return
  currentIndex = index
  for (const [position, slide] of slides.entries()) {
    const active = position === index
    slide.classList.toggle("is-active", active)
    slide.setAttribute("aria-hidden", String(!active))
    slide.inert = !active
  }
  chapterButtons.forEach((button) => {
    if (button.dataset.slide === slides[index].id) button.setAttribute("aria-current", "step")
    else button.removeAttribute("aria-current")
  })
  previousButton.disabled = index === 0
  nextButton.disabled = index === slides.length - 1
  document.querySelector("#page-counter").textContent = `${String(index + 1).padStart(2, "0")} / 07`
  document.title = `Spatial — ${slides[index].dataset.label}`
  if (updateHash && location.hash !== `#${slides[index].id}`)
    history.pushState(null, "", `#${slides[index].id}`)
  if (focus) {
    slides[index].querySelector("h1").focus({ preventScroll: true })
    slides[index].scrollTop = 0
    window.scrollTo(0, 0)
  }
}

function followHash(focus = false) {
  const index = slides.findIndex((slide) => `#${slide.id}` === location.hash)
  showSlide(index === -1 ? 0 : index, { updateHash: false, focus })
}

chapterButtons.forEach((button) =>
  button.addEventListener("click", () =>
    showSlide(slides.findIndex((slide) => slide.id === button.dataset.slide)),
  ),
)
previousButton.addEventListener("click", () => showSlide(currentIndex - 1))
nextButton.addEventListener("click", () => showSlide(currentIndex + 1))
window.addEventListener("hashchange", () => followHash(true))
followHash()
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault()
  slides[currentIndex].querySelector("h1").focus()
})

function showDetails(kind) {
  const slide = slides[currentIndex]
  document.querySelector("#detail-kind").textContent =
    kind === "notes" ? "SPEAKER NOTES" : "SOURCES AND LIMITS"
  document.querySelector("#detail-title").textContent = slide.dataset.label
  document
    .querySelector("#detail-body")
    .replaceChildren(document.querySelector(`#${kind}-${slide.id}`).content.cloneNode(true))
  detailDialog.showModal()
  detailDialog.scrollTop = 0
}
document.querySelector("#notes-button").addEventListener("click", () => showDetails("notes"))
document.querySelector("#sources-button").addEventListener("click", () => showDetails("sources"))
document
  .querySelectorAll("[data-open-sources]")
  .forEach((button) => button.addEventListener("click", () => showDetails("sources")))
document
  .querySelectorAll("[data-close]")
  .forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()))
for (const dialog of [detailDialog, tourDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return
    const box = dialog.getBoundingClientRect()
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close()
  })
}

const captions = {
  read: "Capture source structure, literal tokens, and locations. Do not execute the kernel.",
  check: "Rust resolves names, constants, types, and hardware legality in one place.",
  use: "The same checked program feeds exact simulation and structural HLS generation.",
}
document.querySelectorAll("button[data-stage]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelector("#architecture-diagram").dataset.stage = button.dataset.stage
    document
      .querySelectorAll("button[data-stage]")
      .forEach((step) => step.setAttribute("aria-pressed", String(step === button)))
    document.querySelector("#stage-caption").textContent = captions[button.dataset.stage]
  }),
)

const docPaths = {
  brief: "../20---Research-Notes/50---Decision-Records/D-26-professor-brief.html",
  mapping: "../35---Python-Surface-Mapping/00---Python-Mapping-Overview.html",
  spec: "../10---Spec/00---Spec-Index.html",
}
function openDoc(key) {
  tourSnapshot.hidden = true
  tourSnapshotButton.textContent = "Show saved preview"
  tourFrame.hidden = false
  tourFrame.src = docPaths[key]
  document.querySelector("#tour-external").href = docPaths[key]
  document
    .querySelectorAll("[data-doc]")
    .forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.doc === key)))
}
document.querySelector("#preview-button").addEventListener("click", () => {
  tourDialog.showModal()
  openDoc("brief")
})
document
  .querySelectorAll("[data-doc]")
  .forEach((button) => button.addEventListener("click", () => openDoc(button.dataset.doc)))
tourSnapshotButton.addEventListener("click", () => {
  const show = tourSnapshot.hidden
  tourSnapshot.hidden = !show
  tourFrame.hidden = show
  tourSnapshotButton.textContent = show ? "Return to live page" : "Show saved preview"
})
if (!["localhost", "127.0.0.1", ""].includes(location.hostname)) {
  document.querySelector(".preview-label").textContent = "Documentation"
  document.querySelector("#tour-status").textContent = "Documentation site"
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    document.querySelector("#detail-kind").textContent = "DISPLAY"
    document.querySelector("#detail-title").textContent = "Fullscreen unavailable"
    document.querySelector("#detail-body").textContent =
      "Use your browser’s fullscreen command, or present in the current window."
    detailDialog.showModal()
  }
}
const fullscreenButton = document.querySelector("#fullscreen-button")
fullscreenButton.addEventListener("click", toggleFullscreen)
document.addEventListener("fullscreenchange", () =>
  fullscreenButton.setAttribute(
    "aria-label",
    document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen",
  ),
)

function showHelp() {
  document.querySelector("#detail-kind").textContent = "CONTROLS"
  document.querySelector("#detail-title").textContent = "Keyboard shortcuts"
  document.querySelector("#detail-body").innerHTML =
    '<div class="shortcut-list"><span><kbd>←</kbd> <kbd>→</kbd></span><span>Previous / next screen</span><span><kbd>Space</kbd></span><span>Next screen</span><span><kbd>1</kbd>–<kbd>7</kbd></span><span>Go to a screen</span><span><kbd>N</kbd></span><span>Speaker notes</span><span><kbd>E</kbd></span><span>Sources</span><span><kbd>F</kbd></span><span>Fullscreen</span><span><kbd>Esc</kbd></span><span>Close a panel</span></div><p>Use Read, Check, and Use on the architecture screen to highlight each stage. The full diagram stays visible.</p>'
  detailDialog.showModal()
}
document.querySelector("#help-button").addEventListener("click", showHelp)
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return
  if (detailDialog.open || tourDialog.open) return
  if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return
  const key = event.key.toLowerCase()
  if (key === " " && event.target.closest("button, a")) return
  if (["arrowright", "pagedown", " "].includes(key)) {
    event.preventDefault()
    showSlide(currentIndex + 1)
  } else if (["arrowleft", "pageup"].includes(key)) {
    event.preventDefault()
    showSlide(currentIndex - 1)
  } else if (/^[1-7]$/.test(key)) showSlide(Number(key) - 1)
  else if (key === "home") {
    event.preventDefault()
    showSlide(0)
  } else if (key === "end") {
    event.preventDefault()
    showSlide(slides.length - 1)
  } else if (key === "n") showDetails("notes")
  else if (key === "e") showDetails("sources")
  else if (key === "f") toggleFullscreen()
  else if (key === "?") showHelp()
})
