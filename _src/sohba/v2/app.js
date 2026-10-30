(function(){
const L = window.LESSONS.filter(l => l.video), T = window.TAGS, C = window.CHANNELS; /* الحلقات اللي لسه ما نزلتش على يوتيوب مش بتظهر */
const TEN = ["abu-bakr","umar","uthman","ali","talha","zubayr","saad","abd-rahman","abu-ubayda","said"];
const ORDER = [...TEN, "ibn-amr","saad-muadh","anas-nadr","amr-jamuh","abu-dujana","ibn-masud","hudhayfa","marthad","musab","kaab","ibn-umar"];
const DUR = {"ibn-amr":"٥٧ د","saad-muadh":"٥٩ د","anas-nadr":"٤٤ د","amr-jamuh":"٥٠ د","abu-dujana":"٥٦ د","ibn-masud":"٥٤ د","hudhayfa":"١:١٩ س","marthad":"٤٦ د","musab":"١:٠٤ س"};
const FAM = Object.assign({}, window.FAMILY, window.TEN_FAMILY);
const partsOf = l => l.parts || (l.video ? [{video:l.video, dur:DUR[l.id]||"", intro:l.summary&&l.summary.intro, points:l.summary&&l.summary.points, status:l.summary&&l.summary.status}] : []);
const durOf = l => { const p = partsOf(l); return p.length > 1 ? ar(p.length) + " مجالس" : (p[0] && p[0].dur) || ""; };
const byId = Object.fromEntries(L.map(l => [l.id, l]));
const list = ORDER.filter(id => byId[id]).map(id => byId[id]).concat(L.filter(l => !ORDER.includes(l.id)));
const ar = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmtT = t => { const h=Math.floor(t/3600), m=Math.floor(t%3600/60), x=t%60; return ar((h? h+":"+String(m).padStart(2,"0") : m)+":"+String(x).padStart(2,"0")); };
const yt = (id, t) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}${t ? "&t=" + t + "s" : ""}`;
const gradeName = { g:"صحيح أو حسن", y:"سيرة أو رُوي", r:"لا يثبت", n:"كلام أهل العلم" };
const group = l => l.links.includes("khazraj") || l.links.includes("aws") ? "ansar" : l.links.includes("muhajir") ? "muhajir" : "other";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const view = document.getElementById("view");
let filter = "all", sim = null;

function setNav(v){ document.querySelectorAll(".nav a").forEach(a => a.dataset.v === v ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current")); }

/* ---------- الرئيسية ---------- */
const SHOW = 6; let showAll = false, moreCount = 0;
const moreHTML = () => moreCount > SHOW ? `<button class="more-btn" id="moreBtn" type="button" aria-expanded="${showAll}">${showAll ? "عرض أقل" : "شاهد كل الدروس (" + ar(moreCount) + ")"}</button>` : "";
function rowsHTML(){
  const rows = list.filter(l => filter === "all" || (filter === "ten" ? l.ten : group(l) === filter)); moreCount = rows.length;
  return rows.slice(0, showAll ? rows.length : SHOW).map((l) => {
    const n = list.indexOf(l) + 1;
    const v0 = (partsOf(l)[0]||{}).video; return `<li><a class="row" href="#${l.id}"${v0 ? ` data-thumb="${esc(v0)}"` : ""}><span class="no">${ar(String(n).padStart(2,"0"))}</span><span class="nm">${esc(l.name)}${markHTML(l)}</span><span class="q">${esc(l.title)}</span>${l.video ? `<span class="dur">${durOf(l)}</span>` : `<span class="soon">من التحضير</span>`}</a></li>`;
  }).join("");
}
/* ---------- تقدّم الزائر: يُحفظ في متصفحه فقط، بلا تسجيل ---------- */
const PKEY = "ms-progress-v1";
const prog = (() => { try { return new Set(JSON.parse(localStorage.getItem(PKEY) || "[]")); } catch(e) { return new Set(); } })();
const saveProg = () => { try { localStorage.setItem(PKEY, JSON.stringify([...prog])); } catch(e) {} };
const UNITS = list.filter(l => l.video).flatMap(l => partsOf(l).map((p, j) => l.id + ":" + j));
const doneOf = l => partsOf(l).filter((p, j) => prog.has(l.id + ":" + j)).length;
const fullDone = l => !!l.video && doneOf(l) === partsOf(l).length;
const doneN = () => UNITS.filter(u => prog.has(u)).length;
const allOf = ids => ids.length > 0 && ids.every(l => fullDone(l));
const MEDAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h3l1 5-2.5 1zM16 2h-3l-1 5 2.5 1z" class="rb"/><circle cx="12" cy="15" r="6.5" class="cd"/><path d="M12 11.2l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" class="st"/></svg>';
const BADGES = [
  {id:"first", t:"الخطوة الأولى", d:"أنهيت أول مجلس", ok: () => doneN() >= 1},
  {id:"ten", t:"مع العشرة", d:"أنهيت دروس العشرة المبشرين بالجنة", ok: () => allOf(L.filter(l => l.ten))},
  {id:"muhajir", t:"مع المهاجرين", d:"أنهيت دروس المهاجرين", ok: () => allOf(L.filter(l => group(l) === "muhajir"))},
  {id:"ansar", t:"مع الأنصار", d:"أنهيت دروس الأنصار", ok: () => allOf(L.filter(l => !l.ten && group(l) !== "muhajir"))},
  {id:"half", t:"نصف الطريق", d:"أنهيت نصف المجالس", ok: () => doneN() * 2 >= UNITS.length},
  {id:"all", t:"أتممت السلسلة", d:"أنهيت كل المجالس المنشورة", ok: () => doneN() === UNITS.length}
];
const earned = () => BADGES.filter(b => b.ok()).map(b => b.id);
function nextUp(){ for (const l of list) { if (!l.video) continue; const P = partsOf(l); for (let j = 0; j < P.length; j++) if (!prog.has(l.id + ":" + j)) return {l, j, n: P.length}; } return null; }
function progHTML(){
  const n = doneN(), T = UNITS.length, pct = Math.round(n / T * 100), nx = nextUp(), got = new Set(earned());
  const nxt = nx ? `<a class="pg-next" href="#${nx.l.id}">${n ? "أكمل" : "ابدأ"}: ${esc(nx.l.name)}${nx.n > 1 ? `، المجلس ${ar(nx.j + 1)}` : ""} ←</a>` : "";
  return `<section class="prog" aria-label="رحلتك مع الصحابة">
    <div class="pg-top"><div><span class="eyebrow">رحلتك مع الصحابة</span>
      <p class="pg-line">${n ? `أنهيت <b>${ar(n)}</b> من ${ar(T)} مجلسًا` : `لم تبدأ بعد. اسمع أي مجلس، ثم اضغط «أنهيت هذا المجلس» في آخره ليظهر تقدّمك هنا.`}</p></div>
      ${n ? `<div class="pg-pct" aria-hidden="true">${ar(pct)}٪</div>` : ""}</div>
    <div class="pg-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="نسبة ما أنهيت"><i style="width:${pct}%"></i></div>
    <div class="pg-foot">${nxt}<ul class="pg-badges">${BADGES.map(b => `<li class="${got.has(b.id) ? "on" : ""}" title="${esc(b.t)}: ${esc(b.d)}">${MEDAL}<span>${esc(b.t)}</span></li>`).join("")}</ul></div>
    <p class="pg-note ui">يُحفظ تقدّمك في هذا المتصفح فقط.</p>
  </section>`;
}
const markHTML = l => { if (!l.video) return ""; const d = doneOf(l), t = partsOf(l).length; return d === t ? `<span class="mk done" title="أنهيته">✓</span>` : d ? `<span class="mk part" title="أنهيت ${ar(d)} من ${ar(t)}">${ar(d)}/${ar(t)}</span>` : ""; };
function toast(html){ let t = document.getElementById("msToast"); if (!t) { t = document.createElement("div"); t.id = "msToast"; t.className = "ms-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.innerHTML = html; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 4200); }
function doneBtnHTML(l, pi){ const k = l.id + ":" + pi, on = prog.has(k), many = partsOf(l).length > 1;
  return `<button class="done-btn${on ? " on" : ""}" type="button" data-k="${k}" aria-pressed="${on}">${on ? `✓ أنهيت ${many ? "هذا المجلس" : "هذا الدرس"}` : `أنهيت ${many ? "هذا المجلس" : "هذا الدرس"}`}</button>`; }
function wireDone(root, l, pi){ const b = root.querySelector(".done-btn"); if (!b) return;
  b.onclick = () => { const before = new Set(earned()), k = b.dataset.k; prog.has(k) ? prog.delete(k) : prog.add(k); saveProg();
    b.outerHTML = doneBtnHTML(l, pi); wireDone(root, l, pi);
    const tab = root.querySelector(`.part[data-p="${pi}"]`); if (tab) tab.classList.toggle("is-done", prog.has(k));
    const nb = BADGES.filter(x => x.ok() && !before.has(x.id));
    if (nb.length) toast(`<span class="tm">${MEDAL}</span><span><b>وسام جديد: ${esc(nb[0].t)}</b><br>${esc(nb[0].d)}</span>`);
    else if (prog.has(k)) { const n = doneN(); toast(`<span><b>بارك الله فيك</b><br>أنهيت ${ar(n)} من ${ar(UNITS.length)} مجلسًا (${ar(Math.round(n / UNITS.length * 100))}٪)</span>`); } }; }
/* ---------- زر الأسئلة والاقتراحات ---------- */
const FB_MAIL = "mustphawy@gmail.com", FB_TO = "https://formsubmit.co/ajax/" + FB_MAIL;
const W3F_KEY = "355b8bbf-ac14-4dfb-972f-97338149895e"; /* مفتاح Web3Forms: يُرسل أولًا إن وُجد، وFormSubmit احتياطي */
function initFeedback(){
  if (document.getElementById("fbFab")) return;
  const fab = document.createElement("button"); fab.id = "fbFab"; fab.className = "fb-fab"; fab.type = "button"; fab.setAttribute("aria-haspopup", "dialog");
  fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 8h7M8.5 11.5h4.5"/></svg><span>أسئلة واقتراحات</span>';
  const dlg = document.createElement("dialog"); dlg.id = "fbDlg"; dlg.className = "fb-dlg"; dlg.setAttribute("aria-labelledby", "fbT");
  dlg.innerHTML = `<form class="fb-form" novalidate>
    <div class="fb-head"><h3 id="fbT">أسئلة واقتراحات</h3><p>اسأل، أو اقترح فكرة درس أو تحسينًا للموقع، وسيصلك الرد على بريدك إن شاء الله.</p><button class="fb-x" type="button" aria-label="إغلاق">✕</button></div>
    <div class="fb-body">
      <fieldset class="fb-type"><legend>نوع الرسالة</legend>${["سؤال","اقتراح","فكرة درس"].map((t, i) => `<label><input type="radio" name="type" value="${t}" ${i ? "" : "checked"}><span>${t}</span></label>`).join("")}</fieldset>
      <label class="fb-f"><span>الاسم <em>(اختياري)</em></span><input name="name" type="text" autocomplete="name" maxlength="80"></label>
      <label class="fb-f"><span>البريد الإلكتروني <em class="req">(مطلوب لنرد عليك)</em></span><input name="email" type="email" autocomplete="email" inputmode="email" required dir="ltr" placeholder="name@example.com"></label>
      <label class="fb-f"><span>رسالتك</span><textarea name="message" rows="5" required maxlength="3000"></textarea></label>
      <input class="fb-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="fb-err" role="alert" hidden></p>
      <a class="fb-mail" hidden>أرسلها من بريدك</a>
      <button class="fb-send" type="submit">إرسال</button>
    </div>
    <div class="fb-ok" hidden><b>وصلت رسالتك، جزاك الله خيرًا.</b><p>سنرد عليك على بريدك قريبًا إن شاء الله.</p><button class="fb-send fb-close2" type="button">إغلاق</button></div>
  </form>`;
  document.body.append(fab, dlg);
  const f = dlg.querySelector("form"), err = dlg.querySelector(".fb-err"), send = dlg.querySelector(".fb-send");
  const mail = dlg.querySelector(".fb-mail");
  const reset = () => { f.reset(); err.hidden = true; mail.hidden = true; dlg.querySelector(".fb-body").hidden = false; dlg.querySelector(".fb-ok").hidden = true; send.disabled = false; send.textContent = "إرسال"; };
  fab.onclick = () => { reset(); dlg.showModal(); setTimeout(() => f.message.focus(), 50); };
  dlg.querySelector(".fb-x").onclick = () => dlg.close(); dlg.querySelector(".fb-close2").onclick = () => dlg.close();
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  f.onsubmit = async e => { e.preventDefault(); err.hidden = true;
    const email = f.email.value.trim(), msg = f.message.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = "اكتب بريدًا إلكترونيًّا صحيحًا حتى نستطيع الرد عليك."; err.hidden = false; f.email.focus(); return; }
    if (msg.length < 3) { err.textContent = "اكتب رسالتك أولًا."; err.hidden = false; f.message.focus(); return; }
    if (f._honey.value) return;
    send.disabled = true; send.textContent = "جارٍ الإرسال…";
    const type = f.type.value;
    const name = f.name.value.trim() || "(لم يكتب اسمه)", subject = `مع الصحابة: ${type} جديد`;
    const post = async (url, data) => { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({})); if (!r.ok || j.success === false || j.success === "false") throw 0; };
    const tries = [];
    if (W3F_KEY) tries.push(() => post("https://api.web3forms.com/submit", { access_key: W3F_KEY, subject, from_name: "مع الصحابة", "النوع": type, "الاسم": name, email, "الرسالة": msg, "الصفحة": location.href }));
    tries.push(() => post(FB_TO, { "النوع": type, "الاسم": name, email, "الرسالة": msg, "الصفحة": location.href, _subject: subject, _template: "table", _captcha: "false", _replyto: email }));
    for (const t of tries) { try { await t(); dlg.querySelector(".fb-body").hidden = true; dlg.querySelector(".fb-ok").hidden = false; return; } catch(x) {} }
    err.textContent = "تعذّر الإرسال من الموقع الآن. يمكنك إرسال رسالتك نفسها من بريدك:"; err.hidden = false;
    mail.href = `mailto:${FB_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${type}\nالاسم: ${name}\nالبريد: ${email}\n\n${msg}\n\n${location.href}`)}`;
    mail.hidden = false; send.disabled = false; send.textContent = "إعادة المحاولة"; };
}

