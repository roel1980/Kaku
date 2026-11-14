from pathlib import Path
import re,base64,asyncio
from playwright.async_api import async_playwright
ROOT=Path('/mnt/data/Kaku-4.2')
html=(ROOT/'index.html').read_text()
css=(ROOT/'thema.css').read_text()
html=html.replace('<link rel="stylesheet" href="./thema.css">','<style>'+css+'</style>')
def substitute(m):
 name=m.group(1)
 file=ROOT/name
 if not file.exists() or file.suffix.lower() not in ('.png','.jpg','.jpeg','.svg','.webp'):
  return './'+name
 typ={'svg':'image/svg+xml','png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','webp':'image/webp'}[file.suffix[1:]]
 return 'data:'+typ+';base64,'+base64.b64encode(file.read_bytes()).decode()
html=re.sub(r'\./([A-Za-z0-9_.-]+\.(?:svg|png|jpg|jpeg|webp))',substitute,html)
print('Embedded preview bytes',len(html))
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for key,w,h in [('landscape',1485,1056),('portrait',834,1194),('small',390,844)]:
   page=await browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.set_content(html,wait_until='load',timeout=40000)
   await page.wait_for_timeout(120)
   await page.screenshot(path=f'{ROOT}/preview-{key}-overzicht.png',full_page=True)
   print(key,'title',await page.title(),'nav',await page.locator('.tab-item').count(),'errors',errors[:2])
   if await page.locator('#navigation [data-nav="practice"]').count():
    await page.locator('#navigation [data-nav="practice"]').click()
    await page.screenshot(path=f'{ROOT}/preview-{key}-oefenen.png',full_page=True)
    await page.locator('[data-action="start"]').click()
    print(' quiz focus:',await page.evaluate('document.activeElement?.id'))
    await page.screenshot(path=f'{ROOT}/preview-{key}-quiz.png',full_page=True)
    page.on('dialog',lambda dialog:asyncio.create_task(dialog.accept()))
    await page.locator('.quiz-stop-button').click()
    await page.wait_for_timeout(150)
    print(' stopped, nav visible:',await page.locator('#navigation').is_visible())
    await page.locator('#navigation [data-nav="library"]').click()
    await page.screenshot(path=f'{ROOT}/preview-{key}-woordenlijst.png',full_page=True)
    print(' wordlist rows',await page.locator('.catalog-table tbody tr').count(), 'page width',await page.evaluate('document.documentElement.scrollWidth'), 'viewport',w)
   print(' final errors',errors[:3])
   await page.close()
  await browser.close()
asyncio.run(main())
