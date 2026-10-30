import fs from 'fs';
import {feature, mesh} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';
const W=1000,H=1100;
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land=feature(topo,'land');
const proj=geoMercator().center([40,25.2]).scale(2100).translate([W/2,H/2]).clipExtent([[-500,-500],[W+500,H+500]]);
const path=geoPath(proj).digits(1);
const P=(lon,lat)=>proj([lon,lat]).map(v=>Math.round(v));
const labels=[["مكة",39.826,21.423,"city"],["المدينة",39.611,24.467,"city"],["الطائف",40.95,21.05,"town"],["بدر",38.79,23.78,"town"],["خيبر",39.29,25.70,"town"],["تبوك",36.57,28.38,"town"],["دمشق",36.29,33.51,"town"],["بيت المقدس",35.23,31.78,"town"],["صنعاء",44.19,15.37,"town"],["الكوفة",44.40,32.03,"town"],["أكسوم",38.72,14.13,"town"],
 ["الحجاز",41.2,26.6,"reg"],["نجد",44.6,25.4,"reg"],["اليمن",45.5,15.8,"reg"],["الشام",38.4,33.0,"reg"],["العراق",42.6,31.2,"reg"],["البصرة",47.8,30.5,"town"],["الفسطاط",31.23,30.05,"town"],["نهاوند",48.37,34.19,"town"],["صفين",38.97,35.95,"town"],["الحبشة",38.2,11.6,"reg"],["مصر",30.6,27.2,"reg"],["البحر الأحمر",37.4,20.2,"sea"],["الخليج",50.6,27.4,"sea"],["البحر المتوسط",31.2,33.7,"sea"],["الفرات",41.6,34.05,"riv"],["دجلة",44.75,34.0,"riv"],["النيل",31.9,27.3,"riv"]];
const out={W,H,land:path(land),labels:labels.map(([t,lo,la,k])=>[t,...P(lo,la),k])};
const places={makka:[39.826,21.423],hira:[39.858,21.458],thawr:[39.85,21.377],madina:[39.611,24.467],uhud:[39.615,24.505],badr:[38.79,23.78],habasha:[38.72,14.13],aqaba:[39.888,21.421],rajee:[39.65,21.95],hudaybiya:[39.62,21.44],khaybar:[39.29,25.70],tabuk:[36.57,28.38],yamama:[46.4,24.9],yarmouk:[35.95,32.75],qadisiyya:[44.42,31.97],amwas:[34.99,31.84],fustat:[31.23,30.05],nahawand:[48.37,34.19],basra:[47.8,30.5],siffin:[38.97,35.95],nahrawan:[44.6,33.3],kufa:[44.40,32.03]};
out.places=Object.fromEntries(Object.entries(places).map(([k,[lo,la]])=>[k,P(lo,la)]));
fs.writeFileSync('../sohba/v2/sira-geo.json',JSON.stringify(out));
console.log(JSON.stringify(out.places), (JSON.stringify(out).length/1024).toFixed(0)+'KB');
