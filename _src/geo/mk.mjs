import fs from 'fs';
import {feature} from 'topojson-client';
import {geoMercator, geoPath, geoGraticule} from 'd3-geo';
const W=1600,H=1000;
const land=feature(JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json')), 'land');
const proj=geoMercator().center([44,23.2]).scale(2350).translate([W/2,H/2]).clipExtent([[-20,-20],[W+20,H+20]]);
const path=geoPath(proj).digits(1);
const P=([lon,lat])=>proj([lon,lat]).map(v=>Math.round(v));
const landD=path(land);
const grat=path(geoGraticule().step([5,5])());
// cities
const cities=[["مكة المكرمة",39.83,21.42,1,"l",8],["المدينة المنورة",39.61,24.47,1,"l",8],["الطائف",40.42,21.27,0,"r",18],["بدر",38.79,23.78,0,"l",20],["خيبر",39.29,25.70,0,"r",5],["تبوك",36.57,28.38,0,"l",5],["دمشق",36.29,33.51,0,"r",5],["بيت المقدس",35.23,31.78,0,"l",5],["اليرموك",35.95,32.75,0,"r",5],["الكوفة",44.40,32.03,0,"r",5],["صنعاء",44.19,15.37,0,"r",5],["الفسطاط",31.23,30.04,0,"l",5],["اليمامة",47.3,24.1,0,"r",5]];
const regions=[["جزيرة العرب",45.5,22.6,46,14],["الحجاز",41.6,26.9,26,8],["نجد",44.2,25.6,26,10],["تهامة",41.4,18.6,20,8],["اليمن",46.6,16.4,26,10],["حضرموت",50.5,16.4,20,6],["عُمان",56.2,21.2,20,6],["بلاد الشام",37.6,34.6,26,8],["العراق",44.2,33.2,26,10],["مصر",29.6,26.8,26,10],["الحبشة",37.5,11.8,24,10],["بحر القُلزُم",38.6,18.2,24,6,-58],["الخليج",51.7,26.6,20,6,-38],["بحر العرب",58.5,14.4,26,10]];
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="mapbg" aria-hidden="true" direction="rtl">
<defs>
<pattern id="mbWave" width="34" height="16" patternUnits="userSpaceOnUse"><path d="M2 10 q6 -6 12 0 t12 0" fill="none" stroke="var(--mb-ink)" stroke-width=".8" opacity=".22"/></pattern>
<filter id="mbRough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
<path id="mbL" d="${landD}"/><clipPath id="mbLand"><use href="#mbL"/></clipPath>
</defs>
<g class="mb-sea"><rect width="${W}" height="${H}" fill="url(#mbWave)"/></g>
<path d="${grat}" fill="none" stroke="var(--mb-ink)" stroke-width=".6" opacity=".25" stroke-dasharray="1 5"/>
`;
// rhumb lines from two compass roses
const roses=[[proj([32.6,15.9]),115]];
for(const [[x,y]] of roses){for(let i=0;i<32;i++){const a=i*Math.PI/16;s+=`<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x+Math.cos(a)*2200).toFixed(0)}" y2="${(y+Math.sin(a)*2200).toFixed(0)}" stroke="var(--mb-ink)" stroke-width="${i%4?.45:.8}" opacity="${i%4?.16:.28}"/>`;}}
// land: tinted fill, inner hatch shadow, coast
s+=`<g><use href="#mbL" fill="var(--mb-land)" stroke="none"/>
<g clip-path="url(#mbLand)"><use href="#mbL" fill="none" stroke="var(--mb-ink)" stroke-width="16" opacity=".09"/><use href="#mbL" fill="none" stroke="var(--mb-ink)" stroke-width="7" opacity=".12"/></g>
<use href="#mbL" fill="none" stroke="var(--mb-ink)" stroke-width="1.6" opacity=".8"/>
<use href="#mbL" fill="none" stroke="var(--mb-ink)" stroke-width=".6" opacity=".35" transform="translate(2.5 2)"/></g>
`;
// region labels
for(const [t,lo,la,fs_,ls,rot] of regions){const [x,y]=P([lo,la]);s+=`<text class="mb-reg" x="${x}" y="${y}" font-size="${fs_}" text-anchor="middle"${rot?` transform="rotate(${rot} ${x} ${y})"`:''}>${t}</text>`;}
// cities
for(const [t,lo,la,big,side,dy] of cities){const [x,y]=P([lo,la]);const r=big?16:11;const tx=side==="l"?x-r:x+r;const anc=side==="l"?"start":"end";
 s+= big? `<g class="mb-city big"><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="var(--mb-red)" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="4.5" fill="var(--mb-red)"/><text x="${tx}" y="${y+dy}" text-anchor="${anc}" font-size="26">${t}</text></g>`
         : `<g class="mb-city"><circle cx="${x}" cy="${y}" r="3.2" fill="var(--mb-ink)"/><circle cx="${x}" cy="${y}" r="6.5" fill="none" stroke="var(--mb-ink)" stroke-width=".8"/><text class="minor" x="${tx}" y="${y+dy}" text-anchor="${anc}" font-size="15">${t}</text></g>`;}
