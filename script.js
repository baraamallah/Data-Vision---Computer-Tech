document.addEventListener("DOMContentLoaded", function () {
  let GLOBAL_SPEED = 1.2;
  let hits = 0, miss = 0, taskId = 1;
  let queueCount = 0;
  let cpuCrashed = false;
  const addTasksBtn = document.getElementById("addTasksBtn");
  const resetBtn = document.getElementById("resetBtn");
  const taskContainer = document.getElementById("taskContainer");
  const infoPanel = document.getElementById("infoPanel");
  const cpuDisplay = document.getElementById("cpuUsage");
  const cpuStatusEl = document.getElementById("cpuStatus");
  const queueDisplay = document.getElementById("queueCount");
  const hitsDisplay = document.getElementById("hits");
  const missDisplay = document.getElementById("miss");
  const diagram = document.querySelector(".diagram");
  const components = document.querySelectorAll(".component");
  const cpuComponent = document.querySelector(".component.cpu");

  // Populate tooltips from data-tooltip
  components.forEach((c) => {
    const tip = c.querySelector(".tooltip");
    if (tip && c.dataset.tooltip) tip.textContent = c.dataset.tooltip;
  });

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms / GLOBAL_SPEED));
  }

  document.getElementById("speedControl").addEventListener("change", function () {
    GLOBAL_SPEED = parseFloat(this.value);
  });

  function getPos(percX, percY) {
    const rect = diagram.getBoundingClientRect();
    const w = rect.width - 48;
    const h = rect.height - 48;
    return { left: (percX / 100) * w, top: (percY / 100) * h };
  }

  function setBlockPos(block, x, y) {
    const { left, top } = getPos(x, y);
    block.style.left = left + "px";
    block.style.top = top + "px";
  }

  function highlightComponent(name) {
    components.forEach((c) => c.classList.remove("active"));
    const el = document.querySelector(`.component.${name}`);
    if (el) el.classList.add("active");
  }

  function clearHighlight() {
    components.forEach((c) => c.classList.remove("active"));
  }

  function updateQueue() {
    queueDisplay.textContent = queueCount;
  }

  function crashCPU() {
    if (cpuCrashed) return;
    cpuCrashed = true;
    cpuComponent.classList.add("crashed");
    cpuComponent.querySelector(".label").textContent = "CRASHED";
    cpuDisplay.textContent = "—";
    cpuStatusEl.textContent = "⚠ crashed";
    resetBtn.classList.remove("hidden");
    addTasksBtn.disabled = true;
    infoPanel.innerHTML = `<strong>CPU crashed</strong> — overloaded. Click <strong>Recover CPU</strong> to reset.`;
  }

  function recoverCPU() {
    cpuCrashed = false;
    cpuComponent.classList.remove("crashed");
    cpuComponent.querySelector(".label").textContent = "CPU";
    cpuDisplay.textContent = "0%";
    cpuStatusEl.textContent = "";
    resetBtn.classList.add("hidden");
    addTasksBtn.disabled = false;
    queueCount = 0;
    updateQueue();
    document.querySelectorAll(".data-block").forEach((b) => b.remove());
    infoPanel.innerHTML = `CPU recovered. Click <strong>Add Tasks</strong> to run tasks again.`;
  }

  resetBtn.addEventListener("click", recoverCPU);

  async function runTask(taskBlock, id) {
    if (cpuCrashed) return;
    queueCount++;
    updateQueue();

    const diskType = document.getElementById("diskType").value;
    const diskMs = diskType === "SSD" ? 500 : 1200;

    // Positions (estimated percentages based on new layout)
    const POS = {
      DISK: { x: 10, y: 12 },
      RAM: { x: 74, y: 12 },
      CACHE: { x: 42, y: 45 },
      DECODE: { x: 10, y: 78 },
      EXECUTE: { x: 74, y: 78 }
    };

    // 1. Initial State: Request Start
    taskBlock.classList.remove("ram-color", "disk-color", "cache-color", "decode-color", "cpu-color");
    taskBlock.classList.add("disk-color");
    setBlockPos(taskBlock, POS.DISK.x, POS.DISK.y);
    highlightComponent("disk");
    infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — Start: CPU requests an instruction.`;
    await wait(500);

    // 2. Loading to RAM (Simplified: assume it must be in RAM first)
    taskBlock.classList.remove("disk-color");
    taskBlock.classList.add("ram-color");
    highlightComponent("ram");
    setBlockPos(taskBlock, POS.RAM.x, POS.RAM.y);
    infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — Loading: Program code is loaded from Disk to RAM.`;
    await wait(diskMs);

    // 3. FETCH & Cache Check
    infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — Fetching: Checking CPU Cache...`;
    const isHit = Math.random() < 0.6; // 60% hit rate for demo

    // Move to Cache for check
    taskBlock.classList.remove("ram-color");
    taskBlock.classList.add("cache-color");
    highlightComponent("cache");
    setBlockPos(taskBlock, POS.CACHE.x, POS.CACHE.y);
    await wait(600);

    if (isHit) {
      hits++;
      hitsDisplay.textContent = hits;
      infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — <span style="color:var(--ram)">CACHE HIT!</span> Data found in Cache.`;
    } else {
      miss++;
      missDisplay.textContent = miss;
      infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — <span style="color:var(--disk)">CACHE MISS.</span> Fetching from RAM...`;
      // Brief visual "bounce" back to RAM on miss
      setBlockPos(taskBlock, POS.RAM.x, POS.RAM.y);
      await wait(400);
      setBlockPos(taskBlock, POS.CACHE.x, POS.CACHE.y);
      await wait(400);
    }

    // 4. DECODE
    if (cpuCrashed) { queueCount--; updateQueue(); taskBlock.remove(); return; }
    taskBlock.classList.remove("cache-color");
    taskBlock.classList.add("decode-color");
    highlightComponent("decode");
    setBlockPos(taskBlock, POS.DECODE.x, POS.DECODE.y);
    infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — Decode: Control Unit interprets the operation.`;
    await wait(800);

    // 5. EXECUTE (ALU)
    if (cpuCrashed) { queueCount--; updateQueue(); taskBlock.remove(); return; }
    taskBlock.classList.remove("decode-color");
    taskBlock.classList.add("cpu-color");
    highlightComponent("cpu");
    setBlockPos(taskBlock, POS.EXECUTE.x, POS.EXECUTE.y);

    const load = Math.floor(Math.random() * 25 + 60);
    cpuDisplay.textContent = load + "%";
    infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — Execute: ALU performing task (Load: ${load}%).`;

    // CPU can crash: higher chance when load > 80% and queue > 2
    const crashChance = load >= 85 ? 0.12 : load >= 75 ? 0.06 : 0.02;
    if (Math.random() < crashChance && !cpuCrashed) {
      await wait(400);
      crashCPU();
      queueCount--;
      updateQueue();
      taskBlock.remove();
      return;
    }
    await wait(1000);

    clearHighlight();
    infoPanel.innerHTML = `<strong>Instruction ${id}</strong> — Completed.`;
    await wait(300);

    queueCount--;
    updateQueue();
    taskBlock.remove();

    if (queueCount === 0 && !cpuCrashed) {
      infoPanel.innerHTML = `All instructions processed. Click <strong>Add Tasks</strong> to run more.`;
    }
  }

  addTasksBtn.addEventListener("click", function () {
    if (cpuCrashed) return;
    const count = Math.min(10, Math.max(1, parseInt(document.getElementById("taskCount").value) || 3));

    for (let i = 0; i < count; i++) {
      const id = taskId++;
      setTimeout(() => {
        if (cpuCrashed) return;
        const block = document.createElement("div");
        block.className = "data-block disk-color";
        block.textContent = id;
        taskContainer.appendChild(block);
        setBlockPos(block, 10, 12);
        runTask(block, id);
      }, i * 800);
    }

    infoPanel.innerHTML = `Queued <strong>${count}</strong> instruction(s). Flow: RAM → Cache (Hit/Miss) → Decode → Execute`;
  });

  // Hover always updates info panel with component description (tooltip content)
  components.forEach((c) => {
    c.addEventListener("mouseenter", function () {
      const desc = this.dataset.tooltip;
      if (desc && !cpuCrashed) infoPanel.innerHTML = desc;
    });
    c.addEventListener("mouseleave", function () {
      if (!cpuCrashed && queueCount === 0) infoPanel.innerHTML = `Click <strong>Add Tasks</strong> to launch tasks. Watch the <strong>Fetch → Decode → Execute</strong> cycle in action.`;
    });
  });
});