/* المشاركة: زر للحلقة وزر للموقع، ونافذة واحدة بخيارات المشاركة */
const SITE = "https://www.ma3elsahaba.com";
const SH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg>';
const shareBtnHTML = (kind, id) => `<button class="share-btn" type="button" data-share="${kind}"${id ? ` data-id="${id}"` : ""}>${SH_ICON}<span>${kind === "ep" ? "شارك الحلقة، ودُلَّ على الخير" : "شارك الموقع، ودُلَّ على الخير"}</span></button>`;
function shareData(kind, id){
  if (kind === "ep" && byId[id]) { const l = byId[id];
    return { url: `${SITE}/${id}/`, title: `${l.name} | مع الصحابة`, text: `${l.name}: ${l.title}\nحلقة من سلسلة «مع الصحابة» مع أ. مصطفى خالد` }; }
  return { url: SITE + "/", title: "مع الصحابة", text: "«مع الصحابة»: دروس عن رجال صحبوا النبي ﷺ، نتعلم من سِيَرهم كيف تلقّوا هذا الدين" };
}
function initShare(){
  if (document.getElementById("shDlg")) return;
  const dlg = document.createElement("dialog"); dlg.id = "shDlg"; dlg.className = "sh-dlg"; dlg.setAttribute("aria-labelledby", "shT");
  dlg.innerHTML = `<div class="sh-in">
    <button class="fb-x sh-x" type="button" aria-label="إغلاق">✕</button>
    <h3 id="shT"></h3>
    <p class="sh-h">قال رسول الله ﷺ: «مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ» <small>رواه مسلم (١٨٩٣)</small></p>
    <button class="sh-native" type="button" hidden>${SH_ICON}<span>مشاركة من جهازك</span></button>
    <div class="sh-grid">
      <a data-net="wa" target="_blank" rel="noopener">واتساب</a>
      <a data-net="tg" target="_blank" rel="noopener">تليجرام</a>
      <a data-net="fb" target="_blank" rel="noopener">فيسبوك</a>
      <a data-net="x" target="_blank" rel="noopener">إكس</a>
    </div>
    <div class="sh-copy"><input type="text" readonly dir="ltr" aria-label="الرابط"><button type="button">نسخ الرابط</button></div>
  </div>`;
  document.body.append(dlg);
  dlg.querySelector(".sh-x").onclick = () => dlg.close();
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  document.addEventListener("click", e => { const b = e.target.closest("[data-share]"); if (!b) return; e.preventDefault(); openShare(b.dataset.share, b.dataset.id); });
}
function openShare(kind, id){
  const dlg = document.getElementById("shDlg"), d = shareData(kind, id), msg = d.text + "\n" + d.url, E = encodeURIComponent;
  dlg.querySelector("#shT").textContent = kind === "ep" ? "شارك الحلقة، ودُلَّ على الخير" : "شارك الموقع، ودُلَّ على الخير";
  const links = { wa: `https://wa.me/?text=${E(msg)}`, tg: `https://t.me/share/url?url=${E(d.url)}&text=${E(d.text)}`, fb: `https://www.facebook.com/sharer/sharer.php?u=${E(d.url)}`, x: `https://x.com/intent/post?text=${E(d.text)}&url=${E(d.url)}` };
  dlg.querySelectorAll("[data-net]").forEach(a => a.href = links[a.dataset.net]);
  const inp = dlg.querySelector(".sh-copy input"), cb = dlg.querySelector(".sh-copy button"); inp.value = d.url; cb.textContent = "نسخ الرابط";
  cb.onclick = async () => { try { await navigator.clipboard.writeText(d.url); } catch(x) { inp.select(); document.execCommand("copy"); } cb.textContent = "نُسخ ✓"; };
  const nb = dlg.querySelector(".sh-native"); nb.hidden = !navigator.share;
  nb.onclick = async () => { try { await navigator.share({ title: d.title, text: d.text, url: d.url }); dlg.close(); } catch(x) {} };
  dlg.showModal();
}
function home(){
  const LATEST = "ibn-amr"; /* آخر حلقة نزلت على القناة */
  const latest = byId[LATEST] || list.find(l => l.video), lp = partsOf(latest)[0];
  view.innerHTML = `<div class="view">
  <section class="hero">
    <div><h1>مع الصحابة</h1>
      <p class="lede">دروس عن رجال صحبوا النبي ﷺ، وبذلوا الغالي والنفيس من أجل هذا الدين. نصحبهم في سِيَرهم، ونتعلم كيف تلقّوا هذا الدين، وماذا فعلوا مع النبي ﷺ.</p><div class="eyebrow by">تحت إشراف أ. مصطفى خالد</div>${shareBtnHTML("site")}</div>
    <a class="latest" href="#${latest.id}">${lp ? `<span class="lcover"><img src="https://i.ytimg.com/vi/${encodeURIComponent(lp.video)}/hqdefault.jpg" alt="" onerror="this.parentNode.remove()"><span class="play" aria-hidden="true"></span></span>` : ""}<span class="eyebrow">أحدث حلقة · ${durOf(latest)}</span>
      <div class="nm">${esc(latest.name)}</div><p class="q">${esc(latest.title)}</p>
</a>
  </section>
  ${progHTML()}
  <section class="sec ten-sec">
    <div class="sec-h"><h2>العشرة المبشرون بالجنة</h2><p class="ui ten-note">«أبو بكر في الجنة، وعمر في الجنة...» رواه الترمذي عن عبد الرحمن بن عوف</p></div>
    <ol class="ten-grid">${TEN.filter(id => byId[id]).map((id,i) => { const l = byId[id]; const v0 = (partsOf(l)[0]||{}).video; return `<li><a href="#${id}"${v0 ? ` data-thumb="${esc(v0)}"` : ""}><span class="no">${ar(i+1)}</span><span class="nm">${esc(l.name)}${markHTML(l)}</span><span class="q">${esc(l.title)}</span><span class="dur">${durOf(l)}</span></a></li>`; }).join("")}</ol>
  </section>
  ${bandHTML()}
  <section class="sec">
    <div class="sec-h"><h2>الدروس</h2>
      <div class="filters" role="group" aria-label="تصفية">
        ${[["all","الكل"],["ten","العشرة"],["ansar","الأنصار"],["muhajir","المهاجرون"]].map(([k,t]) => `<button class="pill" data-f="${k}" aria-pressed="${filter===k}">${t}</button>`).join("")}
      </div></div>
    <ol class="index" id="idx">${rowsHTML()}</ol><div class="more-wrap" id="moreWrap">${moreHTML()}</div>
  </section>
  ${seriesHTML()}
  ${aboutHTML()}
  </div>`;
  hoverThumbs(); wireBand();
  view.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { filter = b.dataset.f; view.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", x === b)); document.getElementById("idx").innerHTML = rowsHTML(); document.getElementById("moreWrap").innerHTML = moreHTML(); });
  document.getElementById("moreWrap").addEventListener("click", e => { if (!e.target.closest("#moreBtn")) return; const was = showAll; showAll = !showAll; document.getElementById("idx").innerHTML = rowsHTML(); document.getElementById("moreWrap").innerHTML = moreHTML(); if (was) document.getElementById("idx").scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "start"}); });
}
/* ---------- شريط الآثار المتحرك ---------- */
const SLIDES = [
  {k:"قال رسول الله ﷺ", q:"أَنْتَ مَعَ مَنْ أَحْبَبْتَ", s:"قَالَ أَنَسٌ: فَمَا فَرِحْنَا بِشَيْءٍ فَرَحَنَا بِقَوْلِ النَّبِيِّ ﷺ: «أَنْتَ مَعَ مَنْ أَحْبَبْتَ»، فَأَنَا أُحِبُّ النَّبِيَّ ﷺ وَأَبَا بَكْرٍ وَعُمَرَ، وَأَرْجُو أَنْ أَكُونَ مَعَهُمْ بِحُبِّي إِيَّاهُمْ، وَإِنْ لَمْ أَعْمَلْ بِمِثْلِ أَعْمَالِهِمْ.", src:"رواه البخاري (٣٦٨٨)"},
  {k:"قال رسول الله ﷺ", q:"لَا تَسُبُّوا أَصْحَابِي", s:"«لَا تَسُبُّوا أَصْحَابِي، فَلَوْ أَنَّ أَحَدَكُمْ أَنْفَقَ مِثْلَ أُحُدٍ ذَهَبًا، مَا بَلَغَ مُدَّ أَحَدِهِمْ وَلَا نَصِيفَهُ».", src:"رواه البخاري (٣٦٧٣) عن أبي سعيد الخدري"},
  {k:"قال رسول الله ﷺ", q:"خَيْرُ النَّاسِ قَرْنِي", s:"«خَيْرُ النَّاسِ قَرْنِي، ثُمَّ الَّذِينَ يَلُونَهُمْ، ثُمَّ الَّذِينَ يَلُونَهُمْ، ثُمَّ يَجِيءُ أَقْوَامٌ: تَسْبِقُ شَهَادَةُ أَحَدِهِمْ يَمِينَهُ وَيَمِينُهُ شَهَادَتَهُ».", src:"رواه البخاري (٢٦٥٢) عن عبد الله بن مسعود"},
  {k:"قال رسول الله ﷺ", q:"وَأَصْحَابِي أَمَنَةٌ لِأُمَّتِي", s:"«النُّجُومُ أَمَنَةٌ لِلسَّمَاءِ، فَإِذَا ذَهَبَتِ النُّجُومُ أَتَى السَّمَاءَ مَا تُوعَدُ، وَأَنَا أَمَنَةٌ لِأَصْحَابِي، فَإِذَا ذَهَبْتُ أَتَى أَصْحَابِي مَا يُوعَدُونَ، وَأَصْحَابِي أَمَنَةٌ لِأُمَّتِي، فَإِذَا ذَهَبَ أَصْحَابِي أَتَى أُمَّتِي مَا يُوعَدُونَ».", src:"رواه مسلم (٢٥٣١) عن أبي موسى الأشعري"},
  {k:"يُروى عن عبد الله بن مسعود رضي الله عنه", q:"أَبَرَّ هَذِهِ الْأُمَّةِ قُلُوبًا", s:"«مَنْ كَانَ مِنْكُمْ مُتَأَسِّيًا فَلْيَتَأَسَّ بِأَصْحَابِ مُحَمَّدٍ ﷺ؛ فَإِنَّهُمْ كَانُوا أَبَرَّ هَذِهِ الْأُمَّةِ قُلُوبًا، وَأَعْمَقَهَا عِلْمًا، وَأَقَلَّهَا تَكَلُّفًا، وَأَقْوَمَهَا هَدْيًا، وَأَحْسَنَهَا حَالًا، قَوْمًا اخْتَارَهُمُ اللَّهُ تَعَالَى لِصُحْبَةِ نَبِيِّهِ ﷺ، فَاعْرِفُوا لَهُمْ فَضْلَهُمْ، وَاتَّبِعُوهُمْ فِي آثَارِهِمْ؛ فَإِنَّهُمْ كَانُوا عَلَى الْهُدَى الْمُسْتَقِيمِ».", src:"ذكره ابن عبد البر في جامع بيان العلم (١٨١٠)"}
];
const CROWD = `<svg class="band-crowd" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><radialGradient id="bcGlow" cx="50%" cy="100%" r="55%" fx="50%" fy="100%"><stop offset="0" stop-color="#D8B46A" stop-opacity=".5"/><stop offset=".45" stop-color="#D8B46A" stop-opacity=".14"/><stop offset="1" stop-color="#D8B46A" stop-opacity="0"/></radialGradient><filter id="bcRim" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="d"/><feComposite in="d" in2="SourceAlpha" operator="out" result="o"/><feFlood flood-color="#D8B46A" flood-opacity=".55"/><feComposite in2="o" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1200" height="242" fill="url(#bcGlow)"/><path class="bc-ground" d="M0,239 C240,228 420,243 600,236 C800,228 1000,244 1200,233 L1200,260 L0,260 Z"/><g class="bc-p" filter="url(#bcRim)"><path d="M257.1,106.7 L257.1,117.7 C244.0,118.7 238.5,121.1 238.5,132.1 C238.0,155.1 240.0,166.9 239.5,176.9 C238.5,206.9 235.5,222.0 234.0,244 L290.0,244 C288.5,222.0 285.5,206.9 284.5,176.9 C284.0,166.9 286.0,155.1 285.5,132.1 C285.5,121.1 280.0,118.7 266.9,117.7 L266.9,106.7 Z"/><ellipse cx="262.0" cy="106.7" rx="10.3" ry="12.1"/><path d="M249.6,105.5 C248.7,88.5 275.3,88.5 274.4,105.5 C268.1,109.8 255.9,109.8 249.6,105.5 Z"/><path d="M263.8,110.4 C268.7,127.7 262.6,147.1 265.6,163.1 L269.5,161.1 C266.9,145.1 272.9,125.7 269.3,110.4 Z"/><path d="M277.0,141.1 C289.5,127.1 304.4,105.7 326.8,108.7 L326.8,119.7 C307.2,117.7 292.0,139.1 277.0,155.1 Z"/><path d="M332.4,86.6 L332.4,99.2 C317.8,100.2 311.7,103.7 311.7,114.7 C311.1,137.7 313.4,157.2 312.8,167.2 C311.7,197.2 308.3,222.0 306.6,244 L369.4,244 C367.7,222.0 364.3,197.2 363.2,167.2 C362.6,157.2 364.9,137.7 364.3,114.7 C364.3,103.7 358.2,100.2 343.6,99.2 L343.6,86.6 Z"/><ellipse cx="338.0" cy="86.6" rx="11.8" ry="13.9"/><path d="M354.8,123.7 C368.8,109.7 382.2,113.6 403.4,116.6 L403.4,127.6 C384.9,125.6 371.6,121.7 354.8,137.7 Z"/><path d="M408.8,95.8 L408.8,107.6 C394.9,108.6 389.1,111.6 389.1,122.6 C388.6,145.6 390.7,161.6 390.1,171.6 C389.1,201.6 385.9,222.0 384.3,244 L443.7,244 C442.1,222.0 438.9,201.6 437.9,171.6 C437.3,161.6 439.4,145.6 438.9,122.6 C438.9,111.6 433.1,108.6 419.2,107.6 L419.2,95.8 Z"/><ellipse cx="414.0" cy="95.8" rx="11.2" ry="13.1"/><path d="M400.6,94.5 C399.6,76.1 428.4,76.1 427.4,94.5 C420.6,99.1 407.4,99.1 400.6,94.5 Z"/><path d="M416.0,99.7 C421.2,117.6 414.7,137.6 417.9,153.6 L422.1,151.6 C419.2,135.6 425.8,115.6 421.9,99.7 Z"/><path d="M486.1,77.5 L486.1,90.8 C471.1,91.8 464.7,95.8 464.7,106.8 C464.2,129.8 466.5,152.8 465.9,162.8 C464.7,192.8 461.3,222.0 459.5,244 L524.5,244 C522.7,222.0 519.3,192.8 518.1,162.8 C517.5,152.8 519.8,129.8 519.3,106.8 C519.3,95.8 512.9,91.8 497.9,90.8 L497.9,77.5 Z"/><ellipse cx="492.0" cy="77.5" rx="12.5" ry="14.8"/><path d="M476.9,76.0 C475.8,55.4 508.2,55.4 507.1,76.0 C499.4,81.2 484.6,81.2 476.9,76.0 Z"/><path d="M494.2,81.9 C500.1,100.8 492.7,121.8 496.4,137.8 L501.2,135.8 C497.9,119.8 505.3,98.8 500.9,81.9 Z"/><path d="M509.4,115.8 C523.9,101.8 539.6,108.8 561.2,111.8 L561.2,122.8 C542.3,120.8 526.8,113.8 509.4,129.8 Z"/><path d="M566.6,90.3 L566.6,102.5 C552.6,103.5 546.6,106.8 546.6,117.8 C546.1,140.8 548.2,159.0 547.7,169.0 C546.6,199.0 543.4,222.0 541.8,244 L602.2,244 C600.6,222.0 597.4,199.0 596.3,169.0 C595.8,159.0 597.9,140.8 597.4,117.8 C597.4,106.8 591.4,103.5 577.4,102.5 L577.4,90.3 Z"/><path d="M572.0,74.0 C591.1,74.0 591.7,99.8 591.4,116.8 L552.6,116.8 C552.3,99.8 552.9,74.0 572.0,74.0 Z"/><path d="M588.2,126.8 C601.7,112.8 615.2,99.4 638.4,102.4 L638.4,113.4 C618.1,111.4 604.4,124.8 588.2,140.8 Z"/><path d="M644.2,79.3 L644.2,92.5 C629.1,93.5 622.7,97.4 622.7,108.4 C622.2,131.4 624.5,153.7 623.9,163.7 C622.7,193.7 619.3,222.0 617.5,244 L682.5,244 C680.7,222.0 677.3,193.7 676.1,163.7 C675.5,153.7 677.8,131.4 677.3,108.4 C677.3,97.4 670.9,93.5 655.8,92.5 L655.8,79.3 Z"/><ellipse cx="650.0" cy="79.3" rx="12.4" ry="14.6"/><path d="M635.1,77.9 C633.9,57.4 666.1,57.4 664.9,77.9 C657.3,83.0 642.7,83.0 635.1,77.9 Z"/><path d="M652.2,83.7 C658.0,102.5 650.7,123.4 654.4,139.4 L659.0,137.4 C655.8,121.4 663.1,100.5 658.8,83.7 Z"/><path d="M722.9,99.4 L722.9,110.9 C709.3,111.9 703.6,114.7 703.6,125.7 C703.0,148.7 705.1,163.4 704.6,173.4 C703.6,203.4 700.4,222.0 698.9,244 L757.1,244 C755.6,222.0 752.4,203.4 751.4,173.4 C750.9,163.4 753.0,148.7 752.4,125.7 C752.4,114.7 746.7,111.9 733.1,110.9 L733.1,99.4 Z"/><ellipse cx="728.0" cy="99.4" rx="10.9" ry="12.8"/><path d="M743.6,134.7 C756.6,120.7 770.4,104.1 792.8,107.1 L792.8,118.1 C773.2,116.1 759.2,132.7 743.6,148.7 Z"/><path d="M798.4,84.8 L798.4,97.5 C783.8,98.5 777.7,102.1 777.7,113.1 C777.1,136.1 779.4,156.3 778.8,166.3 C777.7,196.3 774.3,222.0 772.6,244 L835.4,244 C833.7,222.0 830.3,196.3 829.2,166.3 C828.6,156.3 830.9,136.1 830.3,113.1 C830.3,102.1 824.2,98.5 809.6,97.5 L809.6,84.8 Z"/><ellipse cx="804.0" cy="84.8" rx="12.0" ry="14.1"/><path d="M789.6,83.4 C788.5,63.7 819.5,63.7 818.4,83.4 C811.1,88.3 796.9,88.3 789.6,83.4 Z"/><path d="M806.1,89.0 C811.8,107.5 804.7,128.1 808.2,144.1 L812.7,142.1 C809.6,126.1 816.7,105.5 812.5,89.0 Z"/><path d="M820.8,122.1 C834.8,108.1 852.0,121.5 872.0,124.5 L872.0,135.5 C854.5,133.5 837.6,120.1 820.8,136.1 Z"/><path d="M877.1,104.9 L877.1,116.0 C864.0,117.0 858.5,119.5 858.5,130.5 C858.0,153.5 860.0,166.0 859.5,176.0 C858.5,206.0 855.5,222.0 854.0,244 L910.0,244 C908.5,222.0 905.5,206.0 904.5,176.0 C904.0,166.0 906.0,153.5 905.5,130.5 C905.5,119.5 900.0,117.0 886.9,116.0 L886.9,104.9 Z"/><path d="M882.0,90.0 C899.2,90.0 899.8,113.5 900.0,129.5 L864.0,129.5 C864.2,113.5 864.8,90.0 882.0,90.0 Z"/><path d="M950.7,93.9 L950.7,105.9 C936.9,106.9 931.1,110.0 931.1,121.0 C930.6,144.0 932.7,160.7 932.1,170.7 C931.1,200.7 927.9,222.0 926.3,244 L985.7,244 C984.1,222.0 980.9,200.7 979.9,170.7 C979.3,160.7 981.4,144.0 980.9,121.0 C980.9,110.0 975.1,106.9 961.3,105.9 L961.3,93.9 Z"/><ellipse cx="956.0" cy="93.9" rx="11.3" ry="13.3"/><path d="M942.5,92.6 C941.4,74.0 970.6,74.0 969.5,92.6 C962.6,97.3 949.4,97.3 942.5,92.6 Z"/><path d="M958.0,97.9 C963.3,115.9 956.7,136.0 960.0,152.0 L964.2,150.0 C961.3,134.0 968.0,113.9 964.0,97.9 Z"/></g></svg>`;
const BAND_MS = 9000; let bandTimer = null;
function bandHTML(){
  return `<section class="band" aria-roledescription="carousel" aria-label="من فضائل الصحابة">
    <svg class="band-rose" viewBox="0 0 400 400" aria-hidden="true">${Array.from({length:32},(_,i)=>{const t=i*Math.PI/16;return `<line x1="200" y1="200" x2="${(200+Math.cos(t)*400).toFixed(0)}" y2="${(200+Math.sin(t)*400).toFixed(0)}"/>`}).join("")}<circle cx="200" cy="200" r="120"/><circle cx="200" cy="200" r="112"/></svg>
    <div class="band-art" aria-hidden="true"></div>
    <div class="band-in">
      <div class="band-track" aria-live="off">${SLIDES.map((x,i) => `<div class="band-slide${i ? "" : " on"}" role="group" aria-roledescription="slide" aria-label="${ar(i+1)} من ${ar(SLIDES.length)}"${i ? ' aria-hidden="true"' : ""}>
        <span class="band-k">${x.k}</span><p class="band-q">${x.q}</p><p class="band-s">${x.s}</p><span class="band-src">${x.src}</span></div>`).join("")}</div>
      <div class="band-dots" role="tablist" aria-label="اختر الأثر">${SLIDES.map((x,i) => `<button type="button" role="tab" class="band-dot" aria-selected="${!i}" aria-label="${esc(x.q)}" data-i="${i}"><i></i></button>`).join("")}</div>
      <div class="band-ctas"><a class="band-cta" href="#about">ابدأ بالحلقة التمهيدية ←</a><a class="band-cta2" href="#sifat">صفات جيل الصحابة ←</a></div>
    </div>
  </section>`;
}
function wireBand(){
  clearInterval(bandTimer); bandTimer = null;
  const el = view.querySelector(".band"); if (!el) return;
  const sl = [...el.querySelectorAll(".band-slide")], dots = [...el.querySelectorAll(".band-dot")];
  let i = 0, paused = false;
  el.style.setProperty("--band-ms", BAND_MS + "ms");
  const go = n => { i = (n + sl.length) % sl.length;
    sl.forEach((s,k) => { s.classList.toggle("on", k===i); s.setAttribute("aria-hidden", k!==i); });
    dots.forEach((d,k) => { d.setAttribute("aria-selected", k===i); const b = d.firstChild; b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; }); };
  const start = () => { clearInterval(bandTimer); bandTimer = setInterval(() => { if (!paused && !document.hidden && document.body.contains(el)) go(i+1); else if (!document.body.contains(el)) clearInterval(bandTimer); }, BAND_MS); };
  const pause = v => { paused = v; el.classList.toggle("paused", v); };
  dots.forEach(d => d.onclick = () => { go(+d.dataset.i); start(); });
  el.addEventListener("mouseenter", () => pause(true)); el.addEventListener("mouseleave", () => pause(false));
  el.addEventListener("focusin", () => pause(true)); el.addEventListener("focusout", e => { if (!el.contains(e.relatedTarget)) pause(false); });
  let x0 = null; el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, {passive:true});
  el.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { go(i + (dx > 0 ? 1 : -1)); start(); } }, {passive:true});
  start();
}
const ICON = {
  youtube:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15.1V8.9l5.4 3.1-5.4 3.1Z"/></svg>',
  telegram:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.6 19.9c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.4 1.1 11.9c-1.1-.3-1.1-1.1.2-1.6l19.2-7.4c.9-.3 1.7.2 1.4 1.4Z"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21.9v-7.7h2.6l.4-3h-3V9.3c0-.9.3-1.5 1.5-1.5h1.6V5.1a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6v7.7a10 10 0 1 1 3.1 0Z"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.9 8c-.1-1.6-.4-3-1.6-4.2S17.6 2.2 16 2.1H8c-1.6.1-3 .4-4.2 1.6S2.2 6.4 2.1 8v8c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6h8c1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2V8Zm-2.1 9.9a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.2.4s-4 .1-5.2-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.2s-.1-4 .4-5.2a3 3 0 0 1 1.7-1.7c1.2-.5 4-.4 5.2-.4s4-.1 5.2.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.2s.1 4-.4 5.2Z"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7Z"/></svg>'
};
function othersHTML(l){
  const O = (window.OTHERS||{})[l.id], SH = window.SHEIKHS||{}; if (!O || !O.length) return "";
  return `<section class="others"><div class="sum-h"><h2>دروس أخرى عن ${esc(l.name.replace(/^أبو /, "أبي "))}</h2></div>
    <ul class="oth">${O.map(o => `<li><a href="${yt(o.v)}" target="_blank" rel="noopener"><span class="oc"><img src="https://i.ytimg.com/vi/${encodeURIComponent(o.v)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="play" aria-hidden="true"></span></span>${o.t ? `<b>${esc(o.t)}</b><em>${esc(SH[o.k]||o.k)} · ${esc(o.d)} · يوتيوب</em>` : `<b>${esc(SH[o.k]||o.k)}</b><em>${esc(o.d)} · يوتيوب</em>`}</a></li>`).join("")}</ul></section>`;
}
let thumbEl = null;
function hoverThumbs(){
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  if (!thumbEl) { thumbEl = document.createElement("div"); thumbEl.className = "rthumb"; thumbEl.setAttribute("aria-hidden","true"); thumbEl.innerHTML = '<img alt="">'; document.body.appendChild(thumbEl); }
  const img = thumbEl.querySelector("img"); let cur = null;
  const move = e => { const w = 260, h = 146, x = Math.min(innerWidth - w - 16, Math.max(16, e.clientX - w/2)), y = e.clientY - h - 24 < 12 ? e.clientY + 24 : e.clientY - h - 24; thumbEl.style.transform = `translate(${x}px,${y}px)`; };
  view.addEventListener("mouseover", e => { const a = e.target.closest("[data-thumb]"); if (!a || a === cur) return; cur = a; img.src = `https://i.ytimg.com/vi/${encodeURIComponent(a.dataset.thumb)}/mqdefault.jpg`; move(e); thumbEl.classList.add("on"); });
  view.addEventListener("mousemove", e => { if (cur) move(e); });
  view.addEventListener("mouseout", e => { const a = e.target.closest("[data-thumb]"); if (a && !a.contains(e.relatedTarget)) { cur = null; thumbEl.classList.remove("on"); } });
  addEventListener("hashchange", () => { cur = null; thumbEl.classList.remove("on"); });
}
const SERIES = [
  {t:"رسائل قرآنية", d:"وقفات مع آيات من القرآن", id:"PLPpTjhQlbIsyBMxlFhQqwPYOcMOd5pGDi", v:"2NUl4FxXSRs", n:12},
  {t:"دروس عامة", d:"دروس متفرقة في الإيمان والسلوك", id:"PLPpTjhQlbIsyhk74gtd9hTu3LQ-zCklKA", v:"0WQ2BQKDv4M", n:14},
  {t:"مشاعر الإيمان", d:"أعمال القلوب وأحوالها", id:"PLPpTjhQlbIszodTxzro8tV5b7Mvyi6wxL", v:"IDV10fI6aQA", au:1},
  {t:"مُفسِدات القلوب", d:"اللي بيفسد القلب وإزاي تعالجه", id:"PLPpTjhQlbIsxyWqmqsGSB-uhmYFHBiB8g", v:"v2m4UJJ4Jm0", au:1}
];
function seriesHTML(){
  return `<section class="series"><div class="sec-h"><h2>سلاسل أخرى</h2><a class="ui ser-all" href="https://www.youtube.com/channel/UCqHueXazVReJWcYdcL5TI8A/playlists" target="_blank" rel="noopener">كل السلاسل على يوتيوب ←</a></div>
    <ul class="ser">${SERIES.map(x => `<li><a href="https://www.youtube.com/playlist?list=${x.id}" target="_blank" rel="noopener"><span class="sc"><img src="https://i.ytimg.com/vi/${x.v}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="stk" aria-hidden="true"></span>${x.n ? `<span class="sn">${ar(x.n)} حلقة</span>` : `<span class="sn">سلسلة</span>`}</span><b>${esc(x.t)}${x.au ? ` <small class="ser-au">(سلسلة صوتية)</small>` : ""}</b><em>${esc(x.d)}</em></a></li>`).join("")}</ul></section>`;
}
function aboutHTML(){
  return `<section class="about" id="about-sec">
    <div><h3>لماذا الصحابة؟</h3><p>لأنهم الجيل اللي استقبل الوحي أول مرة، و«المرء مع من أحب». الحلقات بتحكي قصصهم الثابتة، وبتنزّلها على حياة الشباب.</p></div>
    <div><h3>عن الموقع</h3><p>كل حلقة بالفيديو والصوت ومحاورها، ومعاها شجرة العائلة وحلقات لمشايخ آخرين. والخريطة بتجمع الصحابة بالغزوات والمعاني.</p></div>
    <div><h3>تابع الدروس</h3><div class="chan">${C.filter(c => c.url).map(c => `<a href="${esc(c.url)}" target="_blank" rel="noopener" class="ch-${c.icon||""}">${ICON[c.icon]||""}<span>${esc(c.name)}</span></a>`).join("")}</div></div>
  </section>`;
}

