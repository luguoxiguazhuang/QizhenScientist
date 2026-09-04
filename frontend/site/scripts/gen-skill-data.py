#!/usr/bin/env python3
"""Regenerate src/components/skillCollection/mechanismSkillData.js from the
Mechanist plugin's own SKILL.md frontmatter.

    python3 scripts/gen-skill-data.py /path/to/Mechanist/skills

Everything the Skill page shows -- family names, method names, summaries and
source paths -- comes from the plugin, so the page cannot drift from it."""
import os, re, sys, json

ACRONYM = {'shap':'SHAP','sae':'SAE','ica':'ICA','ntk':'NTK','nfm':'NFM',
           'crp':'CRP','clip':'CLIP','dnfa':'DNFA','db':'DB'}
# Agent-routing preambles. Every SKILL.md opens by telling the agent when to
# load it; on a page for humans that phrasing is noise repeated 32 times.
PREAMBLE = re.compile(
    r'^(use this skill (when|for|to)|use when|activates when|use it when|'
    r'this skill (is used|should be used) when)\s*', re.I)

# Directory names that do not survive naive hyphen-splitting.
DISPLAY = {
    'multi-modal': 'Multi-Modal',
    'representation-and-parameter-analysis': 'Representation & Parameter Analysis',
    'inputs-and-layer-wise-states': 'Inputs & Layer-wise States',
    'layer-wise-representation': 'Layer-wise Representation',
    'network-as-filter-nfm': 'Network-as-Filter (NFM)',
    'kernel-ntk-feature-regime': 'Kernel / NTK Feature Regime',
    'foundational-and-estimator-based-shap': 'Foundational & Estimator-based SHAP',
    'attribution-based-edge-scoring': 'Attribution-based Edge Scoring',
    'intervention-based-edge-search': 'Intervention-based Edge Search',
    'eigenvector-feature-direction': 'Eigenvector Feature Direction',
    'parameter-space-task-vectors': 'Parameter-space Task Vectors',
}

def title(s):
    if s in DISPLAY:
        return DISPLAY[s]
    return ' '.join(ACRONYM.get(p.lower(), p if p.isupper() else p.capitalize())
                    for p in s.replace('_', '-').split('-'))

def frontmatter(path):
    try:
        text = open(path, encoding='utf-8').read()
    except OSError:
        return {}
    m = re.match(r'^---\n(.*?)\n---', text, re.S)
    if not m:
        return {}
    body, out = m.group(1), {}
    for key in ('name', 'description', 'argument-hint'):
        mm = re.search(rf'^{key}:\s*(.*?)(?=\n[a-z-]+:|\Z)', body, re.S | re.M)
        if not mm:
            continue
        v = mm.group(1).strip()
        if v[:1] in '"\'' and v[-1:] == v[:1]:
            v = v[1:-1]
        out[key] = re.sub(r'\s+', ' ', v).replace("''", "'")
    return out

SYMBOL = {r'\to': '→', r'\rightarrow': '→', r'\times': '×', r'\in': '∈',
          r'\approx': '≈', r'\leq': '≤', r'\geq': '≥', r'\ll': '≪',
          r'\cdot': '·', r'\ldots': '…', r'\dots': '…'}

def demath(chunk):
    """Inline math used to be deleted outright, which left the prose limping:
    "whether $z$ is recoverable from $z$" became "whether is recoverable from".
    Short symbols are the subject of the sentence around them, so they are kept
    in plain text; only genuinely unrenderable expressions are dropped."""
    body = chunk.strip('$').strip()
    for tex, sym in SYMBOL.items():
        body = body.replace(tex, sym)
    body = re.sub(r'\\(?:mathbb|mathcal|mathbf|text|mathrm|operatorname)\s*', '', body)
    body = body.replace('{', '').replace('}', '').replace('\\', '')
    body = re.sub(r'\s+', ' ', body).strip()
    # A short symbol (x^l, z, h_attn, →) reads fine mid-sentence; a full
    # expression does not, and its sentence normally survives losing it.
    return body if len(body) <= 14 else ''

