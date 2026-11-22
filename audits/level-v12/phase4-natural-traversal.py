from pathlib import Path
path=Path('audits/level-v12/phase5-natural-a-e.py')
source=path.read_text(encoding='utf-8-sig').replace('audits/level-v12/phase5','audits/level-v12/phase4/regression-a-e')
exec(compile(source,str(path),'exec'),{'__file__':str(path.resolve()),'__name__':'__main__'})
