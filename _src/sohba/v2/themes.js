/* المعاني: تعريفها ومرادفاتها للبحث، وتوزيعها على الصحابة حسب قصصهم في الحلقات */
(function(){
const TH = {
  sidq:   ["الصدق", "صدق صادق الصديق صديق"],
  shajaa: ["الشجاعة والقوة", "شجاعة شجاع القوة قوة قوي البطولة بطل الفروسية فارس الإقدام"],
  thabat: ["الثبات والصبر", "ثبات الثبات صبر الصبر الابتلاء ابتلاء التعذيب تعذيب المحنة"],
  tadhiya:["التضحية والفداء", "تضحية فداء فدى البذل بذل"],
  shahada:["الشهادة", "شهيد شهداء الاستشهاد استشهاد الموت في سبيل الله"],
  hubb:   ["حب النبي ﷺ", "حب محبة النبي الرسول الصحبة صحبة الحواري الدفاع عن النبي"],
  amana:  ["الأمانة", "أمانة أمين الأمين الثقة السر"],
  qiyada:["القيادة", "قيادة قائد أمير الإمارة الخلافة خليفة الحكم سيد"],
  adl:    ["العدل", "عدل عادل الحق القضاء"],
  infaq:  ["الإنفاق والكرم", "إنفاق انفاق الكرم كرم الجود جواد الصدقة صدقة المال"],
  zuhd:   ["الزهد", "زهد زاهد الدنيا التقشف الورع ورع"],
  ilm:    ["العلم والفقه", "علم العلم فقه الفقه طلب العلم فتوى"],
  quran:  ["القرآن", "قرآن القران مصحف تلاوة حفظ"],
  dawa:   ["الدعوة", "دعوة الدعوة إلى الله داعية التبليغ"],
  sabq:   ["السبق إلى الإسلام", "السبق السابقون أول من أسلم"],
  wafa:   ["الوفاء بالعهد", "وفاء العهد الوعد البيعة"],
  tawba:  ["التوبة", "توبة تاب الرجوع إلى الله"],
  haya:   ["الحياء", "حياء الحيا الخجل"],
  iffa:   ["العفة", "عفة عفيف التعفف الشهوة"],
  birr:   ["بر الوالدين", "بر الأم الأب الوالدين"],
  ittiba: ["اتباع السنة", "اتباع الاتباع السنة سنة الاقتداء"],
  fitna:  ["الفتنة بين الصحابة", "فتنة الفتن الجمل صفين"],
  dua:    ["استجابة الدعاء", "دعاء الدعاء مستجاب الدعوة"],
  ikhfa:  ["إخفاء العمل", "إخفاء الخفي الخبيئة الإخلاص"],
  bait:   ["الدعوة في البيت", "البيت الأسرة الزوجة الأولاد"],
  forsa:  ["الفرصة الفائتة", "الفرصة فرصة"],
  taswif: ["التسويف", "تسويف التأجيل"],
  itidal: ["الاعتدال في العبادة", "اعتدال الاعتدال القصد الرخصة رخصة التشدد الغلو الوسطية الاستمرار المداومة"]
};
const MAP = {
  "abu-bakr":   ["sidq","sabq","hubb","dawa","thabat","infaq","qiyada","ittiba","quran"],
  "umar":       ["shajaa","adl","qiyada","zuhd","quran","shahada","ilm"],
  "uthman":     ["haya","infaq","quran","thabat","shahada","fitna","sabq"],
  "ali":        ["shajaa","ilm","adl","qiyada","fitna","shahada","hubb","sabq"],
  "talha":      ["tadhiya","hubb","infaq","shajaa","sidq","shahada","fitna","sabq"],
  "zubayr":     ["shajaa","hubb","thabat","tadhiya","shahada","fitna","sabq"],
  "saad":       ["shajaa","birr","thabat","dua","qiyada","ikhfa","fitna","hubb","sabq"],
  "abd-rahman": ["infaq","zuhd","iffa","sabq","qiyada"],
  "abu-ubayda": ["amana","zuhd","qiyada","shajaa","hubb","sabq"],
  "said":       ["ikhfa","bait","dua","thabat","sabq","dawa"],
  "abu-dujana": ["shajaa","hubb","wafa","tadhiya"],
  "kaab":       ["sidq","tawba","taswif","thabat"],
  "anas-nadr":  ["sidq","wafa","shajaa","shahada","forsa","tadhiya"],
  "amr-jamuh":  ["shahada","tadhiya","bait","wafa"],
  "saad-muadh": ["qiyada","dawa","amana","shajaa","shahada","adl"],
  "hudhayfa":   ["amana","shajaa","fitna","ilm"],
  "ibn-umar":   ["ittiba","zuhd","ilm","fitna"],
  "ibn-amr":    ["itidal","quran","ilm","birr","wafa","fitna"],
  "ibn-masud":  ["quran","ilm","amana","shajaa","hubb","sabq"],
  "marthad":    ["iffa","sidq","shahada","thabat"],
  "musab":      ["dawa","tadhiya","zuhd","thabat","shahada","quran"]
};
for (const k in window.TAGS) if (window.TAGS[k].kind === "theme") delete window.TAGS[k];
for (const [k,[label,alias]] of Object.entries(TH)) window.TAGS[k] = {label, kind:"theme", alias};
for (const l of window.LESSONS) {
  const m = MAP[l.id]; if (!m) continue;
  l.links = l.links.filter(x => window.TAGS[x] && window.TAGS[x].kind !== "theme").concat(m);
}
})();