def clean(text):
    """SKILL.md descriptions are written for the agent, not for a web page:
    they carry inline LaTeX ($x_l$, $\\mathcal{C}$), markdown emphasis and
    backticks, all of which render as literal source in HTML."""
    t = re.sub(r'\$[^$]*\$', lambda m: demath(m.group(0)), text)
    t = re.sub(r'\*\*(.*?)\*\*', r'\1', t)      # bold
    # Backticks and asterisks only. Stripping "_" as emphasis also ate it out
    # of identifiers — mechanic_database came through as mechanicdatabase.
    t = re.sub(r'[`*]', '', t)
    # Removing the math often guts a parenthetical that only existed to carry
    # it — "(e.g., the residual stream state $x_l$ at layer $l$)" collapses to
    # "(e.g., the residual stream state at layer )". Drop whatever is left over.
    t = re.sub(r'\s+\)', ')', t)
    t = re.sub(r'\(\s*\)', '', t)
    t = re.sub(r'\(([^()]*)\)',
               lambda m: '' if len(re.sub(r'(e\.g\.|i\.e\.|[\s,.;:])', '',
                                          m.group(1))) < 3 else m.group(0), t)
    t = re.sub(r'\s+([,.;:])', r'\1', t)
    t = re.sub(r':\s*([,;])', r'\1', t)         # "an object:, where" -> ", where"
    t = re.sub(r'([,;:])\1+', r'\1', t)
    t = re.sub(r'\s{2,}', ' ', t)
    return t.strip()

def summarize(desc, sentences=2, limit=200):
    d = clean(re.sub(r'^>\s*', '', desc).strip())
    d = PREAMBLE.sub('', d)
    d = d[:1].upper() + d[1:] if d else d
    d = ' '.join(re.split(r'(?<=[.!?])\s+', d)[:sentences]).strip()
    if len(d) > limit:                          # truncate on a word boundary
        d = d[:limit].rsplit(' ', 1)[0].rstrip(',;:—-') + '…'
    # Never end mid-parenthetical, whether from the truncation above or from a
    # bracket whose closing half fell outside the sentence window.
    if d.count('(') > d.count(')'):
        d = d[:d.rfind('(')].rstrip(' ,;:—-')
        d = d if d.endswith('…') else d + '…'
    return d

def sections(path):
    """Split a SKILL.md into its '## Heading' -> body map. The frontmatter
    carries the one-line description; everything a reader actually wants —
    what the family is good for, where it breaks down, what each submethod
    does — is in the prose below it."""
    try:
        text = open(path, encoding='utf-8').read()
    except OSError:
        return {}
    text = re.sub(r'^---\n.*?\n---\n', '', text, flags=re.S)
    out, key, buf = {}, None, []
    for line in text.splitlines():
        m = re.match(r'^##\s+(.*)', line)
        if m:
            if key:
                out[key] = '\n'.join(buf).strip()
            key, buf = m.group(1).strip(), []
        elif key:
            buf.append(line)
    if key:
        out[key] = '\n'.join(buf).strip()
    return out

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def submethod_prose(fam_dir):
    """The '## Submethods' section describes each submethod in prose written
    for a reader. The leaf SKILL.md frontmatter, by contrast, is agent-routing
    text ('Use this skill when working with...'), which is what the page used
    to show 32 times over. Returned keyed by the demo directory each bullet
    points at."""
    body = sections(os.path.join(fam_dir, 'SKILL.md')).get('Submethods', '')
    out = {}
    for chunk in re.split(r'\n(?=-\s+\*\*)', body):
        chunk = chunk.strip()
        if not chunk.startswith('-'):
            continue
        # No '.' in the character class: the sentence ends "in ./residual-
        # stream-states." and a greedy class swallowed the full stop, so no
        # bullet ever matched a directory.
        demo_dir = re.search(r'demo for this method in \./([\w-]+)', chunk)
        demo_name = re.search(r'This demo shows ([^:]+):', chunk)
        # Everything before the "You can find a demo..." sentence is the
        # description; what follows is the agent's routing note.
        desc = re.split(r'You can find a demo', chunk)[0]
        desc = re.sub(r'^-\s+\*\*(.*?)\*\*\s*:?', '', desc).strip()
        if demo_dir:
            out[demo_dir.group(1)] = {
                'summary': summarize(desc, 2, 260),
                'demo': demo_name.group(1).strip() if demo_name else '',
            }
    return out

