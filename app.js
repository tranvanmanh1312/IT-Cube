const FACE_COUNT = 6;
const STORAGE_KEY = "kubit-3x3-final-state-v1";
const LAST_WORD_KEY = "kubit-3x3-last-word-v1";

const WORDS = [
  { word: "CODING", meaning: "написание программного кода" },
  { word: "PYTHON", meaning: "язык программирования Python" },
  { word: "BINARY", meaning: "двоичная система представления данных" },
  { word: "SCRIPT", meaning: "небольшая программа или сценарий" },
  { word: "MATRIX", meaning: "матрица данных или математических элементов" },
  { word: "SIGNAL", meaning: "сигнал, передающий информацию" },
  { word: "VECTOR", meaning: "вектор — структура данных и математический объект" },
  { word: "CLIENT", meaning: "клиент, обращающийся к серверу" },
  { word: "OBJECT", meaning: "объект в объектно-ориентированном программировании" },
  { word: "STREAM", meaning: "поток данных" },
  { word: "PIXELS", meaning: "пиксели цифрового изображения" },
  { word: "SOCKET", meaning: "программный интерфейс сетевого соединения" },
  { word: "THREAD", meaning: "поток выполнения программы" },
  { word: "CIPHER", meaning: "шифр для преобразования информации" },
  { word: "MODULE", meaning: "модуль программы" },
  { word: "SOURCE", meaning: "исходный код или источник данных" },
  { word: "PACKET", meaning: "пакет данных в компьютерной сети" },
  { word: "SEARCH", meaning: "поиск информации или данных" }
];

const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--.."
};

const els = {
  startRoundBtn: document.querySelector("#startRoundBtn"),
  newRoundTopBtn: document.querySelector("#newRoundTopBtn"),
  newRoundBtn: document.querySelector("#newRoundBtn"),
  introPanel: document.querySelector("#introPanel"),
  gamePanel: document.querySelector("#gamePanel"),
  roundId: document.querySelector("#roundId"),
  progressText: document.querySelector("#progressText"),
  timerText: document.querySelector("#timerText"),
  faceProgress: document.querySelector("#faceProgress"),
  cameraVideo: document.querySelector("#cameraVideo"),
  cameraPlaceholder: document.querySelector("#cameraPlaceholder"),
  cameraStatus: document.querySelector("#cameraStatus"),
  openCameraBtn: document.querySelector("#openCameraBtn"),
  closeCameraBtn: document.querySelector("#closeCameraBtn"),
  scanCanvas: document.querySelector("#scanCanvas"),
  repairCanvas: document.querySelector("#repairCanvas"),
  scanMessage: document.querySelector("#scanMessage"),
  testQrSelect: document.querySelector("#testQrSelect"),
  testOpenBtn: document.querySelector("#testOpenBtn"),
  taskQrBadge: document.querySelector("#taskQrBadge"),
  taskEmpty: document.querySelector("#taskEmpty"),
  taskContent: document.querySelector("#taskContent"),
  difficultyBadge: document.querySelector("#difficultyBadge"),
  taskType: document.querySelector("#taskType"),
  taskBox: document.querySelector("#taskBox"),
  scanNextBtn: document.querySelector("#scanNextBtn"),
  openedList: document.querySelector("#openedList"),
  finalPanel: document.querySelector("#finalPanel"),
  finalLocked: document.querySelector("#finalLocked"),
  finalReady: document.querySelector("#finalReady"),
  finalWordInput: document.querySelector("#finalWordInput"),
  checkWordBtn: document.querySelector("#checkWordBtn"),
  finalFeedback: document.querySelector("#finalFeedback"),
  completedPanel: document.querySelector("#completedPanel"),
  completeText: document.querySelector("#completeText")
};

let state = null;
let mediaStream = null;
let scanning = false;
let scanLoopId = null;
let lastScanAt = 0;
let currentFace = null;
let timerId = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function chooseWord() {
  const last = localStorage.getItem(LAST_WORD_KEY);
  const candidates = WORDS.filter(item => item.word !== last);
  const selected = candidates[randomInt(0, candidates.length - 1)];
  localStorage.setItem(LAST_WORD_KEY, selected.word);
  return selected;
}

function shiftLetter(letter, shift) {
  const n = letter.charCodeAt(0) - 65;
  return String.fromCharCode(65 + ((n + shift + 26) % 26));
}

