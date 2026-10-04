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

const hostStages = {
  capture: [
    "Read the kernel as text",
    "Freeze the source and its dependencies. Capture does not import the kernel or execute its decorators, annotations or body.",
    'source = Path("lab1.py").read_text(encoding="utf-8")\nunit = SourceUnit(\n    module_id="lab1", text=source, label="lab1.py",\n)\nbundle = CaptureBundle(\n    entry=("lab1", "tiled_scale"), sources=(unit,),\n    dependencies=(), prelude=core_prelude(),\n)\ntemplate = capture(bundle)',
  ],
  specialize: [
    "Choose compile-time parameters",
    "Freeze any meta parameters before checking. This fixed-size tiled example needs no additional bindings.",
    "program = specialize(template, {})",
  ],
  check: [
    "Check the Spatial program",
    "Check types, shapes, names and effects. Continue only when checking returns a valid program.",
    'checked_result = check(\n    program, profile="reference.guarded.v1",\n)\nif isinstance(checked_result, Error):\n    raise RuntimeError(checked_result.diagnostics)\nchecked = checked_result.value',
  ],
  bind: [
    "Bind typed inputs and storage",
    "Prepare a private invocation from the checked program and typed bindings. The full example constructs its input and output Backings explicitly.",
    'bindings = {\n    "src": src.view(access="read"),\n    "scale": ScalarInput.from_int(dtype=Int, value=2),\n    "dst": dst.view(access="write"),\n}\nprepared = prepare(checked, bindings, session=None)\nif isinstance(prepared, Error):\n    raise RuntimeError(prepared.diagnostics)',
  ],
  simulate: [
    "Run the reference simulator",
    "Execute the checked rules with an explicit environment and budget. Waiting, faults and budget stops remain distinct outcomes.",
    "run = simulate(\n    prepared.value,\n    environment=Environment.closed_memory(),\n    budget=Budget(\n        steps=100_000, numeric_work=100_000,\n        trace_bytes=1_048_576,\n    ),\n)",
  ],
  outputs: [
    "Read completed output snapshots",
    "Inspect results only after completion. Read the invocation’s output snapshot; the original host buffer is not the output API.",
    'if run.outcome != "Completed":\n    raise RuntimeError((run.outcome, run.diagnostics))\ngot = run.complete_outputs["dst"].to_ints()\n# Compare all 32 values with an independent answer.',
  ],
}

const architectureViews = {
  simulate: [
    "First: establish the Python behavior",
    "Run the checked operations with explicit state, input data and an environment. Compare completed results and effects with independent expectations.",
    "Checked program\n  + typed inputs\n  + state and environment\n  → Python reference execution\n  → results, effects or diagnostics",
  ],
  plan: [
    "Then: choose a hardware implementation",
    "Derive a checked plan for storage, scheduling and communication. Verify that plan against the same program before emitting HLS.",
    "The same checked program\n  + target capabilities\n  → checked hardware plan\n  → Python plan execution and checks\n  → HLS C++ and hardware validation",
  ],
}

function selectHostStage(name) {
  const [title, copy, code] = hostStages[name]
  document.querySelector("#host-title").textContent = title
  document.querySelector("#host-copy").textContent = copy
  document.querySelector("#host-code").textContent = code
  document.querySelectorAll("[data-host-step]").forEach((button) => {
    const selected = button.dataset.hostStep === name
    button.classList.toggle("is-selected", selected)
    button.setAttribute("aria-pressed", String(selected))
  })
}

function selectArchitecture(name) {
  const [title, copy, code] = architectureViews[name]
  document.querySelector("#architecture-title").textContent = title
  document.querySelector("#architecture-copy").textContent = copy
  document.querySelector("#architecture-code").textContent = code
  document.querySelectorAll("[data-consumer]").forEach((button) => {
    const selected = button.dataset.consumer === name
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
  .querySelectorAll("[data-host-step]")
  .forEach((button) =>
    button.addEventListener("click", () => selectHostStage(button.dataset.hostStep)),
  )
document
  .querySelectorAll("[data-consumer]")
  .forEach((button) =>
    button.addEventListener("click", () => selectArchitecture(button.dataset.consumer)),
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