def references(fam_dir):
    """article_references.md lists the paper each submethod's demo comes from.
    Keyed by a normalised heading so it can be matched against directory
    names that spell the same thing differently (sae-feature-activation-state
    vs 'Sparse Autoencoder (SAE) feature activation state')."""
    try:
        text = open(os.path.join(fam_dir, 'article_references.md'),
                    encoding='utf-8').read()
    except OSError:
        return {}
    out = {}
    for block in re.split(r'\n(?=##\s+)', text):
        head = re.match(r'##\s+(.*)', block.strip())
        if not head:
            continue
        name = re.search(r'\*\*Name:\*\*\s*(.+)', block)
        url = re.search(r'\*\*URL:\*\*\s*(\S+)', block)
        if name:
            out[norm(head.group(1))] = {
                'name': name.group(1).strip(),
                'url': url.group(1).strip() if url else '',
            }
    return out

def match_reference(refs, sub):
    key = norm(sub)
    if key in refs:
        return refs[key]
    for ref_key, value in refs.items():
        if key in ref_key or ref_key in key:
            return value
    return None

def count_scripts(sub_dir):
    d = os.path.join(sub_dir, 'scripts')
    if not os.path.isdir(d):
        return 0
    return sum(1 for f in os.listdir(d) if f.endswith(('.py', '.sh', '.ipynb')))

def main(root):
    mech = os.path.join(root, 'mechanism-skills')
    families = []
    for fam in sorted(os.listdir(mech)):
        fd = os.path.join(mech, fam)
        if not os.path.isdir(fd):
            continue
        meta = frontmatter(os.path.join(fd, 'SKILL.md'))
        secs = sections(os.path.join(fd, 'SKILL.md'))
        prose = submethod_prose(fd)
        refs = references(fd)
        methods = []
        for sub in sorted(os.listdir(fd)):
            sd = os.path.join(fd, sub)
            if not os.path.isdir(sd):
                continue
            sm = frontmatter(os.path.join(sd, 'SKILL.md'))
            written = prose.get(sub, {})
            paper = match_reference(refs, sub)
            methods.append({
                'id': f'{fam}/{sub}', 'name': title(sub),
                # The family's own prose where it exists; the leaf's routing
                # description only as a fallback.
                'summary': written.get('summary')
                           or summarize(sm.get('description', ''), 1, 150),
                'demo': written.get('demo', ''),
                'paper': paper or None,
                'scripts': count_scripts(sd),
                'sourcePath': f'skills/mechanism-skills/{fam}/{sub}/SKILL.md',
            })
        families.append({
            'id': fam, 'name': title(fam),
            'summary': summarize(meta.get('description', ''), 1, 190),
            'about': summarize(meta.get('description', ''), 4, 520),
            'advantage': summarize(secs.get('Advantage', ''), 3, 340),
            'limitation': summarize(secs.get('Limitation', ''), 3, 340),
            'sourcePath': f'skills/mechanism-skills/{fam}/SKILL.md',
            'methods': methods,
        })

    standalone = []
    for name in ['msearch', 'mhistory', 'mechanic-db-search', 'arxiv',
                 'next-round', 'paper-figure']:
        m = frontmatter(os.path.join(root, name, 'SKILL.md'))
        standalone.append({
            'id': name, 'command': f'/{name}', 'name': title(name),
            'summary': summarize(m.get('description', ''), 2),
            'argumentHint': m.get('argument-hint', ''),
            'sourcePath': f'skills/{name}/SKILL.md',
        })

    print("""/* GENERATED by scripts/gen-skill-data.py — do not hand-edit.
   Names, summaries and paths come from each SKILL.md's own frontmatter, so this
   page cannot drift from the plugin it documents. Re-run after changing skills.

   The page used to list the 36 top-level skills, most of which are internal
   stages of /auto (auto-claim, auto-verify, run-experiment) that nobody invokes
   directly. What is documented here is what a user actually reaches for: the
   mechanism method library, and the standalone commands. */
""")
    print('export const MECHANISM_FAMILIES = '
          + json.dumps(families, indent=2, ensure_ascii=False) + '\n')
    print('export const STANDALONE_SKILLS = '
          + json.dumps(standalone, indent=2, ensure_ascii=False) + '\n')
    print("""export const METHOD_COUNT = MECHANISM_FAMILIES.reduce(
  (total, family) => total + family.methods.length,
  0,
)

export function getFamily(id) {
  return MECHANISM_FAMILIES.find((family) => family.id === id)
}

export function getStandalone(id) {
  return STANDALONE_SKILLS.find((skill) => skill.id === id)
}
""")

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '<MECHANIST_ROOT>/skills')
