"""Retain previous evidence while exercising the current Phase 5 runtime."""
from pathlib import Path
for name,old,new in [
 ('phase5-natural-a-e.py','audits/level-v12/phase5','audits/level-v12/phase5-verification/regression-a-e'),
 ('phase2-browser-qa.py','audits/level-v12/screenshots','audits/level-v12/phase5-verification/regression-e')]:
 path=Path('audits/level-v12')/name
 print('Running '+name,flush=True)
 source=path.read_text(encoding='utf-8-sig').replace(old,new)
 exec(compile(source,str(path),'exec'),{'__file__':str(path.resolve()),'__name__':'__main__'})
