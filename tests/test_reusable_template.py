"""A second, hypothetical record must render without hand-editing the HTML."""
import json, tempfile, sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE/'scripts'))
import build_site
original=json.loads((BASE/'content/tracks/nl/blue-boy-planet.json').read_text())
with tempfile.TemporaryDirectory() as td:
    td=Path(td)
    records=td/'records';records.mkdir()
    test=original.copy();test.update({'title':'Nieuwe Testcompositie','slug':'nieuwe-testcompositie','year':2027,'youtube_id':'aBcDeFgHiJ0','gallery':[],'related':[],'performance':''})
    (records/'nieuwe-testcompositie.json').write_text(json.dumps(test,ensure_ascii=False))
    build_site.RECORDS=records
    outputs=build_site.build(td/'preview')
    p=td/'preview/nl/track-nieuwe-testcompositie/index.html'
    html=p.read_text()
    assert p in outputs
    assert 'Nieuwe Testcompositie' in html
    assert 'Blue Boy Planet · Officiële video' not in html
    assert 'aBcDeFgHiJ0' in html
    assert 'id="achter-de-partituur"' not in html
    assert 'id="partituren"' not in html
    assert 'noindex,nofollow' in html
    print('Passed: dynamic slug, title, video, optional section hiding, safe draft page')