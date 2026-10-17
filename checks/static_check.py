import re,os,subprocess,sys
os.chdir('/home/portfolio')
pages=['index','projets','parcours','voyages','contact']
H={p:open(p+'.html').read() for p in pages}
ok=True
def chk(c,m):
    global ok
    print(('PASS ' if c else 'FAIL ')+m); ok&=bool(c)
for p,t in H.items():
    chk(t.count('Mes voyages</a>')==1 and 'Ailleurs' not in t,p+' nav')
    chk(all(l in t for l in ['Mon univers','Créations','Parcours']),p+' nav labels')
    for a in re.findall(r'(?:src|href)="(assets/[^"]+)"',t): chk(os.path.exists(a),'asset '+a)
    chk('polarsteps' not in t.lower() and '+33' not in t and 'nfp_' not in t,p+' no secrets')
    chk('hailand' not in t and 'haïlande' not in t.lower(),p+' no thailand')
chk('JOUEUSE' not in H['index'] and 'hero-caption' not in H['index'] and 'character-name' not in H['index'],'home removals')
for k in ['C1','B1','TOEIC','Créativité','Humanité','Empathie','Sensibilité humaine','Souriante','Pack Office','Conception de supports','Relation client']: chk(k in H['index'],'home '+k)
pj=H['projets']
chk('data-filter' not in pj and 'class="dialogue"' not in pj,'projets no filter/dialogue')
for k in ['id="arbitryum"','id="airvance"','id="ecole"','SUP’DE COM','ÉCOLE 3A','DUT CARRIÈRES','Hackathon 2021']: chk(k in pj,'projets '+k)
chk('avec Lilou' not in pj,'no third person')
chk(pj.count('data-project=')==5,'5 modal projects')
v=H['voyages']
chk('about-strip' not in v and 'BIENTÔT DÉBLOQUÉ' in v and 'disabled' in v and '<svg' in v and '3 VOYAGES · PROCHAINE ESCALE CHINE' in v,'voyages china')
chk('avatar-hd.png' in H['contact'],'contact hd')
js=open('app.js').read()
chk('hailande' not in js and 'data-filter' not in js,'js clean')
chk(subprocess.run(['node','--check','app.js']).returncode==0,'js syntax')
sys.exit(0 if ok else 1)
