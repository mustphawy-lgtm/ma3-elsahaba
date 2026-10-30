import fs from 'fs';
import {feature} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';
const W=1000,H=1100, X0=-300,Y0=-300,AW=1600,AH=1700;
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land=feature(topo,'land');
const proj=geoMercator().center([40,25.2]).scale(2100).translate([W/2,H/2]).clipExtent([[X0-50,Y0-50],[X0+AW+50,Y0+AH+50]]);
const path=geoPath(proj).digits(1);
const P=(lo,la)=>proj([lo,la]);
const line=pts=>{const q=pts.map(([a,b])=>P(a,b));let d=`M${q[0][0].toFixed(1)},${q[0][1].toFixed(1)}`;for(let i=1;i<q.length;i++){const [x0,y0]=q[i-1],[x1,y1]=q[i];d+=` Q${x0.toFixed(1)},${y0.toFixed(1)} ${((x0+x1)/2).toFixed(1)},${((y0+y1)/2).toFixed(1)}`;}const l=q[q.length-1];return d+` L${l[0].toFixed(1)},${l[1].toFixed(1)}`;};
const rivers={
 nile:[[30.42,31.45],[30.9,30.6],[31.23,30.04],[31.0,29.3],[30.75,28.1],[31.18,27.18],[31.9,26.6],[32.73,26.16],[32.64,25.69],[32.9,24.09],[32.3,23.0],[31.35,21.8],[30.6,20.6],[30.48,19.17],[31.5,18.7],[32.4,18.9],[33.3,19.5],[33.98,17.7],[33.0,16.6],[32.53,15.6]],
 damietta:[[30.9,30.6],[31.4,31.0],[31.81,31.42]],
 bluenile:[[32.53,15.6],[33.2,14.6],[33.6,13.5],[34.4,12.3],[35.4,11.3],[36.6,11.2],[37.4,11.8]],
 whitenile:[[32.53,15.6],[32.4,14.0],[32.6,12.2],[32.0,10.5]],
 atbara:[[33.98,17.7],[34.6,16.5],[35.5,15.3],[36.6,14.4],[37.6,13.9],[38.6,13.5]],
 euphrates:[[38.3,38.4],[38.4,37.4],[38.0,36.6],[38.4,36.1],[39.0,35.95],[40.1,35.3],[41.0,34.4],[42.37,34.14],[43.0,33.6],[43.8,33.35],[44.4,32.5],[44.9,31.8],[45.6,31.3],[46.3,31.0],[47.4,30.95],[48.0,30.5],[48.8,29.95]],
 tigris:[[40.2,37.9],[41.5,37.5],[42.2,37.2],[43.1,36.35],[43.3,35.5],[43.9,34.2],[44.4,33.3],[45.0,32.6],[45.8,32.5],[46.5,31.8],[47.4,30.95]],
 jordan:[[35.62,33.2],[35.58,32.85],[35.57,32.3],[35.55,31.78]],
 karun:[[48.4,32.4],[48.7,31.3],[48.3,30.4]]
};
const ranges=[
 [[35.2,29.2],[36.4,27.9],[37.6,26.4],[38.6,24.8],[39.5,23.1],[40.4,21.2],[41.4,19.6],[42.5,17.8],[43.4,15.8],[44.0,13.8]],
 [[45.2,36.8],[46.3,35.2],[47.4,33.8],[48.6,32.4],[50.0,30.9],[51.5,29.6]],
 [[33.5,37.2],[35.5,37.4],[37.5,37.9],[39.5,38.4],[42.0,38.0],[44.0,37.6]],
 [[35.9,33.4],[36.3,34.3],[36.5,35.2]],
 [[37.2,10.8],[38.2,12.3],[39.0,13.6],[39.5,14.8]],
 [[33.4,28.6],[33.9,28.2],[34.3,28.7]],
 [[32.6,27.5],[33.6,26.2],[34.6,24.8],[35.5,23.2]]
];
let seed=7;const R=()=>((seed=Math.imul(seed^(seed>>>15),2246822507)^Math.imul(seed^(seed>>>13),3266489909))>>>0)/4294967296;
function hatch(pts){const q=pts.map(([a,b])=>P(a,b));let out='';for(let i=1;i<q.length;i++){const [x0,y0]=q[i-1],[x1,y1]=q[i];const L=Math.hypot(x1-x0,y1-y0),n=Math.floor(L/9);for(let k=0;k<n;k++){const t=k/n,x=x0+(x1-x0)*t+(R()-.5)*10,y=y0+(y1-y0)*t+(R()-.5)*10,s=4+R()*3.5;out+=`M${(x-s).toFixed(1)},${(y+s*.55).toFixed(1)} L${x.toFixed(1)},${(y-s*.6).toFixed(1)} L${(x+s).toFixed(1)},${(y+s*.55).toFixed(1)} `;}}return out;}
const blot=[];for(let i=0;i<70;i++){const lo=30+R()*22,la=13+R()*24;const [x,y]=P(lo,la);blot.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(30+R()*90).toFixed(0)}" ry="${(20+R()*60).toFixed(0)}" opacity="${(.15+R()*.3).toFixed(2)}"/>`);}
const deserts=[[41.5,28.2,110,55],[47.5,20.5,230,110],[45.3,24.6,70,140],[29.5,26.5,150,140]].map(([lo,la,rx,ry])=>{const [x,y]=P(lo,la);return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rx}" ry="${ry}"/>`;}).join('');
function svg(th){
 const c=th==='light'?{paper:'#F1E6CB',land:'#EADBB8',blot:'#D7B77F',desert:'#E3C48C',sea:'#77B9D1',seaD:'#3F8CB4',seaL:'#B8DDE6',halo:'#FBF6EA',coast:'#A8865A',river:'#5FA6C6',mtn:'#9A7446',vign:'#B08D5C'}
  :{paper:'#151826',land:'#343A50',blot:'#3E4560',desert:'#3B4058',sea:'#0F2C47',seaD:'#081C30',seaL:'#1A4466',halo:'#5B86AD',coast:'#9DB2D6',river:'#5E9CCB',mtn:'#4A5272',vign:'#05070D'};
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${X0} ${Y0} ${AW} ${AH}" width="${AW}" height="${AH}">
<defs>
 <filter id="wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="3"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${th==='light'?'.16':'.22'} 0"/></filter>
 <filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .009" numOctaves="5" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 ${th==='light'?'.55':'0'}  0 0 0 0 ${th==='light'?'.38':'0'}  0 0 0 0 ${th==='light'?'.18':'0'}  0 0 0 1.1 -.42"/></filter>
 <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter><filter id="blur6"><feGaussianBlur stdDeviation="5"/></filter><filter id="blur40"><feGaussianBlur stdDeviation="40"/></filter>
 <filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
 <clipPath id="landClip"><path d="${path(land)}"/></clipPath>
 <mask id="seaMask"><rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" fill="#fff"/><path d="${path(land)}" fill="#000"/></mask>
 <radialGradient id="vg" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="${c.vign}" stop-opacity="0"/><stop offset="1" stop-color="${c.vign}" stop-opacity="${th==='light'?'.35':'.6'}"/></radialGradient>
</defs>
<rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" fill="${c.paper}"/>
<g mask="url(#seaMask)"><g filter="url(#wc)">
 <rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" fill="${c.sea}"/>
 <rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" fill="${c.seaD}" opacity=".55" filter="url(#mottle)"/>
 <path d="${path(land)}" fill="none" stroke="${c.seaL}" stroke-width="60" filter="url(#blur18)" opacity=".95"/>
 <path d="${path(land)}" fill="none" stroke="${c.halo}" stroke-width="10" filter="url(#blur6)" opacity=".95"/>
</g></g>
<g clip-path="url(#landClip)">
 <rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" fill="${c.land}"/>
 <g fill="${c.desert}" filter="url(#blur40)" opacity=".8">${deserts}</g>
 <g fill="${c.blot}" filter="url(#blur18)" opacity="${th==='light'?1:.45}">${blot.join('')}</g>
 ${th==='light'?`<rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" filter="url(#mottle)" opacity=".5"/>`:''}
 <path d="${path(land)}" fill="none" stroke="${c.paper}" stroke-width="16" filter="url(#blur6)" opacity="${th==='light'?'.7':'.35'}"/>
 <g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#wc)">
  <g stroke="${c.mtn}" stroke-width="34" opacity="${th==='light'?'.28':'.35'}" filter="url(#blur18)">${ranges.map(r=>`<path d="${line(r)}"/>`).join('')}</g>
  <g stroke="${c.mtn}" stroke-width="9" opacity="${th==='light'?'.22':'.3'}" filter="url(#blur6)">${ranges.map(r=>`<path d="${line(r)}"/>`).join('')}</g>
  <g stroke="${c.halo}" stroke-width="5" opacity="${th==='light'?'.35':'0'}" filter="url(#blur6)" transform="translate(-6,-5)">${ranges.map(r=>`<path d="${line(r)}"/>`).join('')}</g>
 </g>
 <g fill="none" stroke="${c.river}" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)">${Object.entries(rivers).map(([k,r])=>`<path d="${line(r)}" stroke-width="${k==='nile'||k==='euphrates'||k==='tigris'?2.6:1.7}" opacity=".9"/>`).join('')}</g>
 <ellipse cx="${P(35.5,31.5)[0].toFixed(1)}" cy="${P(35.5,31.5)[1].toFixed(1)}" rx="2.2" ry="7" fill="${c.sea}"/>
</g>
<path d="${path(land)}" fill="none" stroke="${c.coast}" stroke-width="1" opacity=".7" filter="url(#rough)"/>
<rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" filter="url(#grain)"/>
<rect x="${X0}" y="${Y0}" width="${AW}" height="${AH}" fill="url(#vg)"/>
</svg>`;}
fs.writeFileSync('art-light.svg',svg('light'));fs.writeFileSync('art-dark.svg',svg('dark'));
console.log('ok');