/* ---------- صفحة الصحابي ---------- */
function related(l){
  return L.filter(o => o.id !== l.id).map(o => ({o, s: o.links.filter(k => k !== "muhajir" && l.links.includes(k))})).filter(x => x.s.length).sort((a,b) => b.s.length - a.s.length).slice(0,5);
}
function playerHTML(l, t, vid){
  vid = vid || l.video;
  if (!vid) return `<div class="yt"><b>${esc(l.name)}</b><span class="nov">الحلقة دي مش على يوتيوب لسه، والمحتوى من تحضير الدرس</span></div>`;
  const cover = `<img class="cover" src="https://i.ytimg.com/vi/${encodeURIComponent(vid)}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">`;
  if (window.NO_EMBED) return `<a class="yt has-cover" href="${yt(vid, t)}" target="_blank" rel="noopener">${cover}<span class="play" aria-hidden="true"></span><b>شاهد الحلقة${t ? " من " + fmtT(t) : ""}</b><small>تفتح على يوتيوب</small></a>`;
  if (!t) return `<button class="yt has-cover" data-embed="${esc(vid)}" aria-label="شغّل الحلقة">${cover}<span class="play" aria-hidden="true"></span><b>شاهد الحلقة</b></button>`;
  return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(vid)}?rel=0&autoplay=1${t > 1 ? "&start=" + t : ""}" title="${esc(l.name)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
}
const scURL = (id, pi) => { const a = (window.AUDIO||{})[id]; return a && a[pi||0] ? window.SC_BASE + a[pi||0] : null; };
const SC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M1.2 14.4c.1 0 .2.1.2.2l.3 1.8-.3 1.8c0 .1-.1.2-.2.2s-.2-.1-.2-.2l-.3-1.8.3-1.8c0-.1.1-.2.2-.2Zm1.7-1c.1 0 .2.1.2.2l.4 2.8-.4 2.7c0 .1-.1.2-.2.2s-.2-.1-.2-.2l-.3-2.7.3-2.8c0-.1.1-.2.2-.2Zm1.8-.6c.1 0 .2.1.2.3l.3 3.3-.3 3.2c0 .1-.1.2-.2.2s-.3-.1-.3-.2l-.3-3.2.3-3.3c0-.2.1-.3.3-.3Zm1.8-.1c.2 0 .3.1.3.3l.3 3.4-.3 3.3c0 .2-.1.3-.3.3s-.3-.1-.3-.3l-.3-3.3.3-3.4c0-.2.1-.3.3-.3Zm1.9-.6c.2 0 .3.1.3.3l.3 4-.3 3.3c0 .2-.2.3-.3.3-.2 0-.3-.1-.3-.3l-.3-3.3.3-4c0-.2.1-.3.3-.3Zm1.9-1.4c.2 0 .4.2.4.4l.3 5.4-.3 3.3c0 .2-.2.4-.4.4s-.4-.2-.4-.4l-.2-3.3.2-5.4c0-.2.2-.4.4-.4Zm2-.9c.2 0 .4.2.4.4l.2 6.3-.2 3.3c0 .3-.2.4-.4.4-.3 0-.4-.2-.4-.4l-.2-3.3.2-6.3c0-.2.2-.4.4-.4Zm1.6-.5c.4-.2.9-.2 1.4-.2 2.9 0 5.3 2.2 5.6 5.1.4-.2.8-.3 1.3-.3 1.8 0 3.2 1.5 3.2 3.3s-1.4 3.3-3.2 3.3h-8c-.3 0-.5-.2-.5-.5V9.2c0-.3.1-.4.2-.4Z"/></svg>';
ICON.soundcloud = SC_ICON;
function audioHTML(url, label){
  if (!url) return "";
  return `<div class="aud"><a class="aud-btn" href="${esc(url)}" target="_blank" rel="noopener">${SC_ICON}<span><b>${label || "استمع للحلقة صوت"}</b><small>على ساوندكلاود · تقدر تسمعها وانت بره الموقع</small></span></a>${window.NO_EMBED ? "" : `<button class="aud-play" type="button" data-sc="${esc(url)}">شغّل هنا</button>`}<div class="aud-embed"></div></div>`;
}
function wireAudio(root){
  root.querySelectorAll("[data-sc]").forEach(b => b.onclick = () => { const box = b.parentNode.querySelector(".aud-embed"); box.innerHTML = `<iframe title="مشغّل الصوت" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(b.dataset.sc)}&color=%23161a2a&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false"></iframe>`; b.remove(); });
}
const fixSp = root => root && root.querySelectorAll("svg text.nm, svg text.sub").forEach(t => { if (t.childNodes.length === 1 && t.firstChild.nodeType === 3) t.textContent = t.textContent.replace(/ /g, "\u2005"); });
function companion(l, pi){
  const i = list.indexOf(l), prev = list[i-1], next = list[i+1], P = partsOf(l);
  pi = Math.min(pi || 0, Math.max(P.length - 1, 0));
  const cp = P[pi], s = cp && cp.points ? cp : l.summary, vid = cp ? cp.video : l.video;
  view.innerHTML = `<div class="view">
  <div class="crumb"><a href="#home">الحلقات</a> · ${ar(String(i+1).padStart(2,"0"))}</div>
  <section class="head"><h1>${esc(l.name)}</h1><p class="full">${esc(l.full)}</p><p class="q">${esc(l.title)}</p>
    <div class="tags">${l.links.map(k => `<a class="tag" href="#map" data-tag="${k}">${esc(T[k].label)}</a>`).join("")}${FAM[l.id] ? `<button class="tag fam-jump" onclick="document.getElementById('fam').scrollIntoView({behavior:'smooth'})">شجرة العائلة ↓</button>` : ""}</div></section>
  <section class="body">
    <div>
      ${P.length > 1 ? `<div class="parts" role="tablist" aria-label="مجالس الحلقة">${P.map((p,j) => `<button role="tab" class="part${prog.has(l.id + ":" + j) ? " is-done" : ""}" data-p="${j}" aria-selected="${j===pi}"><b>المجلس ${ar(j+1)}</b><span>${esc(p.label||"")}</span><em>${esc(p.dur||"")}</em></button>`).join("")}</div>` : ""}
      <div class="player" id="player">${playerHTML(l, 0, vid)}</div>
      ${cp && cp.extra ? `<a class="extra ui" href="${yt(cp.extra.video)}" target="_blank" rel="noopener">＋ ${esc(cp.extra.label)} (مقطع منفصل على يوتيوب)</a>` : ""}
      ${audioHTML(scURL(l.id, pi), P.length > 1 ? "استمع للمجلس " + ar(pi+1) + " صوت" : null)}
      <div class="ep-acts">${l.video ? doneBtnHTML(l, pi) : ""}${l.video ? shareBtnHTML("ep", l.id) : ""}</div>
      <p class="intro">${esc(l.oneLine)}</p>
    </div>
    <aside class="side">
      <div class="box"><h3>رسالة الدرس</h3><p class="msg">${esc(l.message)}</p></div>
      ${related(l).length ? `<div class="box"><h3>صحابة يجمعهم بيه باب</h3><div class="rel">${related(l).map(x => `<a href="#${x.o.id}"><span class="n">${esc(x.o.name)}</span><span class="w">${x.s.map(k => esc(T[k].label)).join(" · ")}</span></a>`).join("")}</div></div>` : ""}
    </aside>
  </section>
  <section class="axes-sec"><div class="sum-h"><h2>محاور الدرس</h2></div>
  <ul class="axes main-axes">${l.axes.map(a => `<li class="g-${a.g}"><b>${esc(a.t)}</b><span class="src">${esc(a.src)}</span><ul>${a.f.map(f => `<li>${esc(f)}</li>`).join("")}</ul></li>`).join("")}</ul></section>
  ${familyHTML(l)}
  ${othersHTML(l)}
  <nav class="pager" aria-label="الحلقات المجاورة">
    ${prev ? `<a href="#${prev.id}"><span class="eyebrow">السابقة</span><span class="n">${esc(prev.name)}</span></a>` : "<span></span>"}
    ${next ? `<a href="#${next.id}"><span class="eyebrow">التالية</span><span class="n">${esc(next.name)}</span></a>` : "<span></span>"}
  </nav></div>`;
  view.querySelectorAll(".ts").forEach(b => b.onclick = () => {
    const t = +b.dataset.t;
    document.getElementById("player").innerHTML = playerHTML(l, t, vid);
    if (window.NO_EMBED) window.open(yt(vid, t), "_blank", "noopener");
    else document.getElementById("player").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });
  const pl = document.getElementById("player"); pl.addEventListener("click", e => { const b = e.target.closest("[data-embed]"); if (b) pl.innerHTML = playerHTML(l, 1, b.dataset.embed); });
  wireAudio(view); fixSp(view); wireDone(view, l, pi);
  view.querySelectorAll(".part").forEach(b => b.onclick = () => { const y = scrollY; companion(l, +b.dataset.p); scrollTo({top:y}); const t = view.querySelector('.part[aria-selected="true"]'); t && t.focus(); });
  view.querySelectorAll("[data-tag]").forEach(a => a.onclick = () => { pendingTag = "t:" + a.dataset.tag; });
  const tw_ = view.querySelector(".tree-wrap"); if (tw_) tw_.scrollLeft = -(tw_.scrollWidth - tw_.clientWidth)/2;
  view.querySelectorAll(".tlegend [data-cat]").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); document.getElementById("twrap").classList.toggle("hide-" + b.dataset.cat, !on); });
  view.querySelectorAll(".tn[data-note]").forEach(g => { const f = () => { document.getElementById("tinfo").textContent = g.dataset.note; view.querySelectorAll(".tn.on").forEach(x=>x.classList.remove("on")); g.classList.add("on"); }; g.addEventListener("click", f); g.addEventListener("keydown", e => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); f(); } }); });
}