// compass roses
const rose=(cx,cy,r)=>{let g=`<g class="mb-rose" transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)})"><circle r="${r}" fill="none" stroke="var(--mb-ink)" stroke-width="1.2"/><circle r="${r*.92}" fill="none" stroke="var(--mb-ink)" stroke-width=".6"/><circle r="${r*.28}" fill="none" stroke="var(--mb-ink)" stroke-width=".8"/>`;
 for(let i=0;i<64;i++){const a=i*Math.PI/32,l=i%8?r*.9:r*.84;g+=`<line x1="${(Math.cos(a)*l).toFixed(1)}" y1="${(Math.sin(a)*l).toFixed(1)}" x2="${(Math.cos(a)*r*.92).toFixed(1)}" y2="${(Math.sin(a)*r*.92).toFixed(1)}" stroke="var(--mb-ink)" stroke-width=".6"/>`;}
 const pt=(a,len,w,fill1,fill2)=>{const c=Math.cos(a),sn=Math.sin(a),px=-sn,py=c,tx=c*len,ty=sn*len,lx=px*w,ly=py*w;return `<path d="M0 0 L${(lx).toFixed(1)} ${(ly).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}Z" fill="${fill1}"/><path d="M0 0 L${(-lx).toFixed(1)} ${(-ly).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}Z" fill="${fill2}" stroke="var(--mb-ink)" stroke-width=".5"/>`;};
 for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2+Math.PI/16;g+=pt(a,r*.55,r*.06,'var(--mb-ink)','var(--mb-paper)');}
 for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2+Math.PI/8;g+=pt(a,r*.68,r*.09,'var(--mb-red2)','var(--mb-paper)');}
 for(let i=0;i<4;i++){const a=i*Math.PI/2-Math.PI/2;g+=pt(a,r*.9,r*.12,'var(--mb-ink)','var(--mb-paper)');}
 g+=`<circle r="${r*.07}" fill="var(--mb-paper)" stroke="var(--mb-ink)"/><text y="${-r-10}" text-anchor="middle" font-size="${r*.2}" class="mb-reg">ش</text><text y="${r+r*.26}" text-anchor="middle" font-size="${r*.18}" class="mb-reg">ج</text><text x="${r+r*.18}" y="${r*.07}" text-anchor="middle" font-size="${r*.18}" class="mb-reg">ق</text><text x="${-r-r*.18}" y="${r*.07}" text-anchor="middle" font-size="${r*.18}" class="mb-reg">غ</text></g>`;return g;};
for(const [[x,y],r] of roses) s+=rose(x,y,r);
// cartouche
s+=`<g class="mb-cart" transform="translate(1290 70)"><rect x="-150" y="-10" width="300" height="130" rx="6" fill="var(--mb-paper)" stroke="var(--mb-ink)" stroke-width="1.6"/><rect x="-142" y="-2" width="284" height="114" rx="4" fill="none" stroke="var(--mb-ink)" stroke-width=".7"/>
<path d="M-150 -10 q-30 20 -8 55 q-24 30 8 75 M150 -10 q30 20 8 55 q24 30 -8 75" fill="none" stroke="var(--mb-ink)" stroke-width="1.2"/><path d="M-60 -10 q60 -34 120 0" fill="none" stroke="var(--mb-ink)" stroke-width="1.2"/><circle cx="0" cy="-22" r="5" fill="var(--mb-red2)"/>
<text y="44" text-anchor="middle" font-size="40" class="mb-title">خريطة الصحابة</text><text y="84" text-anchor="middle" font-size="18" class="mb-reg">جزيرة العرب وما حولها</text></g>`;
// frame
s+=`<rect x="10" y="10" width="${W-20}" height="${H-20}" fill="none" stroke="var(--mb-ink)" stroke-width="2.4"/><rect x="20" y="20" width="${W-40}" height="${H-40}" fill="none" stroke="var(--mb-ink)" stroke-width=".8"/>`;
s+=`</svg>`;
fs.writeFileSync('../sohba/v2/mapbg.svg',s);
console.log((s.length/1024).toFixed(0)+'KB');
