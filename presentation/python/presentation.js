const slides = [...document.querySelectorAll(".slide")]
const chapters = [...document.querySelectorAll("[data-slide]")]
const dialog = document.querySelector("#detail-dialog")
const dialogContent = document.querySelector("#dialog-content")
const previous = document.querySelector("#previous")
const next = document.querySelector("#next")
let current = 0
let tile = 0
let phase = "load"
let playTimer = null

function stopPlayback() {
  clearInterval(playTimer)
  playTimer = null
  document.querySelector("#play-tile").textContent = "Play"
  document.querySelector("#play-tile").setAttribute("aria-label", "Play tile steps")
}

function showSlide(index, updateHash = true, moveFocus = false) {
  current = Math.max(0, Math.min(slides.length - 1, index))
  stopPlayback()
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
        ? "Research behind this slide"
        : "Presentation controls"
  if (kind === "help") {
    dialogContent.innerHTML =
      '<div class="speaker-script"><p><strong>← / →</strong> Previous or next slide</p><p><strong>1–7</strong> Jump to a slide</p><p><strong>N</strong> Speaker notes &nbsp; <strong>E</strong> Sources</p><p><strong>F</strong> Fullscreen &nbsp; <strong>Esc</strong> Close dialog</p><p>Use the buttons inside the diagrams to explore the proposed behavior. Documentation opens in a separate tab so the presentation keeps its place.</p><p><a href="../../90---Meta/2026-10-01-python-professor-presentation-outline.html" target="_blank" rel="noopener noreferrer">Read the full speaking script ↗</a></p></div>'
  } else if (kind === "notes") {
    dialogContent.innerHTML = `<div class="speaker-script">${slide.querySelector(".notes-source").innerHTML}</div>`
  } else {
    dialogContent.innerHTML = `<div class="source-list">${slide.querySelector(".sources-source").innerHTML}</div><p class="fine">The Python direction is accepted and the initial experiment is authorized. The full architecture remains proposed. Component tests do not establish a complete compiler or hardware result.</p>`
    dialogContent.querySelectorAll("a").forEach((link) => {
      link.target = "_blank"
      link.rel = "noopener noreferrer"
    })
  }
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

const phaseCaptions = {
  load: "Copy this tile from external memory into tile_in.",
  compute: "Multiply each input by 2 and write the result into tile_out.",
  store: "Copy tile_out back to the matching positions in external memory.",
}

function fillCells(id, values, active = false) {
  const holder = document.querySelector(id)
  holder.replaceChildren(
    ...values.map((value) => {
      const cell = document.createElement("span")
      cell.className = `cell${active ? " active" : ""}`
      cell.textContent = value ?? "·"
      return cell
    }),
  )
  holder.setAttribute(
    "aria-label",
    values.every((v) => v === null) ? "Values not yet written" : values.join(", "),
  )
}

function renderTile() {
  const inputs = Array.from({ length: 16 }, (_, i) => tile * 16 + i + 1)
  const outputs = inputs.map((value) => value * 2)
  const blank = Array(16).fill(null)
  fillCells("#src-cells", inputs)
  fillCells("#input-cells", inputs, phase === "load")
  fillCells("#output-cells", phase === "load" ? blank : outputs, phase === "compute")
  fillCells("#dst-cells", phase === "store" ? outputs : blank, phase === "store")
  document.querySelector(".tile-demo").dataset.phase = phase
  document.querySelector("#tile-range").textContent =
    `Values ${tile * 16 + 1}–${tile * 16 + 16} of 32`
  document.querySelector("#phase-caption").textContent = phaseCaptions[phase]
  document
    .querySelectorAll(".code-line")
    .forEach((line) => line.classList.toggle("focus", line.dataset.phase === phase))
  document
    .querySelectorAll("button[data-phase]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.phase === phase)),
    )
  document
    .querySelectorAll("[data-tile]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(Number(button.dataset.tile) === tile)),
    )
}

const mapDialog = document.querySelector("#map-dialog")
const mapViewport = document.querySelector("#map-viewport")
const mapImage = document.querySelector("#map-image")
let mapScale = 1
let mapSection = "overview"
let mapDrag = null
// Coordinates refer to the original Excalidraw SVG, kept at full resolution.
const mapSections = {
  overview: [0, 0, 3400, 550],
  compiler: [0, 580, 2250, 1370],
  execution: [2280, 580, 1120, 1370],
  roadmap: [0, 2400, 3400, 610],
  all: [0, 0, 3400, 3215],
}
function applyMapScale(scale, center = null) {
  const point = center ?? [
    (mapViewport.scrollLeft + mapViewport.clientWidth / 2) / mapScale,
    (mapViewport.scrollTop + mapViewport.clientHeight / 2) / mapScale,
  ]
  mapScale = Math.max(0.08, Math.min(3, scale))
  mapImage.style.width = `${3400 * mapScale}px`
  mapImage.style.height = `${3215 * mapScale}px`
  mapViewport.scrollLeft = point[0] * mapScale - mapViewport.clientWidth / 2
  mapViewport.scrollTop = point[1] * mapScale - mapViewport.clientHeight / 2
  document.querySelector("#map-zoom-value").textContent = `${Math.round(mapScale * 100)}%`
  document.querySelector("#map-out").disabled = mapScale <= 0.08
  document.querySelector("#map-in").disabled = mapScale >= 3
}
function focusMapSection(name) {
  mapSection = name
  const [x, y, w, h] = mapSections[name]
  const widthScale = mapViewport.clientWidth / w
  const scale =
    (name === "all" ? Math.min(widthScale, mapViewport.clientHeight / h) : widthScale) * 0.98
  applyMapScale(scale, [x + w / 2, y + h / 2])
  mapViewport.scrollLeft = x * mapScale
  mapViewport.scrollTop = y * mapScale
  document.querySelectorAll("[data-map-section]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mapSection === name))
  })
}
document.querySelectorAll("[data-open-map]").forEach((button) => {
  button.addEventListener("click", () => {
    stopPlayback()
    mapDialog.showModal()
    focusMapSection("overview")
  })
})
document.querySelectorAll("[data-map-section]").forEach((button) => {
  button.addEventListener("click", () => focusMapSection(button.dataset.mapSection))
})
document.querySelector("#map-close").addEventListener("click", () => mapDialog.close())
mapDialog.addEventListener("click", (event) => {
  if (event.target === mapDialog) mapDialog.close()
})
document.querySelector("#map-in").addEventListener("click", () => applyMapScale(mapScale * 1.35))
document.querySelector("#map-out").addEventListener("click", () => applyMapScale(mapScale / 1.35))
mapDialog.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (["+", "=", "-"].includes(event.key)) {
    event.preventDefault()
    applyMapScale(mapScale * (event.key === "-" ? 1 / 1.35 : 1.35))
  }
})
mapViewport.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return
  mapDrag = [event.clientX, event.clientY, mapViewport.scrollLeft, mapViewport.scrollTop]
  mapViewport.setPointerCapture(event.pointerId)
  mapViewport.classList.add("is-dragging")
  mapViewport.focus({ preventScroll: true })
})
mapViewport.addEventListener("pointermove", (event) => {
  if (!mapDrag) return
  mapViewport.scrollLeft = mapDrag[2] - event.clientX + mapDrag[0]
  mapViewport.scrollTop = mapDrag[3] - event.clientY + mapDrag[1]
})
function endMapDrag() {
  mapDrag = null
  mapViewport.classList.remove("is-dragging")
}
mapViewport.addEventListener("pointerup", endMapDrag)
mapViewport.addEventListener("pointercancel", endMapDrag)
mapViewport.addEventListener("lostpointercapture", endMapDrag)
window.addEventListener("resize", () => {
  if (mapDialog.open) focusMapSection(mapSection)
})
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
    mapDialog.open ||
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
  } else if (/^[1-7]$/.test(event.key)) showSlide(Number(event.key) - 1, true, true)
  else if (event.key.toLowerCase() === "n") openDetails("notes")
  else if (event.key.toLowerCase() === "e") openDetails("sources")
  else if (event.key.toLowerCase() === "f") toggleFullscreen()
  else if (event.key === "?") openDetails("help")
})
document.querySelectorAll("button[data-phase]").forEach((button) =>
  button.addEventListener("click", () => {
    stopPlayback()
    phase = button.dataset.phase
    renderTile()
  }),
)
document.querySelectorAll("[data-tile]").forEach((button) =>
  button.addEventListener("click", () => {
    stopPlayback()
    tile = Number(button.dataset.tile)
    phase = "load"
    renderTile()
  }),
)
document.querySelector("#play-tile").addEventListener("click", () => {
  if (playTimer) {
    stopPlayback()
    return
  }
  phase = "load"
  renderTile()
  document.querySelector("#play-tile").textContent = "Pause"
  document.querySelector("#play-tile").setAttribute("aria-label", "Pause tile steps")
  playTimer = setInterval(() => {
    if (phase === "load") phase = "compute"
    else if (phase === "compute") phase = "store"
    else {
      stopPlayback()
      return
    }
    renderTile()
  }, 1400)
})
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopPlayback()
})
document.documentElement.classList.add("js")
renderTile()
readHash()