/* ---------- شجرة العائلة ---------- */
const CATS = [["par","الآباء والأمهات"],["sib","الإخوة"],["wife","الأزواج"],["kid","الأبناء والبنات"],["ext","أقارب وصلات"]];
function treeSVG(l){
  const F = FAM[l.id]; if (!F) return "";
  const W = 1000, cx = W/2, cy = 250, out = [], lines = [];
  const tw = s => Math.max(104, [...s].length * 11 + 36);
  const node = (x, y, n, role, cat, note) => {
    const w = tw(n), pw = [...role].length*7+22;
    out.push(`<g class="tn c-${cat}" data-cat="${cat}" transform="translate(${x},${y})" tabindex="0" data-note="${esc(note ? n + "، " + note : n)}">
      <rect class="fr" x="${-w/2}" y="-22" width="${w}" height="44" rx="14"></rect>
      <rect class="pb" x="${-pw/2}" y="-33" width="${pw}" height="20" rx="10"></rect><text direction="rtl" class="pill" y="-22.5">${esc(role)}</text>
      <text direction="rtl" class="nm" y="8">${esc(n)}</text>${note ? `<circle class="dot" cx="${w/2-11}" cy="-10" r="3"></circle>` : ""}</g>`);
  };
  const path = (d, cat, dash) => lines.push(`<path class="ln c-${cat}" data-cat="${cat}" d="${d}" ${dash?'stroke-dasharray="5 5"':""}/>`);
  const curve = (x1,y1,x2,y2,cat,dash) => path(`M${x1},${y1} C${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2}`, cat, dash);
  const side = (x1,y1,x2,y2,cat,dash) => path(`M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`, cat, dash);
  const fx = F.father ? Math.max(120, tw(F.father.n)/2 + 14) : 120, mx = F.mother ? Math.max(120, tw(F.mother.n)/2 + 14) : 120;
  if (F.father){ curve(cx-fx,96,cx-30,cy-28,"par"); node(cx-fx,74,F.father.n,"الأب","par",F.father.note); }
  if (F.mother){ curve(cx+mx,96,cx+30,cy-28,"par"); node(cx+mx,74,F.mother.n,"الأم","par",F.mother.note); }
  const sib = F.siblings||[], ext = F.extended||[], left = [...sib.map(s=>({...s,cat:"sib"})), ...ext.map(s=>({...s,cat:"ext"}))];
  const ly = i => cy - (left.length-1)*38 + i*76;
  left.forEach((s,i) => { side(cx-90,cy,150+tw(s.n)/2,ly(i),s.cat,s.cat==="ext"); node(150,ly(i),s.n,s.r,s.cat,s.note); });
  const sp = F.spouses||[], ry = i => cy - (sp.length-1)*38 + i*76;
  sp.forEach((s,i) => { side(cx+90,cy,W-150-tw(s.n)/2,ry(i),"wife"); node(W-150,ry(i),s.n,/ولد|أولاد/.test(s.n)?"أم ولد":"زوجة","wife",s.note); });
  const groups = sp.filter(s => (s.kids||[]).length).map(s => ({mom:s.n, kids:s.kids}));
  if ((F.kidsUnknownMother||[]).length) groups.push({mom: sp.length ? "لم تُسمَّ أمهم في المصدر" : "", kids:F.kidsUnknownMother, dash:true});
  const sideMax = Math.max(cy + (left.length-1)*38, cy + (sp.length-1)*38);
  let y = Math.max(cy + 150, sideMax + 120), prevBus = cy + 26, any = false;
  const perRow = 6, gap = 16, mid = 24;
  groups.forEach(g => { for (let r=0; r<Math.ceil(g.kids.length/perRow); r++){
    any = true;
    const row = g.kids.slice(r*perRow, r*perRow+perRow), ws = row.map(k=>tw(k.n)), half = Math.ceil(row.length/2), bus = y - 50, xs = [];
    let x = cx + mid + ws.slice(0,half).reduce((a,b)=>a+b,0) + gap*(half-1);
    row.forEach((k,j) => { if (j === half) x = cx - mid; const nx = x - ws[j]/2; xs.push(nx); node(nx,y,k.n,k.r,"kid",k.note); x -= ws[j]+gap; });
    path(`M${cx},${prevBus} V${bus}`, "kid");
    path(`M${Math.min(...xs,cx)},${bus} H${Math.max(...xs,cx)}`, "kid", g.dash);
    xs.forEach(nx => path(`M${nx},${bus} V${y-34}`, "kid", g.dash));
    if (r === 0 && g.mom) lines.push(`<text direction="rtl" class="mom" data-cat="kid" x="${Math.max(...xs,cx) + ws[0]/2}" y="${bus-8}" text-anchor="start">${g.dash ? esc(g.mom) : "من " + esc(g.mom)}</text>`);
    prevBus = bus; y += 104;
  }});
  const H = any ? y - 54 : sideMax + 80;
  const cw = tw(l.name)+60;
  out.push(`<g class="tn me" transform="translate(${cx},${cy})"><rect class="halo" x="${-cw/2-8}" y="-38" width="${cw+16}" height="76" rx="22"></rect><rect class="fr" x="${-cw/2}" y="-30" width="${cw}" height="60" rx="16"></rect><text direction="rtl" class="nm" y="2">${esc(l.name)}</text><text direction="rtl" class="sub" y="22">${esc(l.full||"")}</text></g>`);
  return `<svg class="tree" viewBox="0 0 ${W} ${H}" role="img" aria-label="شجرة عائلة ${esc(l.name)}">${lines.join("")}${out.join("")}</svg>`;
}
function familyHTML(l){
  const F = FAM[l.id]; if (!F) return "";
  const links = (F.links||[]).filter(x => byId[x.to]);
  const has = {par: F.father||F.mother, sib:(F.siblings||[]).length, wife:(F.spouses||[]).length, kid:(F.spouses||[]).some(s=>(s.kids||[]).length)||(F.kidsUnknownMother||[]).length, ext:(F.extended||[]).length};
  return `<section class="fam" id="fam"><div class="sum-h"><h2>العائلة والنسب</h2></div>
    <p class="nasab">${esc(F.nasab)}</p>
    <div class="tree-wrap" id="twrap">${treeSVG(l)}</div>
    <div class="tlegend ui"><span class="hint">دوس على أي قسم تظهره أو تخفيه</span>${CATS.filter(([k]) => has[k]).map(([k,t]) => `<button class="tl c-${k}" data-cat="${k}" aria-pressed="true"><i></i>${t}</button>`).join("")}</div>
    <p class="tree-info ui" id="tinfo">دوس على أي اسم عليه نقطة تشوف عنه أكتر.</p>
    ${F.note ? `<p class="ui" style="color:var(--muted)">${esc(F.note)}</p>` : ""}
    ${links.length ? `<div class="flinks"><span class="eyebrow">صلات بحلقات تانية</span>${links.map(x => `<a href="#${x.to}"><b>${esc(byId[x.to].name)}</b><span>${esc(x.r)}</span></a>`).join("")}</div>` : ""}
    <p class="srcs ui">المصادر: ${F.src.map(esc).join(" · ")}</p></section>`;
}

