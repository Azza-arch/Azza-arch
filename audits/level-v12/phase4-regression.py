"""Run unchanged traversal suites, keeping Phase 2/3 evidence intact."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
for name,old,out in [
 ('phase2-browser-qa.py','audits/level-v12/screenshots','audits/level-v12/phase4/regression-e'),
 ('phase3-browser-qa.py','audits/level-v12/phase3/screenshots','audits/level-v12/phase4/regression-f-desktop'),
 ('phase3-touch-qa.py','audits/level-v12/phase3/screenshots','audits/level-v12/phase4/regression-f-touch')]:
 path=ROOT/'audits/level-v12'/name
 print('Running '+name,flush=True)
 exec(compile(path.read_text(encoding='utf-8').replace(old,out),str(path),'exec'),{'__file__':str(path),'__name__':'__main__'})
