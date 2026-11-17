const slides = [...document.querySelectorAll(".slide")]
const chapters = [...document.querySelectorAll("[data-slide]")]
const dialog = document.querySelector("#detail-dialog")
const dialogContent = document.querySelector("#dialog-content")
const previous = document.querySelector("#previous")
const next = document.querySelector("#next")
const SCRIPT_URL =
  "https://davidydu.github.io/spatial-research-site/90---Meta/2026-11-16-compiler-efficiency-presentation"
let current = 0

document.documentElement.classList.add("js")

function showSlide(index, updateHash = true, moveFocus = false) {
  current = Math.max(0, Math.min(slides.length - 1, index))
  slides.forEach((slide, i) => {
    slide.hidden = i !== current
    slide.classList.toggle("is-active", i === current)
  })
  chapters.forEach((button, i) => {
    if (i === current) button.setAttribute("aria-current", "step")
    else button.removeAttribute("aria-current")
  })
  previous.disabled = current === 0
  next.disabled = current === slides.length - 1
  document.querySelector("#slide-count").textContent =
    `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`
  document.querySelector(".progress-fill").style.width = `${((current + 1) / slides.length) * 100}%`
  if (updateHash) history.replaceState(null, "", `#${slides[current].id}`)
  if (moveFocus) slides[current].querySelector("h1").focus({ preventScroll: true })
  slides[current].scrollTop = 0
  window.scrollTo({ top: 0, behavior: "instant" })
}

function readHash() {
  const index = slides.findIndex((slide) => `#${slide.id}` === location.hash)
  showSlide(index < 0 ? 0 : index, false)
}

function openDetails(kind) {
  const slide = slides[current]
  document.querySelector("#dialog-title").textContent =
    kind === "notes"
      ? `${String(current + 1).padStart(2, "0")} / ${slide.dataset.label} · ${slide.dataset.time}`
      : kind === "sources"
        ? "Evidence behind this slide"
        : "Presentation controls"
  if (kind === "help") {
    dialogContent.innerHTML = `<div class="speaker-script"><p><strong>← / →</strong> Previous or next slide</p><p><strong>1–${slides.length}</strong> Jump to a slide</p><p><strong>N</strong> Speaker notes &nbsp; <strong>E</strong> Evidence</p><p><strong>F</strong> Fullscreen &nbsp; <strong>Esc</strong> Close dialog</p><p>Every number on a slide is a saved measurement; the evidence links open in a separate tab so the presentation keeps its place.</p><p><a href="${SCRIPT_URL}">Read the full speaking script ↗</a></p></div>`
  } else if (kind === "notes") {
    dialogContent.innerHTML = `<div class="speaker-script">${slide.querySelector(".notes-source").innerHTML}</div>`
  } else {
    dialogContent.innerHTML = `<div class="source-list">${slide.querySelector(".sources-source").innerHTML}</div><p class="fine">Measurements are dated 13 to 16 November 2026. The compiler repository is private; its evidence pages are named here by path.</p>`
  }
  dialogContent.querySelectorAll("a").forEach((link) => {
    link.target = "_blank"
    link.rel = "noopener noreferrer"
  })
  if (!dialog.open) dialog.showModal()
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    document.querySelector("#dialog-title").textContent = "Fullscreen"
    dialogContent.innerHTML =
      '<p class="speaker-script">Fullscreen is unavailable in this browser. You can still present using the normal window and arrow keys.</p>'
    if (!dialog.open) dialog.showModal()
  }
}

chapters.forEach((button, index) =>
  button.addEventListener("click", () => showSlide(index, true, true)),
)
previous.addEventListener("click", () => showSlide(current - 1, true, true))
next.addEventListener("click", () => showSlide(current + 1, true, true))
window.addEventListener("hashchange", readHash)
document.querySelector("#notes-button").addEventListener("click", () => openDetails("notes"))
document.querySelector("#sources-button").addEventListener("click", () => openDetails("sources"))
document.querySelector("#help-button").addEventListener("click", () => openDetails("help"))
document.querySelector("#dialog-close").addEventListener("click", () => dialog.close())
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close()
})
document.querySelector("#fullscreen-button").addEventListener("click", toggleFullscreen)
document.addEventListener("fullscreenchange", () => {
  document.querySelector("#fullscreen-button").textContent = document.fullscreenElement
    ? "Exit fullscreen"
    : "Fullscreen"
})
document.addEventListener("keydown", (event) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    dialog.open ||
    event.target.closest("input, textarea, select, [contenteditable='true']")
  )
    return
  if (event.target.closest("button, a") && [" ", "Enter"].includes(event.key)) return
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault()
    showSlide(current + 1, true, true)
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault()
    showSlide(current - 1, true, true)
  } else if (event.key === "Home") {
    event.preventDefault()
    showSlide(0, true, true)
  } else if (event.key === "End") {
    event.preventDefault()
    showSlide(slides.length - 1, true, true)
  } else if (/^[1-9]$/.test(event.key) && Number(event.key) <= slides.length)
    showSlide(Number(event.key) - 1, true, true)
  else if (event.key.toLowerCase() === "n") openDetails("notes")
  else if (event.key.toLowerCase() === "e") openDetails("sources")
  else if (event.key.toLowerCase() === "f") toggleFullscreen()
  else if (event.key === "?") openDetails("help")
})
readHash()
