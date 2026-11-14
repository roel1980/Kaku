import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
# Reuse image-embedded preview so rendering is identical and no external URL access is needed.
ns={}
s=Path('/mnt/data/Kaku-4.2/test_embed.py').read_text().split('async def main():')[0]
exec(s,ns)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1485,'height':1056})
  errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
  await page.set_content(ns['html'],wait_until='load')
  print('initial',await page.locator('.tab-item.is-active').inner_text(), 'level', await page.locator('.level-pill.active').first.inner_text())
  # Test library search, item details and scrolling.
  await page.locator('#navigation [data-nav="library"]').click()
  await page.locator('#catalog-search').fill('dag')
  await page.wait_for_timeout(110)
  print('filtered list visible rows',await page.locator('.catalog-table tbody tr').count())
  await page.locator('#catalog-search').fill('')
  await page.wait_for_timeout(110)
  await page.locator('.catalog-table tbody tr').first.click()
  print('detail visible',await page.locator('#detail-dialog').is_visible())
  await page.locator('[data-action="close-dialog"]').last.click()
  print('detail closed',not await page.locator('#detail-dialog').is_visible())
  bookScroll=await page.evaluate('''() => {let m=document.querySelector('#main');m.scrollTop=300;return {top:m.scrollTop,height:m.clientHeight,all:m.scrollHeight}}''')
  print('paper scrolling',bookScroll)
  # Test session progression and keyboard submission.
  await page.locator('#navigation [data-nav="practice"]').click()
  await page.locator('.count-row [data-value="5"]').click()
  await page.locator('[data-action="start"]').click()
  print('focused input',await page.evaluate('document.activeElement.id'))
  for k in range(5):
    prompt=await page.locator('.question-word').inner_text()
    answer=await page.evaluate('''prompt => {const item = window.KAKU_ITEMS.find(x => x.nl===prompt && x.level==='N4' && x.type==='words'); return item?.ja || window.KAKU_ITEMS.find(x=>x.nl===prompt)?.ja}''',prompt)
    if not answer:
      # Fallback if user's prior selection isn't words; any Japanese string to test mechanics.
      answer='日本'
    await page.locator('#answer-input').fill(answer)
    await page.locator('#answer-input').press('Enter')
    assert await page.locator('.feedback-line').count()==1, 'Enter failed submission'
    await page.locator('[data-action="next"]').click()
  print('result shown',await page.locator('.result-hero').is_visible(),'score',await page.locator('.result-circle').inner_text())
  print('page errors',errors)
  await page.screenshot(path='/mnt/data/Kaku-4.2/preview-landscape-resultaat.png',full_page=True)
  await browser.close()
asyncio.run(main())
