import re,os
os.chdir(os.path.dirname(os.path.abspath(__file__))+"/sohba")
import base64
head0=open('v2/head.html').read(); LOGO=open('v2/logo.svg').read()
body=open('v2/body.html').read().replace('__LOGO__',LOGO).replace('__SIG__',open('v2/sig.svg').read())
b64=lambda f: 'data:font/woff2;base64,'+base64.b64encode(open(f,'rb').read()).decode()
b64j=lambda f: 'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode()
head=head0.replace('__PAPER__',b64j('site/map/paper.jpg')).replace('__PAPERD__',b64j('site/map/paper-dark.jpg')).replace('__PANORAMA__',b64('site/fonts/panorama.woff2')).replace('__ZANJABEEL__',b64('site/fonts/zanjabeel.woff2')).replace('__BANDARTL__','data:image/webp;base64,'+base64.b64encode(open('site/img/band-art-l.webp','rb').read()).decode()).replace('__BANDART__','data:image/webp;base64,'+base64.b64encode(open('site/img/band-art.webp','rb').read()).decode())
headS=head0.replace('__PAPER__','/map/paper.jpg').replace('__PAPERD__','/map/paper-dark.jpg').replace('__PANORAMA__','/fonts/panorama.woff2').replace('__ZANJABEEL__','/fonts/zanjabeel.woff2').replace('__BANDARTL__','/img/band-art-l.webp').replace('__BANDART__','/img/band-art.webp')
js=lambda f: open(f).read()
D3='<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>'
scripts="<script>"+js('data.js')+"</script><script>"+js('v2/ten.js')+"</script><script>"+js('v2/others.js')+"</script><script>"+js('v2/audio.js')+"</script><script>"+js('v2/themes.js')+"</script><script>window.LOGO="+__import__('json').dumps(LOGO)+";window.SIRA_ART={l:'__SIRAL__',d:'__SIRAD__'};window.SIRA_GEO="+open('v2/sira-geo.json').read()+"</script><script>"+js('v2/sira.js')+js('v2/sira-full.js')+"</script><script>"+js('v2/family.js')+"</script><script>"+js('v2/app.js')
w64=lambda f:'data:image/webp;base64,'+base64.b64encode(open(f,'rb').read()).decode()
scriptsA=scripts.replace('__SIRAL__',w64('site/img/sira-light.webp')).replace('__SIRAD__',w64('site/img/sira-dark.webp'))
scripts=scripts.replace('__SIRAL__','/img/sira-light.webp').replace('__SIRAD__','/img/sira-dark.webp')
open('sohba.html','w').write(head+"\n"+body+"<script>window.NO_EMBED=true</script>"+D3+scriptsA+"</script>\n")
site=open('site/index.html').read()
pre=('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
 '<meta name="theme-color" content="#161A2A"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">'
 '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="مع الصحابة">\n<meta name="description" content="">\n<!--SEO-->\n')
headsite=headS.split('<meta name="claude:viewport-fit-sides" content="cover">')
headsite=headsite[0]+headsite[1]
open('site/index.html','w').write(pre+headsite+'<style>body{margin:0;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style></head><body>\n'+body+D3+scripts+"\nif('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}</script></body></html>")
