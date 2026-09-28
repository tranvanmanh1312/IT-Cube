const previewGrid = document.querySelector("#previewGrid");
const faceSheets = document.querySelector("#faceSheets");
const sizeSelect = document.querySelector("#sizeSelect");
const printBtn = document.querySelector("#printBtn");

function buildPreview() {
  previewGrid.innerHTML = "";
  for (let face = 1; face <= 6; face += 1) {
    const card = document.createElement("div");
    card.className = "preview-card";
    card.innerHTML =
      `<img src="assets/face-${face}.png" alt="Собранный QR ${face}">` +
      `<strong>QR ${face}</strong>`;
    previewGrid.appendChild(card);
  }
}

function buildSheets() {
  faceSheets.innerHTML = "";

  for (let face = 1; face <= 6; face += 1) {
    const section = document.createElement("section");
    section.className = "face-sheet";

    const title = document.createElement("h2");
    title.textContent = `QR ${face} — 9 фрагментов`;

    const note = document.createElement("p");
    note.textContent =
      `После вырезания: фрагмент 1 → кубик 1, фрагмент 2 → кубик 2, ... фрагмент 9 → кубик 9.`;

    const grid = document.createElement("div");
    grid.className = "sticker-grid";

    for (let tile = 1; tile <= 9; tile += 1) {
      const wrap = document.createElement("div");
      wrap.className = "sticker-wrap";

      const sticker = document.createElement("div");
      sticker.className = "sticker";

      const img = document.createElement("img");
      img.src = `assets/tiles/face-${face}-tile-${tile}.png`;
      img.alt = `QR ${face}, фрагмент ${tile}`;
      sticker.appendChild(img);

      const caption = document.createElement("div");
      caption.className = "caption";
      caption.textContent = `Кубик ${tile}`;

      wrap.append(sticker, caption);
      grid.appendChild(wrap);
    }

    section.append(title, note, grid);
    faceSheets.appendChild(section);
  }
}

sizeSelect.addEventListener("change", () => {
  document.documentElement.style.setProperty("--tile-size", `${sizeSelect.value}mm`);
});

printBtn.addEventListener("click", () => window.print());

buildPreview();
buildSheets();