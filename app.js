(() => {
  const STORAGE_KEY = "quranHarianOffline.v1";
  const $ = (id) => document.getElementById(id);
  const now = () => new Date();
  const localDate = (date = now()) => {
    const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,"0"), d = String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  };
  const defaultState = () => ({
    lastPage: 1,
    target: 5,
    sessionPages: 5,
    sessionTime: "Subuh",
    reminderTime: "05:00",
    history: [],
    completedSessions: {},
    createdAt: now().toISOString()
  });
  let state = loadState();
  let currentPage = Math.min(604, Math.max(1, Number(state.lastPage) || 1));

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {...defaultState(), ...parsed, history: Array.isArray(parsed.history) ? parsed.history : []};
    } catch { return defaultState(); }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { toast("Penyimpanan penuh atau tidak tersedia. Ekspor cadangan Anda."); }
    renderAll();
  }
  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
  }
  function getJuz(page) { return Math.min(30, Math.max(1, Math.ceil(page / (604/30)))); }
  function dateLabel(dateString) {
    const d = new Date(`${dateString}T12:00:00`);
    return d.toLocaleDateString("id-ID", {day:"numeric", month:"long", year:"numeric"});
  }
  function showView(name) {
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === name));
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === name));
    if (name === "reader") renderReader();
    if (name === "history") renderHistory();
    window.scrollTo({top:0, behavior:"smooth"});
  }
  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.go)));

  function renderReader() {
    $("pageInput").value = currentPage;
    $("juzSelect").value = String(getJuz(currentPage));
    $("pageLabel").textContent = `Halaman ${currentPage} / 604`;
    $("juzLabel").textContent = `Juz ${getJuz(currentPage)}`;
    const holder = $("mushafPage");
    const file = `assets/mushaf/${String(currentPage).padStart(3,"0")}.webp`;
    holder.innerHTML = `<img src="${file}" alt="Mushaf halaman ${currentPage}" onerror="this.remove(); this.parentElement.innerHTML='<div class=&quot;page-ornament&quot;>۞</div><h3>Halaman ${currentPage}</h3><p>Gambar halaman belum tersedia.</p><p>Tambahkan file <code>${String(currentPage).padStart(3,"0")}.webp</code> ke folder <code>assets/mushaf/</code>.</p><p class=&quot;muted&quot;>Pastikan sumber dan halaman mushaf sudah diverifikasi.</p>'">`;
  }
  for (let j=1;j<=30;j++) {
    const option=document.createElement("option"); option.value=String(j); option.textContent=`Juz ${j}`; $("juzSelect").appendChild(option);
  }
  $("juzSelect").addEventListener("change", () => {
    currentPage = Math.min(604, Math.max(1, Math.floor((Number($("juzSelect").value)-1)*(604/30))+1));
    state.lastPage=currentPage; saveState(); renderReader();
  });
  $("openPageBtn").addEventListener("click", () => {
    const value = Number($("pageInput").value);
    if (!Number.isInteger(value) || value < 1 || value > 604) return toast("Masukkan halaman 1 sampai 604.");
    currentPage=value; state.lastPage=currentPage; saveState(); renderReader();
  });
  $("prevPage").addEventListener("click", () => movePage(-1));
  $("nextPage").addEventListener("click", () => movePage(1));
  function movePage(delta) {
    currentPage=Math.min(604,Math.max(1,currentPage+delta)); state.lastPage=currentPage; saveState(); renderReader();
  }
  $("markReadBtn").addEventListener("click", () => {
    const date=localDate();
    state.history.push({date, timestamp:now().toISOString(), startPage:currentPage, endPage:currentPage, pages:1, juz:getJuz(currentPage), session:state.sessionTime});
    state.lastPage=Math.min(604,currentPage+1);
    currentPage=state.lastPage;
    saveState(); renderReader(); toast("Bacaan dicatat dalam riwayat.");
  });

  $("scheduleForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.target=Math.max(1,Math.min(100,Number($("dailyTarget").value)||5));
    state.sessionPages=Math.max(1,Math.min(100,Number($("sessionPages").value)||5));
    state.sessionTime=$("sessionTime").value;
    state.reminderTime=$("reminderTime").value || "05:00";
    saveState(); $("scheduleMessage").textContent="Jadwal tersimpan."; toast("Jadwal berhasil disimpan.");
  });

  function dailyPages(date=localDate()) {
    return state.history.filter(h=>h.date===date).reduce((sum,h)=>sum+(Number(h.pages)||1),0);
  }
  function dayDone(date, slot) { return !!(state.completedSessions[`${date}|${slot}`]); }
  function renderSchedule() {
    const date=localDate(), times=[state.sessionTime];
    if (state.sessionTime!=="Magrib") times.push("Magrib");
    const unique=[...new Set(times)];
    $("todaySchedule").innerHTML="";
    unique.forEach((slot,index)=>{
      const key=`${date}|${slot}`, done=dayDone(date,slot);
      const div=document.createElement("div"); div.className="schedule-item";
      const timeLabel = slot==="Subuh" ? state.reminderTime : ({Pagi:"08:00",Zuhur:"12:00",Asar:"15:30",Magrib:"18:00",Isya:"19:30"}[slot]||"Fleksibel");
      div.innerHTML=`<div class="schedule-time">${timeLabel}</div><div class="schedule-info"><strong>${slot==="Bebas"?"Waktu bebas":"Setelah "+slot}</strong><small>Target ${state.sessionPages} halaman · ${done?"sudah selesai":"jadwal membaca"}</small></div><button class="check-button ${done?"done":""}" data-slot="${slot}">${done?"✓ Selesai":"Tandai selesai"}</button>`;
      div.querySelector("button").addEventListener("click",()=>{
        if(dayDone(date,slot)) { delete state.completedSessions[key]; }
        else {
          state.completedSessions[key]=now().toISOString();
          const start=Math.max(1,Number(state.lastPage)||1), end=Math.min(604,start+state.sessionPages-1);
          state.history.push({date,timestamp:now().toISOString(),startPage:start,endPage:end,pages:end-start+1,juz:getJuz(start),session:slot});
          state.lastPage=Math.min(604,end+1); currentPage=state.lastPage;
        }
        saveState(); toast(done?"Status sesi dibatalkan.":"Sesi dan riwayat berhasil dicatat.");
      });
      $("todaySchedule").appendChild(div);
    });
  }
  function renderDashboard() {
    const pages=dailyPages(), total=state.history.reduce((sum,h)=>sum+(Number(h.pages)||1),0);
    $("lastPageStat").textContent=state.lastPage;
    $("lastJuzStat").textContent=`Juz ${getJuz(state.lastPage)}`;
    $("todayProgress").textContent=`${pages}/${state.target}`;
    $("streakStat").textContent=String(calculateStreak());
    const percent=Math.min(100,Math.round(total/604*100));
    $("overallPercent").textContent=`${percent}%`; $("overallBar").style.width=`${percent}%`;
    $("overallLabel").textContent=`${total} halaman tercatat dari 604 halaman target. Ini berdasarkan catatan Anda, bukan verifikasi bacaan.`;
    renderSchedule();
  }
  function calculateStreak() {
    const dates=new Set(state.history.map(h=>h.date));
    let d=new Date(); let key=localDate(d);
    if(!dates.has(key)){d.setDate(d.getDate()-1);key=localDate(d);if(!dates.has(key))return 0;}
    let count=0;
    while(dates.has(localDate(d))){count++;d.setDate(d.getDate()-1);}
    return count;
  }
  function renderHistory() {
    const list=$("historyList");
    const rows=[...state.history].sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp)));
    $("historySummary").innerHTML=`<span class="summary-chip">${rows.length} catatan</span><span class="summary-chip">${rows.reduce((s,h)=>s+(Number(h.pages)||1),0)} halaman tercatat</span>`;
    list.innerHTML="";
    if(!rows.length){list.innerHTML='<div class="panel"><h3>Belum ada riwayat</h3><p class="muted">Catat halaman yang selesai dibaca untuk melihat riwayat Anda di sini.</p></div>';return;}
    rows.forEach(row=>{
      const d=new Date(row.timestamp);
      const item=document.createElement("div");item.className="history-item";
      item.innerHTML=`<div><strong>${dateLabel(row.date)}</strong><small>${d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})} · ${row.session||"Membaca"} · Juz ${row.juz||getJuz(row.startPage||1)}</small><div class="muted small">Halaman ${row.startPage||"—"}–${row.endPage||row.startPage||"—"}</div></div><div class="history-pages">+${row.pages||1} hlm</div>`;
      list.appendChild(item);
    });
  }
  function renderAll() {
    $("dailyTarget").value=state.target;
    $("sessionPages").value=state.sessionPages;
    $("sessionTime").value=state.sessionTime;
    $("reminderTime").value=state.reminderTime;
    renderDashboard(); renderHistory();
  }
  function download(filename, content, type) {
    const blob=new Blob([content],{type}), url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  $("backupBtn").addEventListener("click",()=>download("cadangan-quran-harian.json",JSON.stringify(state,null,2),"application/json"));
  $("exportHistoryBtn").addEventListener("click",()=>{
    const rows=[["Tanggal","Waktu","Sesi","Halaman awal","Halaman akhir","Jumlah halaman","Juz"],...state.history.map(h=>[h.date,new Date(h.timestamp).toLocaleTimeString("id-ID"),h.session||"",h.startPage||"",h.endPage||"",h.pages||1,h.juz||""])];
    const csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\r\n");
    download("riwayat-bacaan-quran.csv","\ufeff"+csv,"text/csv;charset=utf-8");
  });
  $("restoreInput").addEventListener("change",async(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const imported=JSON.parse(await file.text());
      if(!imported || !Array.isArray(imported.history)) throw new Error("Format cadangan tidak sesuai.");
      state={...defaultState(),...imported};state.lastPage=Math.min(604,Math.max(1,Number(state.lastPage)||1));
      currentPage=state.lastPage;saveState();renderReader();toast("Cadangan berhasil dipulihkan.");
    }catch(err){toast("Tidak bisa memulihkan file. Pastikan memakai cadangan JSON aplikasi.");}
    e.target.value="";
  });
  $("clearHistoryBtn").addEventListener("click",()=>{
    if(!confirm("Hapus semua riwayat bacaan? Tindakan ini tidak bisa dibatalkan. Ekspor cadangan dahulu jika diperlukan."))return;
    state.history=[];state.completedSessions={};saveState();toast("Riwayat telah dihapus.");
  });

  // Service worker only works on localhost or HTTPS (such as GitHub Pages).
  if ("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  }
  renderAll();renderReader();
})();