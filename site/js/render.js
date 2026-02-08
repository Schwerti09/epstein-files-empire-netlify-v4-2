import { apiGet, apiPost, fmtDate, esc, faviconUrl, safeImg, getToken, clearToken } from "./api.js";

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function setActiveNav() {
  const path = location.pathname.replace(/\/$/, "");
  qsa(".nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (href && (href === path || (href !== "/" && path.startsWith(href)))) a.classList.add("active");
  });
}

function setTopbar() {
  const d = new Date();
  const el = qs("#today");
  if (el) el.textContent = d.toLocaleDateString("de-DE", { weekday:"long", year:"numeric", month:"long", day:"2-digit" });

  const token = getToken();
  const st = qs("#authState");
  if (st) st.textContent = token ? "Premium aktiv" : "Gast";

  const lo = qs("#logoutBtn");
  if (lo) {
    lo.style.display = token ? "inline-flex" : "none";
    lo.addEventListener("click", (e) => {
      e.preventDefault();
      clearToken();
      location.href = "/";
    });
  }
}

function renderThumb(d) {
  const img = safeImg(d.image_url);
  if (img) return `<div class="thumb"><img src="${esc(img)}" alt=""></div>`;
  const fav = faviconUrl(d.source_url);
  return `<div class="thumb"><div class="fallback"><img src="${esc(fav)}" alt=""></div></div>`;
}

async function loadHome() {
  const data = await apiGet("/api/documents?limit=18");
  if (!data.success) throw new Error(data.error || "API failed");
  const docs = data.data || [];

  const lead = docs[0];
  const secondary = docs.slice(1,5);
  const list = docs.slice(5, 13);
  const sidebar = docs.slice(13, 18);

  const leadEl = qs("#lead");
  leadEl.innerHTML = lead ? renderLead(lead) : `<div class="card pad"><div class="alert">Noch keine Daten. Öffne <a href="/admin.html">Admin</a> → Quellen hinzufügen → Ingest.</div></div>`;

  qs("#secondary").innerHTML = secondary.map(renderSecondary).join("");
  qs("#latestList").innerHTML = list.map(renderListItem).join("");
  qs("#sidebarList").innerHTML = sidebar.map(renderSidebarItem).join("");

  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").trim();
  if (q) {
    qs("#searchInput").value = q;
    const search = await apiGet(`/api/documents?q=${encodeURIComponent(q)}&limit=6`);
    const hasPremiumMatch = (search.data || []).some(x => x.has_premium_match);
    if (hasPremiumMatch && !getToken()) {
      qs("#premiumMatch").style.display = "block";
      qs("#premiumMatchQuery").textContent = q;
    }
  }
}

function renderLead(d) {
  return `
  <div class="card">
    <div class="media" style="padding:16px">
      ${renderThumb(d)}
      <div>
        <div class="kicker">Top Story</div>
        <div class="h1"><a href="/article.html?slug=${encodeURIComponent(d.slug)}">${esc(d.title)}</a></div>
        <div class="meta">
          <span>${esc(d.source_name || "Quelle")}</span>
          <span>·</span>
          <span>${fmtDate(d.published_at)}</span>
        </div>
        <div class="p">${esc(d.public_summary || d.excerpt || "").slice(0, 280)}${(d.public_summary || d.excerpt || "").length>280?"…":""}</div>
        <div class="tags">${(d.tags||[]).slice(0,6).map(t=>`<span class="tag"><strong>#</strong>${esc(t)}</span>`).join("")}</div>
      </div>
    </div>
  </div>`;
}

function renderSecondary(d){
  return `
  <div class="card pad">
    <div class="media">
      ${renderThumb(d)}
      <div>
        <div class="kicker">Analyse</div>
        <div class="h3"><a href="/article.html?slug=${encodeURIComponent(d.slug)}">${esc(d.title)}</a></div>
        <div class="meta"><span>${esc(d.source_name||"")}</span><span>·</span><span>${fmtDate(d.published_at)}</span></div>
        <div class="p small muted">${esc(d.public_summary || d.excerpt || "").slice(0,160)}${(d.public_summary||d.excerpt||"").length>160?"…":""}</div>
      </div>
    </div>
  </div>`;
}

function renderListItem(d){
  return `
  <div class="item">
    <div class="media">
      ${renderThumb(d)}
      <div>
        <div class="kicker">Neu</div>
        <div class="title"><a href="/article.html?slug=${encodeURIComponent(d.slug)}">${esc(d.title)}</a></div>
        <div class="meta"><span>${esc(d.source_name||"")}</span><span>·</span><span>${fmtDate(d.published_at)}</span></div>
        <div class="p small muted">${esc(d.excerpt || "").slice(0,170)}${(d.excerpt||"").length>170?"…":""}</div>
        <div class="tags">${(d.tags||[]).slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
    </div>
  </div>`;
}

function renderSidebarItem(d){
  return `
  <div class="item">
    <div class="title"><a href="/article.html?slug=${encodeURIComponent(d.slug)}">${esc(d.title)}</a></div>
    <div class="meta"><span>${fmtDate(d.published_at)}</span></div>
  </div>`;
}

function hookSearch() {
  const form = qs("#searchForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = qs("#searchInput").value.trim();
    if (!q) return;
    location.href = `/search.html?q=${encodeURIComponent(q)}`;
  });
}

function hookSubscribeButtons() {
  qsa("[data-subscribe]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const old = btn.textContent;
      btn.textContent = "Weiterleitung…";
      const out = await apiPost("/api/checkout", {});
      if (out?.url) location.href = out.url;
      else {
        alert(out?.error || "Checkout fehlgeschlagen");
        btn.textContent = old || "Premium freischalten";
      }
    });
  });
}

export async function boot(page) {
  setActiveNav();
  setTopbar();
  hookSearch();
  hookSubscribeButtons();
  if (page === "home") await loadHome();
}
