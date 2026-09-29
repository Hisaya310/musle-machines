(() => {
  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const search = document.getElementById("search");
  const count = document.getElementById("count");
  const dialog = document.getElementById("detail");
  const player = document.getElementById("player");

  document.getElementById("playlist").href = PLAYLIST_URL;

  let current = "all";

  const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const pad = (n) => String(n).padStart(2, "0");

  // 部位フィルター
  Object.entries(CATEGORIES).forEach(([key, label]) => {
    if (key !== "all" && key !== "hammer" && !MACHINES.some((m) => m.category === key)) return;
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = label;
    b.setAttribute("aria-pressed", key === current);
    b.onclick = () => {
      current = key;
      filters.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
      render();
    };
    filters.appendChild(b);
  });

  function render() {
    const q = search.value.trim().toLowerCase();
    const list = MACHINES.filter((m) => {
      if (current === "hammer") { if (!m.brand) return false; }
      else if (current !== "all" && m.category !== current) return false;
      if (!q) return true;
      return (m.name + m.target + CATEGORIES[m.category] + (m.brand || "") + "ハンマー".repeat(m.brand ? 1 : 0)).toLowerCase().includes(q);
    });

    count.textContent = `${list.length} 件`;
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = '<li class="empty">該当するマシンがありません</li>';
      return;
    }
    list.forEach((m) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="card" type="button">
          <div class="thumb">
            <img src="${thumb(m.videoId)}" alt="${m.name}" loading="lazy" />
            ${m.credit ? '<span class="no ref">参考動画</span>' : `<span class="no">No.${pad(m.no)}</span>`}
            <span class="play" aria-hidden="true"></span>
          </div>
          <div class="info">
            <h2>${m.name}</h2>
            <p class="tag">${m.target}</p>${m.brand ? `<p class="brand">${m.brand}</p>` : ""}
          </div>
        </button>`;
      li.querySelector("button").onclick = () => open(m);
      grid.appendChild(li);
    });
  }

  function open(m) {
    player.src = `https://www.youtube-nocookie.com/embed/${m.videoId}?rel=0&playsinline=1`;
    document.getElementById("d-name").textContent = m.name;
    document.getElementById("d-target").textContent = m.target;
    document.getElementById("d-steps").innerHTML = m.steps.map((s) => `<li>${s}</li>`).join("");
    document.getElementById("d-tips").textContent = m.tips;
    const cr = document.getElementById("d-credit");
    cr.textContent = m.credit ? `動画：${m.credit}（他のジム・トレーナーによる参考動画です。店舗のマシンと形が違う場合があります）` : "";
    cr.hidden = !m.credit;
    document.getElementById("d-yt").href = `https://www.youtube.com/watch?v=${m.videoId}`;
    dialog.showModal();
  }

  const close = () => dialog.close();
  document.getElementById("close").onclick = close;
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener("close", () => { player.src = ""; }); // 閉じたら動画を止める

  search.addEventListener("input", render);
  render();
})();
