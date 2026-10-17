import re,os,sys,subprocess,glob
os.chdir('/home/portfolio');bad=0
for f in sorted(glob.glob('*.html')):
    s=open(f,encoding='utf-8').read()
    ids=set(re.findall(r'id="([^"]+)"',s))
    for m in re.findall(r'(?:href|src|poster)="([^"]+)"',s):
        if re.match(r'(https?:|mailto:)',m):continue
        if m.startswith('#'):
            if m[1:] not in ids:print(f,'missing anchor',m);bad=1
            continue
        p=m.split('#')[0]
        if not os.path.exists(p):print(f,'missing',m);bad=1
    if s.count('aria-current="page"')<1:print(f,'no current');bad=1
for f in glob.glob('*.js'):
    if subprocess.run(['node','--check',f]).returncode:bad=1
print('FAIL' if bad else 'OK');sys.exit(bad)
