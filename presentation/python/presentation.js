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
let chosenQueue = "a"
let queues = { a: [3, 5, 7], b: [10, 20, 30] }

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
    `${String(current + 1).padStart(2, "0")} / 07`
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
    dialogContent.innerHTML = `<div class="source-list">${slide.querySelector(".sources-source").innerHTML}</div><p class="fine">The Python direction is accepted. These detailed designs remain proposed. Research probes do not establish a working Python compiler.</p>`
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

const compilerStages = {
  read: [
    "Read the structure",
    "Capture the two loops, storage declarations and operations. Keep their locations in the source so errors point back to the program.",
    "kernel tiled_scale\n  ports: src, scale, dst\n  sequential loop: 2 tiles\n    storage: tile_in, tile_out\n    load\n    foreach: multiply\n    store",
  ],
  resolve: [
    "Know what every name refers to",
    "Connect each use to its declaration. Keep the outer tile index separate from the inner element index.",
    "src, dst   → external memory ports\nscale      → input scalar\nbase       → tile index: 0 or 16\ni          → element index: 0…15\ntile_in    → local input storage\ntile_out   → local output storage",
  ],
  check: [
    "Check the operations together",
    "Check the element types, transfer shapes and effects. Validate the load before the reads, and the writes before the store.",
    "elements:   Int (signed 32-bit)\nlocal size: 16 elements each\ntransfer:   16 values per tile\nindices:    within declared bounds\norder:      load, compute, store\nerrors:     point back to source",
  ],
  keep: [
    "Keep the meaning explicit",
    "Save a checked program with typed operations and control regions. The reference simulator can then follow these rules.",
    "tiled_scale\n  sequential: base in {0, 16}\n    tile_in, tile_out: SRAM[16]\n    load src[base:base+16]\n    foreach i in [0, 16)\n      multiply Int; write tile_out[i]\n    store dst[base:base+16]",
  ],
}

function selectCompilerStage(name) {
  const [title, copy, code] = compilerStages[name]
  document.querySelector("#compiler-detail-title").textContent = title
  document.querySelector("#compiler-detail-copy").textContent = copy
  document.querySelector("#compiler-detail-code").textContent = code
  document.querySelectorAll("[data-compiler-step]").forEach((button) => {
    const selected = button.dataset.compilerStep === name
    button.classList.toggle("is-selected", selected)
    button.setAttribute("aria-pressed", String(selected))
  })
}

function renderQueues() {
  for (const name of ["a", "b"]) {
    const holder = document.querySelector(`#queue-${name}`)
    holder.replaceChildren(
      ...queues[name].map((value) => {
        const item = document.createElement("span")
        item.className = "queue-item"
        item.textContent = value
        return item
      }),
    )
    if (!queues[name].length) holder.textContent = "Empty"
    holder.setAttribute(
      "aria-label",
      `${name.toUpperCase()}: ${queues[name].join(", ") || "empty"}`,
    )
    document
      .querySelector(`[data-queue-row="${name}"]`)
      .classList.toggle("is-selected", chosenQueue === name)
  }
  document
    .querySelectorAll("button[data-queue]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.queue === chosenQueue)),
    )
  document.querySelector("#queue-step").disabled = queues[chosenQueue].length === 0
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
    showSlide(6, true, true)
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
document
  .querySelectorAll("[data-compiler-step]")
  .forEach((button) =>
    button.addEventListener("click", () => selectCompilerStage(button.dataset.compilerStep)),
  )
document.querySelector("#scale").addEventListener("input", (event) => {
  const scale = Number(event.target.value)
  document.querySelector("#scale-value").textContent = scale
  document.querySelector("#scale-factor").textContent = scale
  document.querySelectorAll("#scaled-values .sample-number").forEach((item, index) => {
    item.textContent = (index + 1) * scale
  })
})
document.querySelectorAll("button[data-queue]").forEach((button) =>
  button.addEventListener("click", () => {
    chosenQueue = button.dataset.queue
    renderQueues()
  }),
)
document.querySelector("#queue-step").addEventListener("click", () => {
  if (!queues[chosenQueue].length) return
  const value = queues[chosenQueue].shift()
  document.querySelector("#queue-result").textContent =
    `Took ${value} from ${chosenQueue.toUpperCase()}. ${chosenQueue === "a" ? "B" : "A"} unchanged.`
  renderQueues()
})
document.querySelector("#queue-reset").addEventListener("click", () => {
  queues = { a: [3, 5, 7], b: [10, 20, 30] }
  document.querySelector("#queue-result").textContent = "No value consumed"
  renderQueues()
})
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopPlayback()
})
document.documentElement.classList.add("js")
renderTile()
renderQueues()
readHash()