/* ---------- الخريطة ---------- */
const norm = s => String(s).replace(/[\u064B-\u0652\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي");
let pendingTag = null;
const mapShow = {ansar:true, muhajir:true, ten:true, event:true, tribe:false, theme:false};
const isTen = l => !!l.ten;
const GNAME = {ansar:"أنصاري", muhajir:"مهاجري", other:"حليف الأنصار"};
let siraI = 0, siraTimer = null, siraPick = "", siraWord = "";
function mapView(){
  view.innerHTML = `<div class="view">
  <section class="map-h"><div><h1>رحلة السيرة</h1><p>تحرّك على الخط الزمني لترى أحداث السيرة الكبرى في مواضعها الحقيقية، ومن شهدها من الصحابة. وابحث عن حدث أو معنى أو صحابي لترى أحداثه على الخريطة.</p></div></section>
  <div id="mapBody"></div></div>`;
  clearInterval(siraTimer); siraTimer = null; if (sim) sim.stop(); window.onresize = null;
  siraView();
}
/* ---------- رحلة السيرة ---------- */
const ERA_NAME = Object.fromEntries(window.SIRA_ERAS || []);
const PIN = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s-5.5-5.2-5.5-9.3a5.5 5.5 0 0 1 11 0C15.5 12.8 10 18 10 18Z"/><circle cx="10" cy="8.6" r="2"/></svg>';
const allWho = e => e.who.concat((window.SIRA_MORE||{})[e.id] || []);
const sName = id => byId[id] ? byId[id].name : ((window.SIRA_NAMES||{})[id] || (window.LESSONS.find(l => l.id === id) || {}).name || id);
/* رسوم الأماكن على الخريطة: بيوت، نخل، أسوار، الكعبة، ومواقع المعارك */
const HOUSE = (x, y, w, h) => `<rect style="fill:var(--i-h);stroke:var(--i-hs);stroke-width:.7" x="${x}" y="${y}" width="${w}" height="${h}" rx=".6"/><rect style="fill:var(--i-d)" x="${x + w/2 - 1}" y="${y + h - 3.4}" width="2" height="3.4"/>`;
const PALM = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path style="stroke:var(--i-t);stroke-width:1.3;fill:none;stroke-linecap:round" d="M0,0 C.6,-4 .2,-7 1.2,-10"/><path style="stroke:var(--i-p);stroke-width:1.5;fill:none;stroke-linecap:round" d="M1.2,-10 c-2.6,-1.4 -5,-.6 -6.2,1.2 M1.2,-10 c2.4,-1.6 5,-1 6.2,.8 M1.2,-10 c-1,-2.4 -3.4,-3.2 -5.2,-2.6 M1.2,-10 c1.2,-2.4 3.6,-3 5.4,-2.2 M1.2,-10 c0,-2 .6,-3.4 1.6,-4"/></g>`;
const ICON_DEFS = `<defs>
 <symbol id="ic-makka" viewBox="-20 -20 40 40" overflow="visible"><path style="fill:var(--i-m);opacity:.75" d="M-20,8 L-12,-6 L-5,4 L2,-9 L11,3 L15,-3 L20,8 Z"/>${HOUSE(-15,1,6,6)}${HOUSE(9,0,6,7)}${HOUSE(-8,4,4,4)}${HOUSE(4,4,4,4)}<rect style="fill:var(--i-k)" x="-4" y="-2" width="8" height="9"/><rect style="fill:var(--i-b)" x="-4" y="0" width="8" height="1.4"/><path style="stroke:var(--i-hs);stroke-width:.6;opacity:.5;fill:none" d="M-20,8.5 H20"/></symbol>
 <symbol id="ic-madina" viewBox="-20 -20 40 40" overflow="visible">${PALM(-14,8,1.1)}${PALM(13,8,1.15)}${PALM(-6,6,.8)}${HOUSE(-10,0,7,8)}${HOUSE(-2,-2,7,10)}${HOUSE(6,2,6,6)}<path style="stroke:var(--i-hs);stroke-width:.6;opacity:.5;fill:none" d="M-20,8.5 H20"/></symbol>
 <symbol id="ic-taif" viewBox="-20 -20 40 40" overflow="visible"><path style="fill:var(--i-v);opacity:.8" d="M-20,8 C-12,-8 12,-8 20,8 Z"/>${HOUSE(-8,-1,6,6)}${HOUSE(2,-3,6,7)}${PALM(13,8,.75)}<path style="stroke:var(--i-hs);stroke-width:.6;opacity:.5;fill:none" d="M-20,8.5 H20"/></symbol>
 <symbol id="ic-walled" viewBox="-20 -20 40 40" overflow="visible">${HOUSE(-9,-6,6,9)}${HOUSE(-1,-9,6,12)}${HOUSE(6,-4,5,7)}<path style="fill:var(--i-w);stroke:var(--i-hs);stroke-width:.7" d="M-16,8 V0 h3 v-2 h2 v2 h3 v-2 h2 v2 h3 v-2 h2 v2 h3 v-2 h2 v2 h3 v-2 h2 v2 h3 V8 Z"/><rect style="fill:var(--i-d)" x="-1.5" y="3" width="3" height="5" rx="1.5"/><path style="stroke:var(--i-hs);stroke-width:.6;opacity:.5;fill:none" d="M-20,8.5 H20"/></symbol>
 <symbol id="ic-oasis" viewBox="-20 -20 40 40" overflow="visible"><ellipse style="fill:var(--i-q);opacity:.7" cx="0" cy="7" rx="9" ry="2.4"/>${PALM(-8,8,1.05)}${PALM(1,7,1.25)}${PALM(9,8,.9)}</symbol>
 <symbol id="ic-battle" viewBox="-20 -20 40 40" overflow="visible"><g style="stroke:var(--i-s);stroke-width:2.8;stroke-linecap:round;fill:none"><path d="M-8,8 L8,-8 M-8,-8 L8,8"/></g><g style="stroke:var(--i-s);stroke-width:2.2;stroke-linecap:round;fill:none"><path d="M-5,5 l-2,-2 M-7,7 l2,2 M5,5 l2,-2 M7,7 l-2,2"/></g></symbol>
</defs>`;
const PLN = {makka:"مكة",hira:"غار حراء",madina:"المدينة",uhud:"جبل أُحد",badr:"بدر",habasha:"أكسوم",rajee:"الرجيع",hudaybiya:"الحديبية",khaybar:"خيبر",tabuk:"تبوك",yamama:"اليمامة",yarmouk:"اليرموك",qadisiyya:"القادسية",amwas:"عمواس",fustat:"الفسطاط",nahawand:"نهاوند",basra:"البصرة",siffin:"صفين",nahrawan:"النهروان",kufa:"الكوفة"};
function siraView(){
  const G = window.SIRA_GEO, E = window.SIRA, n = E.length, P = G.places;
  const pct = i => (i/(n-1)*100).toFixed(3) + "%";
  const eras = (window.SIRA_ERAS||[]).map(([k,t]) => { const ix = E.map((e,i) => e.era === k ? i : -1).filter(i => i >= 0); const a = ix[0], b = ix[ix.length-1];
    const s = a === 0 ? 0 : (a - .5)/(n-1)*100, e = b === n-1 ? 100 : (b + .5)/(n-1)*100; return `<span class="era-b e-${k}" style="inset-inline-start:${s}%;width:${e-s}%"><b>${t}</b><i>${{m:"مكة",d:"المدينة",a:"الراشدة"}[k]}</i></span>`; }).join("");
  const places = [...new Set(E.map(e => e.at))];
  const LP = t => { const l = G.labels.find(x => x[0] === t); return l ? [l[1], l[2]] : null; };
  const ICONS = [["makka", P.makka], ["madina", P.madina], ["taif", LP("الطائف")], ["walled", LP("دمشق")], ["walled", LP("بيت المقدس")], ["walled", P.kufa], ["walled", P.basra], ["walled", P.fustat],
    ["oasis", P.khaybar], ["oasis", P.tabuk], ["oasis", P.badr], ...["badr","uhud","yamama","yarmouk","qadisiyya","nahawand","siffin","nahrawan"].map(k => ["battle", P[k], k])].filter(x => x[1]);
  const cnt = {}; E.forEach(e => allWho(e).forEach(w => { if (!w[2]) cnt[w[0]] = (cnt[w[0]] || 0) + 1; }));
  const ids = Object.keys(cnt), ser = ORDER.filter(id => byId[id] && cnt[id]).concat(ids.filter(id => byId[id] && !ORDER.includes(id))), oth = ids.filter(id => !byId[id]);
  document.getElementById("mapBody").innerHTML = `
  <div class="pick-bar"><div class="pq-wrap"><svg class="pq-ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg><input id="pq" class="pq" type="search" autocomplete="off" placeholder="اكتب حدثًا أو معنى أو اسم صحابي أو صحابية، مثل: بدر، الشهادة، الزبير" aria-label="ابحث في رحلة السيرة" role="combobox" aria-expanded="false" aria-controls="pqs"><ul class="pqs" id="pqs" role="listbox" hidden></ul></div><span class="pick-info" id="pickInfo"></span><button class="pick-x" id="pickX" type="button" hidden>مسح البحث</button></div>
  <div class="sira">
    <div class="sira-stage">
      <svg id="siraMap" viewBox="0 0 ${G.W} ${G.H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="خريطة أحداث السيرة">${ICON_DEFS}
        <g class="sm"><rect class="sea" x="-2000" y="-2000" width="${G.W+4000}" height="${G.H+4000}"/>${window.SIRA_ART ? `<image class="art art-l" href="${window.SIRA_ART.l}" x="-300" y="-300" width="1600" height="1700" preserveAspectRatio="none"/><image class="art art-d" href="${window.SIRA_ART.d}" x="-300" y="-300" width="1600" height="1700" preserveAspectRatio="none"/>` : `<path class="land" d="${G.land}"/>`}
        <g class="lbl">${G.labels.map(([t,x,y,k]) => `<text class="${k}" x="${x}" y="${y}" data-k="${k}">${t}</text>`).join("")}</g>
        <g class="icons">${ICONS.map(([t, [x, y], k], i) => `<use class="ico ico-${t}" href="#ic-${t}" data-i="${i}" data-x="${x}" data-y="${y}" data-t="${t}" data-k="${k || ""}" width="40" height="40"/>`).join("")}</g>
        <g class="routes"></g>
        <g class="pins">${places.map(p => `<g class="pin" data-p="${p}" transform="translate(${P[p][0]},${P[p][1]})"><circle class="halo" r="14"/><circle class="dot" r="5"/></g>`).join("")}<text class="act-lbl" x="0" y="0"></text></g></g>
      </svg>
      <div class="zctl" role="group" aria-label="التكبير"><button data-sz="in" aria-label="تكبير">+</button><button data-sz="out" aria-label="تصغير">−</button><button data-sz="fit" aria-label="عرض الجزيرة كلها">⤢</button></div>
      <span class="sira-note">المواضع والتواريخ على أشهر الأقوال، وبعضها تقريبي</span>
    </div>
  <div class="tline">
    <button class="tl-btn" data-step="-1" aria-label="الحدث السابق">→</button>
    <div class="tl-track">
      <div class="tl-eras">${eras}</div>
      <div class="tl-ticks">${E.map((e,i) => `<button class="tk e-${e.era}" data-i="${i}" style="inset-inline-start:${pct(i)}" title="${esc(e.t)}" aria-label="${esc(e.t)}"><i></i><span>${esc(e.t)}</span></button>`).join("")}</div>
      <input type="range" id="tlR" min="0" max="${n-1}" step="1" value="${siraI}" aria-label="الخط الزمني لأحداث السيرة">
    </div>
    <button class="tl-btn" data-step="1" aria-label="الحدث التالي">←</button>
    <button class="tl-play" id="tlPlay" aria-pressed="false"><span class="pl-i" aria-hidden="true"></span><span class="pl-t">تشغيل</span></button>
  </div>
    <article class="sira-card" id="siraCard" aria-live="polite"></article>
    <dialog id="hadithDlg" class="hd-dlg" aria-labelledby="hdT"><div class="hd-head"><span class="hd-k">الحديث كاملًا</span><h3 class="hd-t" id="hdT"></h3><button class="hd-close" type="button" aria-label="إغلاق">✕</button></div><div class="hd-body"><p class="hd-x"></p><cite class="hd-s"></cite></div></dialog>
    <section class="sira-who" id="siraWho" aria-label="الصحابة في الحدث"></section>
  </div>`;
  const svg = d3.select("#siraMap"), g = svg.select(".sm"), node = svg.node();
  let K = 1, curAt = "", actName = "";
  const PX = {city:15,town:12.5,reg:13.5,sea:13,riv:11.5}, OFF = {city:1,town:1};
  const scaleBits = k => { K = k; const r = node.getBoundingClientRect(), u = 1 / ((Math.max(r.width/G.W, r.height/G.H) || 1) * k); /* وحدة الخريطة لكل بكسل شاشة */
    g.selectAll(".lbl text").each(function(){ const c = this.dataset.k; this.setAttribute("font-size", PX[c]*u); this.setAttribute("dy", OFF[c] ? -11*u : 0); });
    g.selectAll(".pin .dot").attr("r", function(){ return (this.parentNode.classList.contains("on") ? 7.5 : 4.5) * u; });
    const kept = []; const ord = g.selectAll(".pin").nodes().sort((a, b) => (b.dataset.p === curAt) - (a.dataset.p === curAt) || (b.classList.contains("seen") - a.classList.contains("seen")));
    ord.forEach(el => { const [x, y] = P[el.dataset.p], hide = kept.some(([kx, ky]) => Math.hypot(kx - x, ky - y) / u < 16); el.classList.toggle("hid", hide); if (!hide) kept.push([x, y]); });
    const [ax, ay] = P[curAt] || [0, 0];
    g.selectAll(".lbl text").each(function(){ const c = this.dataset.k; if (c !== "city" && c !== "town") return; const near = curAt && Math.hypot(+this.getAttribute("x") - ax, +this.getAttribute("y") - ay) / u < 30; this.style.display = near ? "none" : ""; });
    const al = g.select(".act-lbl"); if (curAt) al.attr("x", ax).attr("y", ay).attr("dy", -17*u).attr("font-size", 16*u).text(actName);
    g.selectAll(".lbl text, .act-lbl").style("stroke-width", 3.5*u);
    const isz = Math.max(28, Math.min(66, 26 + 13 * Math.log2(k))) * u, ikept = [];
    g.selectAll(".ico").each(function(){ const t = this.dataset.t, x = +this.dataset.x, y = +this.dataset.y, sz = isz * (t === "battle" ? .55 : t === "oasis" ? .8 : 1), bx = t === "battle" ? x + 17*u : x, by = t === "battle" ? y + 1*u : y + sz*.36;
      this.setAttribute("x", bx - sz/2); this.setAttribute("y", by - sz/2); this.setAttribute("width", sz); this.setAttribute("height", sz);
      const nearAct = curAt && this.dataset.k !== curAt && !(t !== "battle" && P[curAt] && Math.hypot(P[curAt][0] - x, P[curAt][1] - y) < 1e-6) && Math.hypot(ax - bx, (ay - 17*u) - by) / u < 34;
      const hide = nearAct || (t !== "battle" ? ikept.some(([a, b]) => Math.hypot(a - bx, b - by) / u < 40) : (this.dataset.k !== curAt && ICONS.some(([tt, pp]) => tt !== "battle" && tt !== "oasis" && Math.hypot(pp[0] - x, pp[1] - y) / u < 40))); this.style.display = hide ? "none" : ""; if (!hide && t !== "battle") ikept.push([bx, by]); });
    g.selectAll(".pin .halo").attr("r", 20*u); g.selectAll(".land").attr("stroke-width", 1*u);
    g.selectAll(".route").attr("stroke-width", 2.4*u).attr("stroke-dasharray", `${7*u} ${6*u}`); };
  const zoom = d3.zoom().scaleExtent([1, 12]).translateExtent([[-400,-400],[G.W+400,G.H+400]]).on("zoom", e => { g.attr("transform", e.transform); scaleBits(e.transform.k); });
  svg.call(zoom).on("dblclick.zoom", null);
  const box = () => { const r = node.getBoundingClientRect(), s = Math.max(r.width/G.W, r.height/G.H); return [r.width/s, r.height/s]; }; /* حجم الجزء الظاهر من الخريطة بوحدات viewBox */
  const goTo = (pts, kmax, t) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const [vw, vh] = box(), pad = 90;
    const k = Math.max(1, Math.min(kmax, (vw - pad*2)/((Math.max(...xs)-Math.min(...xs))||1), (vh - pad*2)/((Math.max(...ys)-Math.min(...ys))||1)));
    const cx = (Math.max(...xs)+Math.min(...xs))/2, cy = (Math.max(...ys)+Math.min(...ys))/2;
    svg.transition().duration(reduce ? 0 : t).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity.translate(G.W/2, G.H/2).scale(k).translate(-cx, -cy)); };
  const curve = pts => { let d = `M${pts[0][0]},${pts[0][1]}`; for (let j = 1; j < pts.length; j++) { const [x0,y0] = pts[j-1], [x1,y1] = pts[j], mx = (x0+x1)/2, my = (y0+y1)/2, dx = x1-x0, dy = y1-y0, o = .18;
    d += ` Q${(mx - dy*o).toFixed(1)},${(my + dx*o).toFixed(1)} ${x1},${y1}`; } return d; };
  const card = document.getElementById("siraCard"), whoBox = document.getElementById("siraWho"), R = document.getElementById("tlR");
  const who = (arr, off) => arr.filter(w => !!w[2] === off).sort((x, y) => (byId[y[0]] ? 1 : 0) - (byId[x[0]] ? 1 : 0));
  function show(i, t = 900){
    siraI = Math.max(0, Math.min(n-1, i)); const e = E[siraI]; R.value = siraI;
    document.querySelector(".tline").style.setProperty("--p", siraI/(n-1));
    const hit = pickSet();
    document.querySelectorAll(".tk").forEach((b,j) => { b.classList.toggle("on", j === siraI); b.classList.toggle("past", j < siraI); b.classList.toggle("fade", !!hit && !hit.includes(j)); b.classList.toggle("hit", !!hit && hit.includes(j)); });
    g.selectAll(".pin").each(function(){ const p = this.dataset.p, first = E.findIndex(x => x.at === p); this.classList.toggle("on", p === e.at); this.classList.toggle("seen", first <= siraI); this.setAttribute("class", this.getAttribute("class").replace(/ ?e-[mda]/g,"") + " e-" + e.era); });
    const rt = g.select(".routes"); rt.selectAll("*").remove();
    if (e.path) rt.append("path").attr("class", "route e-" + e.era).attr("d", curve(e.path.map(k => P[k])));
    curAt = e.at; actName = PLN[e.at] || ""; const pl = g.select(`.pin[data-p="${e.at}"]`); pl.raise(); g.select(".act-lbl").raise();
    scaleBits(K);
    goTo((e.path || [e.at]).map(k => P[k]), e.z || 3, t);
    const all = allWho(e), on = who(all, false), off = who(all, true);
    const li = w => { const me = w[0] === siraPick ? " me" : ""; return byId[w[0]] ? `<li class="lnk${me}"><a href="#${w[0]}" aria-label="${esc(sName(w[0]))}: افتح الحلقة"><b>${esc(sName(w[0]))}</b><span>${esc(w[1])}</span><i class="go" aria-hidden="true">←</i></a></li>` : `<li class="plain${me}"><div><b>${esc(sName(w[0]))}</b><span>${esc(w[1])}</span></div></li>`; };
    card.className = "sira-card e-" + e.era;
    const [dh, dm] = e.d.replace("ق.هـ", "قبل الهجرة").split(" · ");
    card.innerHTML = `<div class="sc-k"><span class="sc-era">${ERA_NAME[e.era]}</span><span class="sc-n">${ar(siraI+1)} / ${ar(n)}</span></div>
      <div class="sc-date"><b>${dh}</b>${dm ? `<span>${dm}</span>` : ""}</div>
      <h2>${esc(e.t)}</h2><div class="sc-pl">${PIN}${esc(e.pl)}</div><p class="sc-x">${esc(e.text)}</p>
      ${e.q ? `<blockquote class="sc-q"><p>«${e.q.x}»</p><cite>${esc(e.q.s)}</cite>${(window.SIRA_FULL||{})[e.id] ? `<button class="sc-full-btn" type="button" aria-haspopup="dialog">اقرأ الحديث كاملًا</button>` : ""}</blockquote>` : ""}
`;
    const TOP = 8, pf = a => a.slice().sort((x, y) => (y[0] === siraPick) - (x[0] === siraPick));
    const ser = pf(on.filter(w => byId[w[0]])), oth = pf(on.filter(w => !byId[w[0]]));
    const ns = Math.min(ser.length, TOP), no = Math.max(0, Math.min(oth.length, TOP - ns)), rest = ser.length - ns + oth.length - no;
    const ul = (arr, k, cls) => arr.length ? `<ul class="sc-who ${cls}">${arr.map((w, j) => li(w).replace("<li class=\"", `<li class="${j >= k ? "xtra " : ""}`)).join("")}</ul>` : "";
    const offH = off.length ? `<div class="xtra-off"><h3 class="sc-off-h">لم يشهدها</h3>${ul(off.filter(w => byId[w[0]]), 99, "ser")}${ul(off.filter(w => !byId[w[0]]), 99, "oth")}</div>` : "";
    const moreT = `عرض الباقين (${ar(rest)})`, offT = `لم يشهدها (${ar(off.length)})`;
    whoBox.className = "sira-who e-" + e.era;
    whoBox.innerHTML = (on.length ? `<h3>الصحابة في هذا الحدث <em>${ar(on.length)}</em></h3>${ul(ser, ns, "ser")}${ul(oth, no, "oth")}
      ` : "") + ((rest || off.length) ? `<div class="who-btns">${rest ? `<button class="more-btn who-more" type="button" aria-expanded="false">${moreT}</button>` : ""}${off.length ? `<button class="more-btn who-off" type="button" aria-expanded="false">${offT}</button>` : ""}</div>` : "") + offH;
    const mb = whoBox.querySelector(".who-more"); if (mb) mb.onclick = () => { const o = whoBox.classList.toggle("open"); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "عرض أقل" : moreT; };
    const ob = whoBox.querySelector(".who-off"); if (ob) ob.onclick = () => { const o = whoBox.classList.toggle("offopen"); ob.setAttribute("aria-expanded", o); ob.textContent = o ? "إخفاء من لم يشهدها" : offT; };
    whoBox.hidden = !on.length && !off.length;
    fixLinks(whoBox);
    fixLinks(card);
    const fb = card.querySelector(".sc-full-btn"); if (fb) fb.onclick = () => { const d = document.getElementById("hadithDlg");
      d.className = "hd-dlg e-" + e.era; d.querySelector(".hd-t").textContent = e.t; d.querySelector(".hd-x").textContent = window.SIRA_FULL[e.id]; d.querySelector(".hd-s").textContent = "رواه " + ((e.q.s.match(/البخاري\s[٠-٩]+(?:،\s[٠-٩]+)*/) || [e.q.s])[0]) + "، بلا إسناد";
      d.showModal(); d.querySelector(".hd-body").scrollTop = 0; };
  }
  const hay = E.map(e => norm([e.t, e.pl, e.text, e.q ? e.q.x : "", ...allWho(e).map(w => sName(w[0]) + " " + w[1])].join(" ")));
  const wordHits = w => { const q = norm(w); return E.map((e, j) => hay[j].includes(q) ? j : -1).filter(j => j >= 0); };
  function pickSet(){ return siraPick ? E.map((e, j) => allWho(e).some(w => w[0] === siraPick && !w[2]) ? j : -1).filter(j => j >= 0) : siraWord ? wordHits(siraWord) : null; }
  const stepTo = d => { const h = pickSet(); if (!h) return show(siraI + d); const nx = d > 0 ? h.find(j => j > siraI) : [...h].reverse().find(j => j < siraI); if (nx !== undefined) show(nx); };
  const pq = document.getElementById("pq"), pqs = document.getElementById("pqs"), pInfo = document.getElementById("pickInfo"), pX = document.getElementById("pickX");
  const evN = k => k === 1 ? "حدث واحد" : k === 2 ? "حدثان" : `${ar(k)} ${k < 11 ? "أحداث" : "حدثًا"}`;
  const syncPick = () => { const h = pickSet(); pX.hidden = !h; pInfo.textContent = h ? (h.length ? `${evN(h.length)} من ${ar(n)}` : "لا نتائج") : "";
    g.selectAll(".pin").classed("fade", function(){ return !!h && !h.some(j => E[j].at === this.dataset.p); }); };
  const apply = () => { stop(); syncPick(); const h = pickSet(); show(h && h.length ? (h.includes(siraI) ? siraI : h[0]) : siraI); };
  let sug = [], act = -1;
  const closeS = () => { pqs.hidden = true; pq.setAttribute("aria-expanded", "false"); act = -1; };
  const choose = it => { if (!it) return; closeS(); if (it.t === "c") { siraPick = it.id; siraWord = ""; pq.value = sName(it.id); apply(); }
    else if (it.t === "e") { siraPick = ""; siraWord = ""; pq.value = E[it.i].t; syncPick(); stop(); show(it.i); }
    else { siraPick = ""; siraWord = it.w; pq.value = it.w; apply(); } };
  const renderS = () => { pqs.innerHTML = sug.map((it, k) => `<li role="option" id="pqo${k}" class="${k === act ? "on" : ""}" data-k="${k}"><span class="pq-t t-${it.t}">${{c:"صحابي", e:"حدث", w:"بحث"}[it.t]}</span><b>${esc(it.l)}</b><em>${esc(it.s)}</em></li>`).join("");
    pqs.hidden = !sug.length; pq.setAttribute("aria-expanded", String(!!sug.length)); if (act >= 0) pq.setAttribute("aria-activedescendant", "pqo" + act); else pq.removeAttribute("aria-activedescendant");
    pqs.querySelectorAll("li").forEach(li => li.onmousedown = ev => { ev.preventDefault(); choose(sug[+li.dataset.k]); }); };
  const cIds = Object.keys(cnt).sort((a, b) => (byId[b] ? 1 : 0) - (byId[a] ? 1 : 0) || cnt[b] - cnt[a]);
  pq.oninput = () => { const v = pq.value.trim(), q = norm(v); act = -1; if (!q) { sug = []; renderS(); if (siraPick || siraWord) { siraPick = ""; siraWord = ""; apply(); } return; }
    const cs = cIds.filter(id => norm(sName(id)).includes(q)).slice(0, 5).map(id => ({t:"c", id, l:sName(id), s:evN(cnt[id])}));
    const es = E.map((e, i) => ({e, i})).filter(({e}) => norm(e.t + " " + e.pl).includes(q)).slice(0, 4).map(({e, i}) => ({t:"e", i, l:e.t, s:e.d.split(" · ")[0]}));
    const wh = wordHits(v); sug = [...cs, ...es, ...(wh.length && q.length > 1 ? [{t:"w", w:v, l:`كل ما فيه «${v}»`, s:evN(wh.length)}] : [])]; renderS(); };
  pq.onkeydown = ev => { if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { if (!sug.length) return; ev.preventDefault(); act = (act + (ev.key === "ArrowDown" ? 1 : -1) + sug.length) % sug.length; renderS(); }
    else if (ev.key === "Enter") { ev.preventDefault(); choose(sug[act >= 0 ? act : 0]); } else if (ev.key === "Escape") closeS(); };
  pq.onblur = () => setTimeout(closeS, 120);
  pX.onclick = () => { pq.value = ""; siraPick = ""; siraWord = ""; closeS(); apply(); };
  if (siraPick) pq.value = sName(siraPick); else if (siraWord) pq.value = siraWord;
  R.oninput = () => { stop(); show(+R.value, 700); };
  document.querySelectorAll("[data-step]").forEach(b => b.onclick = () => { stop(); stepTo(+b.dataset.step); });
  document.querySelectorAll(".tk").forEach(b => b.onclick = () => { stop(); show(+b.dataset.i); });
  g.selectAll(".pin").on("click", function(){ const p = this.dataset.p, j = E.findIndex((x, k) => x.at === p && k > siraI), j0 = E.findIndex(x => x.at === p); stop(); show(E[siraI].at === p && j >= 0 ? j : (j0 >= 0 && E[siraI].at !== p ? j0 : siraI)); });
  document.querySelectorAll("[data-sz]").forEach(b => b.onclick = () => { const z = b.dataset.sz; if (z === "fit") goTo(Object.values(P), 1, 700); else svg.transition().duration(reduce?0:300).call(zoom.scaleBy, z === "in" ? 1.4 : 1/1.4); });
  const play = document.getElementById("tlPlay");
  function stop(){ clearInterval(siraTimer); siraTimer = null; play.setAttribute("aria-pressed","false"); play.querySelector(".pl-t").textContent = "تشغيل"; }
  play.onclick = () => { if (siraTimer) return stop(); if (!siraPick && siraI >= n-1) show(0);
    play.setAttribute("aria-pressed","true"); play.querySelector(".pl-t").textContent = "إيقاف";
    const h0 = pickSet(); if (h0 && siraI >= h0[h0.length-1]) show(h0[0]);
    siraTimer = setInterval(() => { const h = pickSet(), last = h ? h[h.length-1] : n-1; if (siraI >= last) return stop(); stepTo(1); }, 5200); };
  svg.call(zoom.transform, d3.zoomIdentity); scaleBits(1);
  const dlg = document.getElementById("hadithDlg"); dlg.querySelector(".hd-close").onclick = () => dlg.close(); dlg.onclick = ev => { if (ev.target === dlg) dlg.close(); };
  syncPick(); show(siraI, 0);
  let rw = innerWidth; window.onresize = () => { const e = E[siraI]; scaleBits(K); goTo((e.path || [e.at]).map(k => P[k]), e.z || 3, 0); rw = innerWidth; };
}
const hashS = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const torn = (w, h, seed, j = 2.2) => { let r = seed || 1; const R = () => ((r = Math.imul(r ^ (r >>> 15), 2246822507) ^ Math.imul(r ^ (r >>> 13), 3266489909)) >>> 0) / 4294967296;
  const x0 = -w/2, x1 = w/2, y0 = -h/2, y1 = h/2, pts = []; const st = 7;
  for (let x = x0; x < x1; x += st) pts.push([x, y0 + (R()-.5)*j*2]);
  for (let y = y0; y < y1; y += st) pts.push([x1 + (R()-.5)*j, y]);
  for (let x = x1; x > x0; x -= st) pts.push([x, y1 + (R()-.5)*j*2]);
  for (let y = y1; y > y0; y -= st) pts.push([x0 + (R()-.5)*j, y]);
  return "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z"; };
const rr = (w, h, r) => { const x = -w/2, y = -h/2; return `M${x+r},${y}H${x+w-r}A${r},${r} 0 0 1 ${x+w},${y+r}V${y+h-r}A${r},${r} 0 0 1 ${x+w-r},${y+h}H${x+r}A${r},${r} 0 0 1 ${x},${y+h-r}V${y+r}A${r},${r} 0 0 1 ${x+r},${y}Z`; };
function drawGraph(){
  const svg = d3.select("#graph"), show = mapShow;
  const HUB = new Set(["muhajir"]), mk = l => l.links.filter(k => !HUB.has(k));
  const used = new Set(L.flatMap(mk));
  const cw = s => [...s].length * 11 + 34, tgw = s => [...s].length * 7.2 + 22;
  const nodes = [...L.map(l => ({id:l.id, type:"comp", label:l.name, grp:group(l), ten:isTen(l), w:cw(l.name)})), ...[...used].map(k => ({id:"t:"+k, type:"tag", kind:T[k].kind, label:T[k].label, w:tgw(T[k].label)}))];
  const links = L.flatMap(l => mk(l).map(k => ({source:l.id, target:"t:"+k})));
  const nbr = new Map(nodes.map(n => [n.id, new Set()])), byNode = new Map(nodes.map(n => [n.id, n]));
  links.forEach(e => { nbr.get(e.source).add(e.target); nbr.get(e.target).add(e.source); });
  const g = svg.append("g");
  const ls = g.append("g").selectAll("path").data(links).join("path").attr("class", d => "link k-" + T[d.target.slice(2)].kind);
  const ns = g.append("g").selectAll("g").data(nodes).join("g")
    .attr("class", d => d.type === "comp" ? `n-comp g-${d.grp}${d.ten?" ten":""}` : "n-tag k-" + d.kind).attr("tabindex",0).attr("role","button").attr("aria-label", d => d.label);
  const cg = ns.filter(d => d.type==="comp");
  cg.append("path").attr("class","fr").attr("d",d=>rr(d.w,42,12));
  cg.each(function(d){ const t = d.ten ? "من العشرة" : GNAME[d.grp], pw = [...t].length*6.6+20; const s = d3.select(this);
    s.append("rect").attr("class","pb").attr("x",-pw/2).attr("y",-31).attr("width",pw).attr("height",18).attr("rx",9);
    s.append("text").attr("direction","rtl").attr("class","pill").attr("text-anchor","middle").attr("y",-21.5).text(t); });
  cg.append("text").attr("direction","rtl").attr("class","nm").attr("text-anchor","middle").attr("y",9).text(d => d.label);
  const tg = ns.filter(d => d.type==="tag");
  tg.append("path").attr("class","tp").attr("d",d=>rr(d.w,26,13));
  tg.append("text").attr("direction","rtl").attr("text-anchor","middle").attr("y",5).text(d => d.label);
  let W = 800, H = 600;
  if (sim) sim.stop();
  const alive = d => d.ten ? show.ten : show[d.grp === "other" ? "ansar" : d.grp];
  sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(d => 70 + (d.source.w + d.target.w)/4).strength(.45))
    .force("charge", d3.forceManyBody().strength(d => d.type==="comp" ? -700 : -220))
    .force("collide", d3.forceCollide(d => d.w/2 + (d.type==="comp" ? 10 : 6)).strength(.9).iterations(3))
    .force("x", d3.forceX(() => W/2).strength(.07)).force("y", d3.forceY(() => H/2).strength(.12))
    .on("tick", () => {
      ls.attr("d", d => { const s = d.source, t = d.target, mx = (s.x+t.x)/2; return `M${s.x},${s.y} Q${mx},${s.y} ${t.x},${t.y}`; });
      ns.attr("transform", d => `translate(${d.x},${d.y})`);
    });
  let touched = false;
  const zoom = d3.zoom().scaleExtent([.3, 3]).on("zoom", e => { g.attr("transform", e.transform); if (e.sourceEvent) touched = true; });
  svg.call(zoom).on("dblclick.zoom", null);
  const dur = reduce ? 0 : 650;
  const bbox = list => { const v = list.filter(d => vis0(d)); const xs = v.flatMap(d => [d.x - d.w/2, d.x + d.w/2]), ys = v.flatMap(d => [d.y - 32, d.y + 22]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  const fitTo = (list, maxK = 1.4, t = dur) => { if (!list.length) return; const [x0,y0,x1,y1] = bbox(list), pad = 28; const k = Math.min(maxK, (W - pad*2)/(x1-x0||1), (H - pad*2)/(y1-y0||1));
    svg.transition().duration(t).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity.translate(W/2, H/2).scale(k).translate(-(x0+x1)/2, -(y0+y1)/2)); };
  let vis0 = () => true;
  const size = () => { const r = svg.node().getBoundingClientRect(); W = r.width||800; H = r.height||600; svg.attr("viewBox",`0 0 ${W} ${H}`); const tall = H > W; const mb = document.querySelector(".mapbg"); if (mb) mb.setAttribute("viewBox", tall ? "360 40 760 940" : "0 0 1600 1000"); sim.force("x").x(W/2).strength(tall ? .2 : .07); sim.force("y").y(H/2).strength(tall ? .04 : .12); };
  size(); window.onresize = () => { size(); fitTo(nodes, 1.4, 0); };
  if (!reduce) nodes.forEach((d,i) => { d.x = W/2 + Math.cos(i) * 20; d.y = H/2 + Math.sin(i) * 20; });
  let fitted = false;
  if (reduce) { for (let i=0;i<400;i++) sim.tick(); sim.stop(); fitTo(nodes, 1.4, 0); fitted = true; }
  else { sim.stop(); for (let i=0;i<420;i++) sim.tick(); ls.attr("d", d => { const s = d.source, t = d.target, mx = (s.x+t.x)/2; return `M${s.x},${s.y} Q${mx},${s.y} ${t.x},${t.y}`; }); ns.attr("transform", d => `translate(${d.x},${d.y})`); fitted = true; queueMicrotask(() => fitTo(nodes, 1.4, 0)); }
  document.querySelectorAll("[data-z]").forEach(b => b.onclick = () => { const z = b.dataset.z; if (z === "fit") fitTo(nodes); else svg.transition().duration(reduce?0:300).call(zoom.scaleBy, z === "in" ? 1.35 : 1/1.35); });
  ns.call(d3.drag().on("start",(e,d)=>{ if(!e.active) sim.alphaTarget(.2).restart(); d.fx=d.x; d.fy=d.y; }).on("drag",(e,d)=>{ d.fx=e.x; d.fy=e.y; }).on("end",(e,d)=>{ if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }));
  let hub = null; const peek = document.getElementById("peek");
  function paint(){
    const vis = new Map(nodes.map(d => [d.id, d.type==="comp" ? alive(d) : false]));
    nodes.filter(d => d.type==="tag").forEach(d => vis.set(d.id, show[d.kind] && [...nbr.get(d.id)].some(c => vis.get(c))));
    if (hub) { if (hub.startsWith("t:")) vis.set(hub, true); nbr.get(hub).forEach(id => { const n = byNode.get(id); if (n.type === "tag" || alive(n)) vis.set(id, true); }); }
    vis0 = d => vis.get(d.id);
    const near = hub ? nbr.get(hub) : null;
    ns.style("display", d => vis.get(d.id) ? null : "none").classed("sel", d => d.id===hub).classed("dim", d => near ? !(d.id===hub || near.has(d.id)) : false);
    ls.style("display", d => vis.get(d.source.id) && vis.get(d.target.id) ? null : "none").classed("hot", d => hub && (d.source.id===hub || d.target.id===hub)).classed("dim", d => hub ? !(d.source.id===hub || d.target.id===hub) : false);
    document.querySelector(".stage").classList.toggle("focus", !!hub);
    if (!hub) { peek.hidden = true; return; }
    peek.hidden = false;
    if (hub.startsWith("t:")) { const k = hub.slice(2), ms = L.filter(l => l.links.includes(k) && vis.get(l.id));
      peek.innerHTML = `<span class="eyebrow">${{event:"غزوة",tribe:"قبيلة",theme:"معنى"}[T[k].kind]}</span><div class="n">${esc(T[k].label)}</div><p>${ms.map(m => `<a href="#${m.id}">${esc(m.name)}</a>`).join(" · ")}</p>`; }
    else { const l = byId[hub]; peek.innerHTML = `<span class="eyebrow">${l.ten ? "من العشرة المبشرين" : GNAME[group(l)]}</span><div class="n">${esc(l.name)}</div><p>${esc(l.title)}</p><a href="#${l.id}">افتح الحلقة ←</a>`; }
  }
  const act = d => { hub = hub === d.id ? null : d.id; paint();
    if (hub) { const ids = new Set([hub, ...nbr.get(hub)]); fitTo(nodes.filter(n => ids.has(n.id)), 1.6); } else fitTo(nodes); };
  ns.on("click",(e,d)=>act(d)).on("keydown",(e,d)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); act(d); } });
  document.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { const k = b.dataset.k; show[k] = !show[k]; b.setAttribute("aria-pressed", show[k]); paint(); setTimeout(() => fitTo(nodes), 60); });
  document.querySelectorAll("[data-g]").forEach(c => c.onchange = () => { show[c.dataset.g] = c.checked; if (c.dataset.g === "muhajir") { const t = document.querySelector('[data-g="ten"]'); if (t && !t.disabled) { t.checked = c.checked; show.ten = c.checked; } } paint(); setTimeout(() => fitTo(nodes), 60); });
  document.getElementById("q").oninput = e => { const v = norm(e.target.value.trim()); const hit = v && (nodes.find(n => norm(n.label).includes(v)) || nodes.find(n => n.type === "tag" && norm(T[n.id.slice(2)].alias || "").split(" ").some(w => w && (w.includes(v) || v.includes(w))))); hub = hit ? hit.id : null; paint(); if (hub) { const ids = new Set([hub, ...nbr.get(hub)]); fitTo(nodes.filter(n => ids.has(n.id)), 1.6); } };
  if (pendingTag && nbr.has(pendingTag)) { hub = pendingTag; pendingTag = null; }
  paint(); fixSp(document.getElementById("graph"));
}

/* ---------- سؤال وجواب ---------- */
const QA_Q = [
  {q:"وَالَّذِي ذَهَبَ إِلَيْهِ كَثِيرٌ مِنْ أَهْلِ الْعِلْمِ التَّرَخُّصُ فِي الرَّقَائِقِ وَمَا لَا حُكْمَ فِيهِ مِنْ أَخْبَارِ الْمَغَازِي، وَمَا يُجْرَى مَجْرَى ذَلِكَ، وَأَنَّهُ يُقْبَلُ فِيهَا مَنْ لَا يُقْبَلُ فِي الْحَلَالِ وَالْحَرَامِ؛ لِعَدَمِ تَعَلُّقِ الْأَحْكَامِ بِهَا.", s:"ابن سيد الناس، عيون الأثر ١/ ١٤١"},
  {q:"وَلْيَعْلَمِ الطَّالِبُ أَنَّ السِّيَرَا ... تَجْمَعُ مَا صَحَّ وَمَا قَدْ أُنْكِرَا", s:"الحافظ العراقي، ألفية السيرة"},
  {q:"إِذَا رَوَيْنَا فِي الْحَلَالِ وَالْحَرَامِ شَدَّدْنَا، وَإِذَا رَوَيْنَا فِي الْفَضَائِلِ وَنَحْوِهَا تَسَاهَلْنَا.", s:"الإمام أحمد وغيره من الأئمة، نقله الحلبي في السيرة الحلبية ١/ ٦"},
  {q:"قَدْ يَرْوُونَ عَنْهُمْ أَحَادِيثَ التَّرْغِيبِ وَالتَّرْهِيبِ، وَفَضَائِلِ الْأَعْمَالِ، وَالْقَصَصِ، وَأَحَادِيثِ الزُّهْدِ، وَمَكَارِمِ الْأَخْلَاقِ، وَنَحْوِ ذَلِكَ مِمَّا لَا يَتَعَلَّقُ بِالْحَلَالِ وَالْحَرَامِ وَسَائِرِ الْأَحْكَامِ، وَهَذَا الضَّرْبُ مِنَ الْحَدِيثِ يَجُوزُ عِنْدَ أَهْلِ الْحَدِيثِ وَغَيْرِهِمُ التَّسَاهُلُ فِيهِ، وَرِوَايَةُ مَا سِوَى الْمَوْضُوعِ مِنْهُ، وَالْعَمَلُ بِهِ؛ لِأَنَّ أُصُولَ ذَلِكَ صَحِيحَةٌ مُقَرَّرَةٌ فِي الشَّرْعِ، مَعْرُوفَةٌ عِنْدَ أَهْلِهِ.", s:"النووي، شرح صحيح مسلم ١/ ١٢٥"},
  {q:"إِنَّ شَرَائِطَ الْعَمَلِ بِالضَّعِيفِ ثَلَاثَةٌ: الْأَوَّلُ مُتَّفَقٌ عَلَيْهِ: أَنْ يَكُونَ الضَّعْفُ غَيْرَ شَدِيدٍ... الثَّانِي: أَنْ يَكُونَ مُنْدَرِجًا تَحْتَ أَصْلٍ عَامٍّ... الثَّالِثُ: أَنْ لَا يُعْتَقَدَ عِنْدَ الْعَمَلِ بِهِ ثُبُوتُهُ؛ لِئَلَّا يُنْسَبَ إِلَى النَّبِيِّ ﷺ مَا لَمْ يَقُلْهُ.", s:"الحافظ ابن حجر، نقله عنه تلميذه السخاوي"}
];
function qaHTML(){
  return `<section class="qa" id="qa"><div class="sec-h"><h2>سؤال وجواب</h2></div>
    <div class="qa-i"><h3>هل كل القصص اللي في الحلقات ثابتة؟</h3>
      <p>منهجنا إننا نحكي الثابت، ولو ذكرنا رواية فيها ضعف بنقول «يُروى». ومع ذلك ممكن تلاقي في حلقة أثر فيه ضعف، لأن الخطأ والسهو والنسيان واردين، وده مش منهجنا. وأهل العلم تساهلوا في السير والمغازي اللي ما يترتبش عليها حكم، بشرط ألا يكون الخبر مكذوبًا، وألا يُبنى عليه حلال أو حرام أو عقيدة.</p>
      <details><summary>أقوال أهل العلم (${ar(QA_Q.length)})</summary>
        ${QA_Q.map(x => `<blockquote>${x.q}<cite>${x.s}</cite></blockquote>`).join("")}
        <p class="qa-n">وخالف ابن العربي المالكي فمنع العمل بالضعيف مطلقًا، واختاره من المعاصرين الشيخ الألباني.</p>
      </details></div>
  </section>`;
}

/* ---------- عن السلسلة ---------- */
const INTRO = {name:"لماذا الصحابة؟", video:"SEjT9_FTYv4", dur:"٤٤ د"};
function about(){
  view.innerHTML = `<div class="view">
  <section class="intro-ep"><div class="ie-h"><span class="eyebrow">الحلقة التمهيدية · ${INTRO.dur}</span><h1>لماذا الصحابة؟</h1>
    <p class="lede">قبل ما نبدأ مع كل صحابي: ليه نتعلم سيرهم، وإزاي نصحبهم.</p></div>
    <div><div class="player" id="player">${playerHTML(INTRO, 0, INTRO.video)}</div>${audioHTML(scURL("intro"))}</div></section>
  ${qaHTML()}
  ${othersHTML({id:"intro", name:"جيل الصحابة"})}
  ${aboutHTML()}</div>`;
  const pl = document.getElementById("player"); pl.addEventListener("click", e => { const b = e.target.closest("[data-embed]"); if (b) pl.innerHTML = playerHTML(INTRO, 1, b.dataset.embed); });
  wireAudio(view);
}

/* ---------- صفات الصحابة ---------- */
const SIFAT = [
  {t:"الانقياد التام لله ورسوله", d:"لما نزل قوله تعالى ﴿وَإِنْ تُبْدُوا مَا فِي أَنْفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُمْ بِهِ اللَّهُ﴾ شقّ عليهم، فجاؤوا النبي ﷺ وجثوا على الرُّكَب، فأمرهم أن يقولوا: سمعنا وأطعنا، لا كما قال أهل الكتاب: سمعنا وعصينا. فقالوها وانقادوا، فنزل التخفيف."},
  {t:"الاستجابة ولو في أصعب الظروف", d:"غداة أُحُد وهم مثخنون بالجراح، ندبهم النبي ﷺ للخروج خلف قريش، فاستجابوا ونسوا جراحهم وقالوا: حسبنا الله ونعم الوكيل.", v:"﴿الَّذِينَ اسْتَجَابُوا لِلَّهِ وَالرَّسُولِ مِنْ بَعْدِ مَا أَصَابَهُمُ الْقَرْحُ﴾ آل عمران ١٧٢"},
  {t:"أشداء على الكفار", d:"شدة في موطن العداء، نابعة من استجابتهم لنداء القرآن ﴿وَلْيَجِدُوا فِيكُمْ غِلْظَةً﴾.", v:"﴿مُحَمَّدٌ رَسُولُ اللَّهِ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ﴾ الفتح ٢٩"},
  {t:"رحماء بينهم", d:"كما اشتدوا على الكفار لله، تراحموا فيما بينهم لله. ألّف الله بين قلوبهم تأليفًا لا يشتريه مال.", v:"﴿لَوْ أَنْفَقْتَ مَا فِي الْأَرْضِ جَمِيعًا مَا أَلَّفْتَ بَيْنَ قُلُوبِهِمْ وَلَكِنَّ اللَّهَ أَلَّفَ بَيْنَهُمْ﴾ الأنفال ٦٣"},
  {t:"كمال العبودية", d:"عُبّاد هذه الأمة؛ لو سُلّط الضوء على مجتمعهم لوقعت عينك على راكع أو ساجد. ولما نزلت المزّمل قاموا الليل حتى انتفخت أقدامهم.", v:"﴿تَرَاهُمْ رُكَّعًا سُجَّدًا﴾ الفتح ٢٩"},
  {t:"الإخلاص وصدق النية", d:"أطلعنا القرآن على سرائرهم التي لا تُرى: في هجرتهم وفي صلاتهم لا يبتغون إلا فضل الله ورضوانه.", v:"﴿يَبْتَغُونَ فَضْلًا مِنَ اللَّهِ وَرِضْوَانًا﴾ الحشر ٨"},
  {t:"طهارة القلوب", d:"شهد بها ابن مسعود الذي عاينهم: نظر الله في قلوب العباد بعد قلب محمد ﷺ فوجد قلوب أصحابه خير قلوب العباد، فجعلهم وزراء نبيه.", v:"«فَوَجَدَ قُلُوبَ أَصْحَابِهِ خَيْرَ قُلُوبِ الْعِبَادِ، فَجَعَلَهُمْ وُزَرَاءَ نَبِيِّهِ» رواه أحمد (٣٦٠٠) موقوفًا"},
  {t:"كمال الحب والتعظيم للنبي ﷺ", d:"شهد بها عروة بن مسعود الثقفي يوم الحديبية، وقد وفد على الملوك: ما رأى ملكًا يعظّمه أصحابه ما يعظّم أصحابُ محمدٍ محمدًا، وإذا تكلم خفضوا أصواتهم عنده."},
  {t:"كمال الاتباع", d:"خلع النبي ﷺ نعليه في الصلاة فخلع الناس نعالهم دون سؤال، فلما سألهم قالوا: رأيناك فعلت ففعلنا. فأخبرهم أن جبريل أخبره أن فيهما أذى."},
  {t:"تعظيم صلاة الجماعة", d:"كان المريض منهم يُحمل بين رجلين حتى يُقام في الصف.", v:"«وَلَقَدْ رَأَيْتُنَا وَمَا يَتَخَلَّفُ عَنْهَا إِلَّا مُنَافِقٌ مَعْلُومُ النِّفَاقِ» ابن مسعود، رواه مسلم"},
  {t:"الزهد في الدنيا", d:"قال ابن مسعود لتلاميذه: أنتم أكثر صلاة وصيامًا من أصحاب محمد ﷺ وهم كانوا خيرًا منكم؛ كانوا أزهد منكم في الدنيا وأرغب في الآخرة."},
  {t:"الورع", d:"كانوا يحاسبون أنفسهم على ما يستصغره غيرهم.", v:"«إِنَّكُمْ لَتَعْمَلُونَ أَعْمَالًا هِيَ أَدَقُّ فِي أَعْيُنِكُمْ مِنَ الشَّعَرِ، إِنْ كُنَّا نَعُدُّ عَلَى عَهْدِ النَّبِيِّ ﷺ الْمُوبِقَاتِ» أنس، رواه البخاري"},
  {t:"صحة العقيدة وسلامة المنهج", d:"هم الميزان في سلامة المعتقد؛ ورد في بعض روايات حديث افتراق الأمة أن الناجية مَن كان على ما عليه النبي ﷺ وأصحابه."},
  {t:"حسن الاستماع", d:"يجلسون عنده كأن على رؤوسهم الطير، لا يتنازعون الحديث، وهدفهم أن يفهموا ليعملوا، لا مجرد جمع المعلومات."},
  {t:"الأدب", d:"لما تسابق فريقان في الرمي وقال ﷺ: ارموا وأنا مع بني فلان، أمسك الفريق الآخر أقواسهم أدبًا أن يغلبوا فريقًا هو معه، فقال: ارموا وأنا معكم كلكم."},
  {t:"لا يسألون إلا عما ينفعهم", d:"قال ابن عباس: ما رأيت قومًا خيرًا من أصحاب رسول الله ﷺ، ما سألوه إلا عن ثلاث عشرة مسألة حتى قُبض، كلهن في القرآن."},
  {t:"لم يكونوا متحزّقين", d:"الحَزْق: التضييق والشد البليغ. لم يضيّقوا على أنفسهم ما وسّعه الله عليهم، كما قال أبو سلمة بن عبد الرحمن."},
  {t:"لم يكونوا متماوتين", d:"التماوت تصنّع الضعف والخشوع في الهيئة والمشية والكلام. وكان عمر إذا تكلم أسمع، وإذا مشى أسرع، وإذا ضرب أوجع، وهو الناسك حقًّا."},
  {t:"يفرّقون بين الجد والمزاح", d:"كانوا يتمازحون ويتناشدون الشعر ويضحكون، فإذا جاء الجد كانوا هم الرجال. سُئل ابن عمر: هل كانوا يضحكون؟ قال: نعم، والإيمان في قلوبهم أعظم من الجبال."},
  {t:"حفظ الجميل", d:"قاسمهم الأنصار الثمار والعمل، فلما فُتحت خيبر ووسّع الله عليهم، ردّ المهاجرون إلى الأنصار منائحهم التي كانوا منحوهم إياها."},
  {t:"سلامة الصدور", d:"لما قسم النبي ﷺ فيء بني النضير على المهاجرين دون الأنصار، لم يجد الأنصار في صدورهم حقدًا ولا حسدًا، فشهد لهم القرآن.", v:"﴿وَلَا يَجِدُونَ فِي صُدُورِهِمْ حَاجَةً مِمَّا أُوتُوا﴾ الحشر ٩"},
  {t:"الإيثار", d:"يقدّمون غيرهم وهم في أشد الحاجة، وبرّأ الله نفوسهم من الشح.", v:"﴿وَيُؤْثِرُونَ عَلَى أَنْفُسِهِمْ وَلَوْ كَانَ بِهِمْ خَصَاصَةٌ وَمَنْ يُوقَ شُحَّ نَفْسِهِ فَأُولَئِكَ هُمُ الْمُفْلِحُونَ﴾ الحشر ٩"},
  {t:"عدم المداهنة", d:"المداهنة ترك إنكار المنكر مجاملةً لصاحبه، وكانوا يعدّونها نفاقًا. قيل لابن عمر: ندخل على سلاطيننا فنقول لهم خلاف ما نتكلم إذا خرجنا.", v:"«كُنَّا نَعُدُّهَا نِفَاقًا» ابن عمر، رواه البخاري"},
  {t:"حسن التوبة", d:"لم يكونوا معصومين؛ بشر يخطئون، لكنهم يتوبون من قريب توبةً تتقطع معها القلوب ندمًا، حتى جاء منهم من يطلب إقامة الحد عليه ليُطهَّر."},
  {t:"معايشة القرآن علمًا وعملًا", d:"قال ابن مسعود: كان الرجل منا إذا تعلم عشر آيات لم يجاوزهن حتى يعرف معانيهن والعمل بهن. وأنكر ابن عمر على من يقرأ القرآن كله ينثره نثر الدَّقَل بلا تدبر."}
];
function sifat(){
  view.innerHTML = `<div class="view sifat">
  <section class="sf-hero"><span class="eyebrow">السمات العامة لجيل الصحابة</span><h1>صفات جيل الصحابة</h1>
    <p class="lede">${ar(SIFAT.length)} سمة ميّزت الجيل اللي صحب النبي ﷺ، مع دليل كل سمة من القرآن والسنة وأقوال الصحابة أنفسهم.</p></section>
  <ol class="sf-list">${SIFAT.map((x,i) => `<li class="sf"><span class="sf-n">${ar(i+1)}</span><div><h2>${x.t}</h2><p>${x.d}</p>${x.v ? (m => `<blockquote>${m ? m[1] : x.v}${m && m[2] ? `<cite>${m[2]}</cite>` : ""}</blockquote>`)(x.v.match(/^(.*[﴾»])\s*(.*)$/)) : ""}</div></li>`).join("")}</ol>
  <section class="sf-books"><h2>مصادر وقراءات</h2>
    <ul>
      <li><b>صحابة عظماء لم تسلط عليهم الأضواء</b><span>حامد الزيني · تقريظ د. محمد يسري إبراهيم · دار اليسر</span><p>الصفات في الصفحة دي ملخصة من فصل «السمات العامة لجيل الصحابة» (ص ٢٦)، وفيه الأدلة بتفصيل أكتر. وهي أشهر سماتهم لا كلها، كما نبّه المؤلف.</p><div class="bk-l"><a href="https://hamedalzainy.com/2024/03/22/%D8%B5%D8%AD%D8%A7%D8%A8%D8%A9-%D8%B9%D8%B8%D9%85%D8%A7%D8%A1-%D9%84%D9%85-%D8%AA%D8%B3%D9%84%D8%B7-%D8%B9%D9%84%D9%8A%D9%87%D9%85-%D8%A7%D9%84%D8%A7%D8%B6%D9%88%D8%A7%D8%A1/" target="_blank" rel="noopener">الكتاب على موقع المؤلف ←</a></div></li>
      <li><b>صور من حياة الصحابة</b><span>عبد الرحمن رأفت الباشا</span><p>بداية جميلة بأسلوب قصصي. فيه الثابت والضعيف، وده مقبول في السير والمغازي عند أهل العلم ما دام مش في العقائد والأحكام.</p><div class="bk-l"><a href="https://archive.org/details/1997-swr_hayat_alsahaba-albasha" target="_blank" rel="noopener">الكتاب PDF ←</a><a href="https://archive.org/details/hayat-alsahapah202119862" target="_blank" rel="noopener">البرنامج الإذاعي بصوت المؤلف ←</a></div></li>
      <li><b>حياة الصحابة</b><span>محمد يوسف الكاندهلوي</span><p>مرتّب على الموضوعات: الدعوة والهجرة والنصرة والعبادة والإنفاق. أثنى عليه الشيخ أبو إسحاق الحويني رحمه الله، ونبّه على أن فيه المنكر والضعيف، فالأفضل الطبعة المحققة المخرّجة الأحاديث (دار الحديث).</p><div class="bk-l"><a href="https://asfar.io/product/hayaat-alsahabat-alkindihalawiu-shamwa/" target="_blank" rel="noopener">الطبعة المحققة ←</a><a href="https://shamela.ws/book/8528" target="_blank" rel="noopener">اقرأه على الشاملة ←</a></div></li>
      <li><b>سير أعلام النبلاء</b><span>الإمام الذهبي</span><p>المرجع الأصيل في التراجم، وأجزاؤه الأولى في سير الصحابة. طويل، فالأفضل ترجع له في الصحابي اللي بتدرسه بدل ما تقراه من أوله.</p><div class="bk-l"><a href="https://shamela.ws/book/10906" target="_blank" rel="noopener">اقرأه على الشاملة ←</a></div></li>
    </ul></section>
  <div class="sf-back"><a class="band-cta" href="#home">ابدأ مع الصحابة ←</a></div>
  </div>`;
}

/* ---------- التوجيه ---------- */
const PATHS = !window.NO_EMBED && /^https?:$/.test(location.protocol);
const ROUTES = new Set(["home","map","about","sifat", ...L.map(l => l.id)]);
const pathOf = k => k === "home" ? "/" : "/" + k + "/";
function curKey(){
  const h = location.hash.slice(1);
  if (PATHS) { const p = location.pathname.split("/").filter(Boolean)[0] || "";
    if (h && ROUTES.has(h)) { history.replaceState(null, "", pathOf(h)); return h; }
    return ROUTES.has(p) ? p : "home"; }
  return h || "home";
}
function fixLinks(rootEl){
  if (!PATHS) return;
  rootEl.querySelectorAll('a[href^="#"]').forEach(a => { const k = a.getAttribute("href").slice(1); if (ROUTES.has(k)) a.setAttribute("href", pathOf(k)); });
}
const META = {
  home: ["مع الصحابة Ma3 El Sahaba | قصص الصحابة وسيرهم", "مع الصحابة (Ma3elsahaba): دروس عن حياة الصحابة وقصصهم بالفيديو والصوت، العشرة المبشرون بالجنة وغيرهم، مع محاور كل حلقة وشجرة العائلة وخريطة تجمعهم. Stories of the Sahaba, the Companions of the Prophet ﷺ."],
  map: ["رحلة السيرة: خريطة الصحابة | مع الصحابة", "خريطة تفاعلية بخط زمني لأحداث السيرة النبوية في مواضعها الحقيقية، من البعثة إلى فتوح الشام والعراق، ومن شهد كل حدث من الصحابة."],
  about: ["عن السلسلة: لماذا الصحابة؟ | مع الصحابة", "الحلقة التمهيدية لسلسلة مع الصحابة: ليه نتعلم سير الصحابة وإزاي نصحبهم، ومنهجنا في الروايات."],
  sifat: ["صفات جيل الصحابة | مع الصحابة", "السمات العامة لجيل الصحابة رضي الله عنهم، مع دليل كل سمة من القرآن والسنة وأقوال الصحابة."]
};
function setMeta(k){
  const l = byId[k];
  const [t, d] = l ? [`${l.name}: قصته وسيرته | مع الصحابة`, `${l.name}، ${l.title.replace(/[«»]/g,"")}. ${l.oneLine} حلقة من سلسلة «مع الصحابة» عن حياة الصحابة وقصصهم.`] : (META[k] || META.home);
  document.title = t;
  const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", d);
}
function route(){
  const h = curKey();
  if (byId[h]) { setNav(""); companion(byId[h]); }
  else if (h === "map") { setNav("map"); mapView(); }
  else if (h === "about") { setNav("about"); about(); }
  else if (h === "sifat") { setNav("sifat"); sifat(); }
  else { setNav("home"); home(); }
  setMeta(h); fixLinks(document);
  window.scrollTo({ top: 0, behavior: "auto" });
}
window.addEventListener("hashchange", route);
if (PATHS) {
  addEventListener("popstate", route);
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]"); if (!a || a.target === "_blank") return;
    const u = new URL(a.href, location.href); if (u.origin !== location.origin) return;
    const k = u.pathname.split("/").filter(Boolean)[0] || "home"; if (!ROUTES.has(k) || u.hash) return;
    e.preventDefault(); if (u.pathname !== location.pathname) history.pushState(null, "", u.pathname); route();
  });
}
const root = document.documentElement, tBtn = document.getElementById("themeT");
const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
const syncT = () => { if (!tBtn) return; const d = isDark(); tBtn.setAttribute("aria-label", d ? "الوضع النهاري" : "الوضع الليلي"); tBtn.classList.toggle("dark", d); };
try { const t = localStorage.getItem("ms-theme"); if (t) root.dataset.theme = t; } catch(e) {}
syncT(); matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncT);
if (tBtn) tBtn.onclick = () => { const t = isDark() ? "light" : "dark"; root.dataset.theme = t; try { localStorage.setItem("ms-theme", t); } catch(e) {} syncT(); };
const barEl = document.querySelector(".bar"); const onScroll = () => barEl && barEl.classList.toggle("scrolled", scrollY > 24); addEventListener("scroll", onScroll, {passive:true}); onScroll();
initFeedback(); initShare();
route();
})();
