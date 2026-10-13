"""Lexical/structural screening of authored text, NOT human semantic validation."""
import itertools
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
# Bounded vocabulary normalization is transparent; no model/API inference.
ALIASES = {'notify':'notification','notifying':'notification','inform':'notification',
           'confirm':'verify','verified':'verify','reconcile':'verify','handoff':'handover',
           'crew':'resource','crews':'resource','pump':'resource','pumps':'resource','unavailable':'missing'}
STOP = {'the','a','an','and','or','is','to','of','in','for','with','this','that','are','not',
        'at','as','from','by','be','it','your','you','must'}


def tokens(value):
    return [ALIASES.get(t, t) for t in re.findall(r'[a-z]{3,}', value.lower()) if t not in STOP]


def authored_text(record, key, context):
    value = record.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f'{context}: missing or empty authored {key}')
    return value


def parts(scenario):
    context = scenario['id']
    consequences = []
    for step in scenario['steps']:
        step_context = f"{context}/{step['id']}"
        if not isinstance(step.get('branches'), list):
            raise ValueError(f'{step_context}: missing or invalid branches')
        consequences.extend(authored_text(branch, 'text', step_context) for branch in step['branches'])
        consequences.append(authored_text(step, 'defaultConsequence', step_context))
    return {
        'objective': authored_text(scenario, 'objective', context),
        'prompts': ' '.join(authored_text(step, 'instruction', context) for step in scenario['steps']),
        'choices': ' '.join(option['label'] for step in scenario['steps'] for field in step['fields']
                            for option in field.get('options', [])),
        'artifacts': ' '.join(
            authored_text(artifact, 'text', f"{context}/{step['id']}/{artifact.get('id', 'artifact')}")
            for step in scenario['steps'] for artifact in step['artifacts']),
        'consequences': ' '.join(consequences),
        'debrief': authored_text(scenario, 'debriefIntent', context),
        'structure': [(step['id'], [(field['type'], field.get('expected')) for field in step['fields']])
                      for step in scenario['steps']],
    }


def similarity(left, right):
    a, b = set(tokens(left)), set(tokens(right))
    # A missing dimension is unavailable, never evidence of perfect similarity.
    return round(len(a & b) / len(a | b), 3) if a and b else None


def build_report(pack, legacy):
    extracted = {scenario['id']: parts(scenario) for scenario in pack}
    flags = []
    unavailable = []
    for left, right in itertools.combinations(pack, 2):
        a, b = extracted[left['id']], extracted[right['id']]
        scores = {key: similarity(a[key], b[key]) for key in a if key != 'structure'}
        same = a['structure'] == b['structure']
        high = [key for key, value in scores.items() if value is not None and value >= .70]
        missing = [key for key, value in scores.items() if value is None]
        if missing:
            unavailable.append({'left':left['id'], 'right':right['id'], 'dimensions':missing})
        if high or same:
            flags.append({'left':left['id'], 'right':right['id'], 'similarity':scores,
                          'identicalStructure':same, 'flaggedDimensions':high,
                          'humanReview':'pending', 'decision':None})
    groups = {}
    for scenario in legacy:
        groups.setdefault(scenario['pattern'], []).append(scenario['id'])
    return {
        'commit': os.getenv('TRG_SOURCE_SHA', os.getenv('GITHUB_SHA', 'local-working-tree')),
        'method': 'Token alias normalization, Jaccard similarity at 0.70, and interaction structure. '
                  'Reads branches[].text, defaultConsequence and debriefIntent. Empty dimensions are unavailable; '
                  'missing required authored fields fail the audit. Lexical/structural screening, not semantic '
                  'embedding or professional validity judgment.',
        'packRecords': len(pack),
        'baseExperiences': sum(not s['retest']['transferFrom'] for s in pack),
        'transferConditions': sum(bool(s['retest']['transferFrom']) for s in pack),
        'legacyStarterRecords': len(legacy), 'legacySharedPatternGroups':groups,
        'unavailableComparisons': unavailable, 'flags':flags,
        'approval': 'No flag is automatically approved or rejected.',
    }


def main():
    pack = json.loads(subprocess.check_output(
        ['node', '-e', "console.log(JSON.stringify(require('./pilot/pack.js')))"], cwd=ROOT))
    legacy = json.loads((ROOT / 'assets/catalog.json').read_text())
    legacy = legacy if isinstance(legacy, list) else legacy['scenarios']
    report = build_report(pack, legacy)
    out = ROOT / 'qa/pilot'
    out.mkdir(exist_ok=True)
    (out / 'content-repetition.json').write_text(json.dumps(report, indent=2))
    print(json.dumps({'packRecords':len(pack), 'flaggedPairs':len(report['flags']), 'humanReview':'pending'}))


if __name__ == '__main__':
    main()