function atbash(letter) {
  return String.fromCharCode(90 - (letter.charCodeAt(0) - 65));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const challengeFactories = [
  {
    id: "morse",
    difficulty: "Легко",
    type: "Азбука Морзе",
    build(letter) {
      const code = MORSE[letter].replaceAll(".", "·").replaceAll("-", "—");
      return {
        html:
          `Расшифруйте один символ азбуки Морзе:\n\n` +
          `<code>${code}</code>\n\n` +
          `Какая английская буква здесь зашифрована?`
      };
    }
  },
  {
    id: "binary",
    difficulty: "Легко",
    type: "Binary → ASCII",
    build(letter) {
      const n = letter.charCodeAt(0);
      return {
        html:
          `Дано двоичное число:\n\n` +
          `<code>${n.toString(2).padStart(8, "0")}</code>\n\n` +
          `Переведите его в десятичную систему и определите символ ASCII.\n` +
          `Подсказка: заглавные A–Z имеют ASCII-коды 65–90.`
      };
    }
  },
  {
    id: "caesar",
    difficulty: "Средне",
    type: "Шифр Цезаря",
    build(letter) {
      const shift = randomInt(2, 7);
      const encrypted = shiftLetter(letter, shift);
      return {
        html:
          `Исходную букву сдвинули на <strong>+${shift}</strong> позиций по английскому алфавиту.\n\n` +
          `Получили: <code>${encrypted}</code>\n\n` +
          `Сделайте обратный сдвиг и найдите исходную букву.`
      };
    }
  },
  {
    id: "atbash",
    difficulty: "Легко",
    type: "Atbash",
    build(letter) {
      return {
        html:
          `Используйте зеркальный английский алфавит:\n\n` +
          `<code>A ↔ Z, B ↔ Y, C ↔ X ...</code>\n\n` +
          `Зашифрованная буква: <code>${atbash(letter)}</code>\n\n` +
          `Найдите исходный символ.`
      };
    }
  },
  {
    id: "hex",
    difficulty: "Средне",
    type: "HEX → ASCII",
    build(letter) {
      const hex = letter.charCodeAt(0).toString(16).toUpperCase();
      return {
        html:
          `Дан шестнадцатеричный ASCII-код:\n\n` +
          `<code>0x${hex}</code>\n\n` +
          `Переведите HEX в десятичное число, затем определите английскую букву.`
      };
    }
  },
  {
    id: "python",
    difficulty: "Средне",
    type: "Python",
    build(letter) {
      const code = letter.charCodeAt(0);
      const plus = randomInt(4, 11);
      return {
        html:
          `Определите, какой символ напечатает программа:\n` +
          `<span class="codeblock">x = ${code + plus}\nx = x - ${plus}\nprint(chr(x))</span>` +
          `Функция <code>chr()</code> превращает ASCII-код в символ.`
      };
    }
  },
  {
    id: "order",
    difficulty: "Средне",
    type: "Соберите алгоритм",
    build(letter) {
      const code = letter.charCodeAt(0);
      const delta = randomInt(3, 9);
      const lines = shuffle([
        `value = ${code + delta}`,
        `value = value - ${delta}`,
        `print(chr(value))`
      ]);
      return {
        html:
          `Строки Python перемешаны. Расставьте их мысленно в правильном порядке:\n\n` +
          lines.map((line, i) => `<code>${i + 1}. ${escapeHtml(line)}</code>`).join("\n") +
          `\n\nКакую английскую букву напечатает программа?`
      };
    }
  },
  {
    id: "logic",
    difficulty: "Сложнее",
    type: "Логика + ASCII",
    build(letter) {
      const code = letter.charCodeAt(0);
      const a = randomInt(2, 6);
      const b = randomInt(2, 5);
      const start = code - a * b;
      return {
        html:
          `Выполните вычисление и определите ASCII-символ:\n` +
          `<span class="codeblock">n = ${start}\nfor i in range(${b}):\n    n = n + ${a}\nprint(chr(n))</span>` +
          `Какую букву получим после выполнения цикла?`
      };
    }
  },
  {
    id: "xor",
    difficulty: "Сложнее",
    type: "XOR",
    build(letter) {
      const code = letter.charCodeAt(0);
      const mask = randomInt(1, 15);
      const encrypted = code ^ mask;
      return {
        html:
          `Данные были преобразованы операцией XOR:\n\n` +
          `<code>encrypted = ${encrypted}</code>\n` +
          `<code>mask = ${mask}</code>\n\n` +
          `Вычислите <code>encrypted XOR mask</code> и переведите результат в ASCII.\n` +
          `Подсказка: повторный XOR той же маской восстанавливает исходное число.`
      };
    }
  }
];

function buildRound() {
  const selected = chooseWord();

  // The six letters are intentionally shuffled.
  // Students must solve all six tasks, then make the IT word themselves.
  const letters = shuffle(selected.word.split(""));

  const easy = shuffle(challengeFactories.filter(x => x.difficulty === "Легко")).slice(0, 2);
  const medium = shuffle(challengeFactories.filter(x => x.difficulty === "Средне")).slice(0, 3);
  const hard = shuffle(challengeFactories.filter(x => x.difficulty === "Сложнее")).slice(0, 1);
  const methods = shuffle([...easy, ...medium, ...hard]);

  const faces = {};
  for (let i = 0; i < FACE_COUNT; i += 1) {
    const faceId = i + 1;
    const method = methods[i];
    const letter = letters[i];
    const task = method.build(letter);

    faces[faceId] = {
      id: faceId,
      payload: `KUBIT:FACE:${faceId}`,
      opened: false,
      letter,            // intentionally never rendered in the UI
      type: method.type,
      difficulty: method.difficulty,
      html: task.html
    };
  }

  return {
    roundId: `R-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    word: selected.word,
    meaning: selected.meaning,
    startedAt: Date.now(),
    finishedAt: null,
    finalAttempts: 0,
    faces
  };
}

function saveState() {
  if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.faces || !parsed?.word || parsed.word.length !== 6) return null;
    return parsed;
  } catch {
    return null;
  }
}

function showGame() {
  els.introPanel.classList.add("hidden");
  els.gamePanel.classList.remove("hidden");
  els.startRoundBtn.classList.add("hidden");
  els.newRoundTopBtn.classList.remove("hidden");
}

function startNewRound() {
  stopCamera();
  state = buildRound();
  currentFace = null;
  saveState();
  showGame();
  renderAll();
  resetTaskPanel();
  startTimer();
  window.scrollTo({ top: els.gamePanel.offsetTop - 14, behavior: "smooth" });
}

function openedCount() {
  return Object.values(state.faces).filter(face => face.opened).length;
}

function renderAll() {
  if (!state) return;

  els.roundId.textContent = state.roundId;
  els.progressText.textContent = `${openedCount()} / 6`;
  renderFaceProgress();
  renderOpenedList();

  const allOpened = openedCount() === 6;
  els.finalPanel.classList.toggle("locked", !allOpened);
  els.finalLocked.classList.toggle("hidden", allOpened || Boolean(state.finishedAt));
  els.finalReady.classList.toggle("hidden", !allOpened || Boolean(state.finishedAt));
  els.completedPanel.classList.toggle("hidden", !state.finishedAt);

  if (state.finishedAt) {
    const seconds = Math.floor((state.finishedAt - state.startedAt) / 1000);
    els.completeText.textContent =
      `${state.word} — ${state.meaning}. Время: ${formatTime(seconds)}.`;
  }
}

function renderFaceProgress() {
  els.faceProgress.innerHTML = "";
  for (let i = 1; i <= 6; i += 1) {
    const face = state.faces[i];
    const button = document.createElement("button");
    button.className = `face-card ${face.opened ? "opened" : ""}`;
    button.type = "button";
    button.innerHTML = face.opened
      ? `QR ${i}<small>ОТКРЫТ</small>`
      : `QR ${i}<small>НЕ ОТКРЫТ</small>`;
    if (face.opened) {
      button.addEventListener("click", () => showTask(i));
    } else {
      button.disabled = true;
    }
    els.faceProgress.appendChild(button);
  }
}

function renderOpenedList() {
  els.openedList.innerHTML = "";
  const opened = Object.values(state.faces).filter(face => face.opened);

  if (!opened.length) {
    const p = document.createElement("p");
    p.className = "opened-empty";
    p.textContent = "Пока нет открытых заданий.";
    els.openedList.appendChild(p);
    return;
  }

  opened.forEach(face => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opened-task-btn";
    btn.textContent = `QR ${face.id} · ${face.type}`;
    btn.addEventListener("click", () => showTask(face.id));
    els.openedList.appendChild(btn);
  });
}

function resetTaskPanel() {
  currentFace = null;
  els.taskQrBadge.textContent = "QR не открыт";
  els.taskContent.classList.add("hidden");
  els.taskEmpty.classList.remove("hidden");
  els.taskEmpty.innerHTML =
    `<div class="question-mark">?</div><p>Когда QR будет собран и считан, здесь появится задание.</p>`;
}

function handleDecoded(payload) {
  if (!state || state.finishedAt) return;

  const match = String(payload).trim().toUpperCase().match(/^KUBIT:FACE:([1-6])$/);
  if (!match) {
    setScanMessage("Этот код не относится к игре КубIT.", false);
    return;
  }

  const faceId = Number(match[1]);
  const face = state.faces[faceId];

  if (!face.opened) {
    face.opened = true;
    saveState();
    renderAll();
    setScanMessage(`QR ${faceId} собран правильно! Задание открыто.`, true);
  } else {
    setScanMessage(`QR ${faceId} уже был открыт. Показываю то же задание.`, true);
  }

  showTask(faceId);
  stopCamera();

  setTimeout(() => {
    document.querySelector("#taskPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  }, 150);
}

function showTask(faceId) {
  if (!state?.faces?.[faceId]?.opened) return;

  currentFace = faceId;
  const face = state.faces[faceId];

  els.taskQrBadge.textContent = `QR ${faceId}`;
  els.difficultyBadge.textContent = face.difficulty;
  els.taskType.textContent = face.type;
  els.taskBox.innerHTML = face.html;

  els.taskEmpty.classList.add("hidden");
  els.taskContent.classList.remove("hidden");
}

function goScanNext() {
  resetTaskPanel();

  if (openedCount() === 6) {
    els.finalPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => els.finalWordInput.focus(), 350);
    return;
  }

  document.querySelector("#scannerPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  openCamera();
}

function checkFinalWord() {
  if (!state || openedCount() !== 6) return;

  const guess = els.finalWordInput.value.trim().toUpperCase();
  if (!/^[A-Z]{6}$/.test(guess)) {
    els.finalFeedback.textContent = "Введите ровно 6 английских букв.";
    els.finalFeedback.className = "final-feedback error";
    return;
  }

  state.finalAttempts += 1;

  if (guess === state.word) {
    state.finishedAt = Date.now();
    saveState();
    stopTimer();
    els.finalFeedback.textContent = "Правильно!";
    els.finalFeedback.className = "final-feedback ok";
    renderAll();
    els.finalPanel.classList.add("hidden");
    els.completedPanel.classList.remove("hidden");
    els.completedPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    saveState();
    els.finalFeedback.textContent =
      "Неверно. Проверьте все 6 полученных букв, переставьте их и попробуйте ещё раз.";
    els.finalFeedback.className = "final-feedback error";
    els.finalWordInput.select();
  }
}

function setScanMessage(text, ok = null) {
  els.scanMessage.textContent = text;
  els.scanMessage.className = "scan-message";
  if (ok === true) els.scanMessage.classList.add("ok");
  if (ok === false) els.scanMessage.classList.add("error");
}

/* -------------------- Camera + seam-tolerant 3×3 QR scan --------------------
   The physical QR is split over 9 cube faces.
   A tiny gap between cubes can break a normal QR scan.
   We therefore try the raw frame AND several "repaired" frames where
   two vertical and two horizontal seam bands are removed and the 9 cells
   are stitched back together before passing the image to jsQR.
------------------------------------------------------------------------- */

async function openCamera() {
  if (!state || state.finishedAt || scanning) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    setScanMessage("Этот браузер не поддерживает доступ к камере.", false);
    return;
  }

  if (typeof jsQR !== "function") {
    setScanMessage("Модуль распознавания QR не загрузился. Проверьте интернет-соединение.", false);
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 1280 }
      }
    });

    els.cameraVideo.srcObject = mediaStream;
    await els.cameraVideo.play();

    scanning = true;
    els.cameraPlaceholder.classList.add("hidden");
    els.openCameraBtn.classList.add("hidden");
    els.closeCameraBtn.classList.remove("hidden");
    els.cameraStatus.textContent = "сканирование";
    setScanMessage("Совместите внешний квадрат 3×3 с рамкой и держите камеру ровно.");

    lastScanAt = 0;
    scanLoopId = requestAnimationFrame(scanLoop);
  } catch (error) {
    setScanMessage(
      "Не удалось открыть камеру. Разрешите доступ и используйте HTTPS или localhost.",
      false
    );
    els.cameraStatus.textContent = "нет доступа";
  }
}

function stopCamera() {
  scanning = false;

  if (scanLoopId) {
    cancelAnimationFrame(scanLoopId);
    scanLoopId = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  if (els.cameraVideo.srcObject) {
    els.cameraVideo.srcObject = null;
  }

  els.cameraPlaceholder.classList.remove("hidden");
  els.openCameraBtn.classList.remove("hidden");
  els.closeCameraBtn.classList.add("hidden");
  els.cameraStatus.textContent = "камера выключена";
}

function scanLoop(timestamp) {
  if (!scanning) return;

  if (timestamp - lastScanAt > 360) {
    lastScanAt = timestamp;
    processVideoFrame();
  }

  if (scanning) scanLoopId = requestAnimationFrame(scanLoop);
}

function processVideoFrame() {
  const video = els.cameraVideo;
  if (!video.videoWidth || !video.videoHeight) return;

  const canvas = els.scanCanvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const size = 600;

  // The on-screen guide occupies 86% of the visible square.
  // Crop the same central region from the video.
  const sourceSide = Math.min(video.videoWidth, video.videoHeight) * 0.86;
  const sx = (video.videoWidth - sourceSide) / 2;
  const sy = (video.videoHeight - sourceSide) / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(video, sx, sy, sourceSide, sourceSide, 0, 0, size, size);

  // First try an ordinary scan. Then repair possible seams.
  const gapGuesses = [0, 2, 4, 6, 8, 10, 12, 16, 20];

  for (const gap of gapGuesses) {
    const candidate = gap === 0 ? canvas : makeRepairedCanvas(canvas, gap);
    const cctx = candidate.getContext("2d", { willReadFrequently: true });
    const imageData = cctx.getImageData(0, 0, candidate.width, candidate.height);

    const result = jsQR(
      imageData.data,
      candidate.width,
      candidate.height,
      { inversionAttempts: "attemptBoth" }
    );

    if (result?.data && /^KUBIT:FACE:[1-6]$/i.test(result.data.trim())) {
      handleDecoded(result.data.trim());
      return;
    }
  }
}

function makeRepairedCanvas(source, gap) {
  const W = source.width;
  const H = source.height;

  // Assume two equal internal gaps.
  const tileW = (W - 2 * gap) / 3;
  const tileH = (H - 2 * gap) / 3;

  const outW = Math.max(300, Math.round(tileW * 3));
  const outH = Math.max(300, Math.round(tileH * 3));
  const out = els.repairCanvas;
  out.width = outW;
  out.height = outH;

  const octx = out.getContext("2d", { willReadFrequently: true });
  octx.clearRect(0, 0, outW, outH);

  const destTileW = outW / 3;
  const destTileH = outH / 3;

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const sx = col * (tileW + gap);
      const sy = row * (tileH + gap);

      octx.drawImage(
        source,
        sx, sy, tileW, tileH,
        col * destTileW, row * destTileH, destTileW, destTileH
      );
    }
  }

  return out;
}

function startTimer() {
  stopTimer();

  const update = () => {
    if (!state) return;
    const end = state.finishedAt || Date.now();
    const seconds = Math.max(0, Math.floor((end - state.startedAt) / 1000));
    els.timerText.textContent = formatTime(seconds);
  };

  update();
  timerId = setInterval(update, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

els.startRoundBtn.addEventListener("click", startNewRound);
els.newRoundTopBtn.addEventListener("click", startNewRound);
els.newRoundBtn.addEventListener("click", startNewRound);
els.openCameraBtn.addEventListener("click", openCamera);
els.closeCameraBtn.addEventListener("click", stopCamera);
els.scanNextBtn.addEventListener("click", goScanNext);
els.checkWordBtn.addEventListener("click", checkFinalWord);
els.testOpenBtn.addEventListener("click", () => handleDecoded(els.testQrSelect.value));

els.finalWordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") checkFinalWord();
});

window.addEventListener("beforeunload", stopCamera);

const saved = loadState();
if (saved) {
  state = saved;
  showGame();
  renderAll();
  resetTaskPanel();
  if (!state.finishedAt) startTimer();
}
