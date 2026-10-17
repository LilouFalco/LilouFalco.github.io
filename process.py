from PIL import Image,ImageDraw
from collections import deque
from pathlib import Path
import subprocess,concurrent.futures
base=Path('/files');dest=Path('/home/portfolio/assets')
def cutwhite(im):
 im=im.convert('RGBA');w,h=im.size;p=im.load();seen=set();q=deque()
 for x in range(w):q.append((x,0));q.append((x,h-1))
 for y in range(h):q.append((0,y));q.append((w-1,y))
 while q:
  x,y=q.popleft()
  if (x,y) in seen or not(0<=x<w and 0<=y<h):continue
  seen.add((x,y));r,g,b,a=p[x,y]
  if min(r,g,b)<230 or max(r,g,b)-min(r,g,b)>22:continue
  p[x,y]=(r,g,b,0)
  q.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
 return im
im=cutwhite(Image.open(next(base.glob('Avatar*'))));im.thumbnail((900,900));im.save(dest/'avatar.png',optimize=True)
im=Image.open(next(base.glob('Planche*')))
for r in range(3):
 for c in range(4):
  cell=im.crop((c*384,r*1024//3,(c+1)*384,(r+1)*1024//3));cell=cutwhite(cell);cell.thumbnail((260,260));cell.save(dest/f'emote-{r*4+c+1}.png',optimize=True)
for n,name in [(5546,'ageisme-1'),(5547,'ageisme-2'),(5548,'ageisme-3'),(5549,'pride')]:
 im=Image.open(next(base.glob(f'IMG_{n}*'))).convert('RGB');im=im.crop((0,501,1179,1974 if n==5549 else 1680));im.thumbnail((1000,1250));im.save(dest/f'{name}.webp',quality=90)
# Trim screen-recording transitions; preserve the original captions and logos.
jobs=[('13-42-03','formations',7.0,30.2,'crop=400:760:22:78'),('13-44-27','chantal',3.8,84.0,'crop=402:784:24:70'),('13-46-41','angela',2.5,46.7,'crop=398:778:22:68')]
def encode(job):
 key,name,start,duration,crop=job;src=next(base.glob('*'+key+'*'))
 subprocess.run(['ffmpeg','-y','-ss',str(start),'-i',str(src),'-t',str(duration),'-vf',crop,'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',str(dest/f'{name}.mp4')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
 subprocess.run(['ffmpeg','-y','-ss','4','-i',str(dest/f'{name}.mp4'),'-frames:v','1','-q:v','2',str(dest/f'{name}.jpg')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
 return name
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:print(list(pool.map(encode,jobs)))
