"""Content screening must inspect authored text, never missing-field placeholders."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('content_audit', ROOT / 'scripts/content_audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
PACK = json.loads(subprocess.check_output(
    ['node', '-e', "console.log(JSON.stringify(require('./pilot/pack.js')))"], cwd=ROOT))


class ContentAuditTests(unittest.TestCase):
    def test_uses_authored_consequences_and_debrief(self):
        scenario = PACK[0]
        extracted = audit.parts(scenario)
        for step in scenario['steps']:
            self.assertIn(step['defaultConsequence'], extracted['consequences'])
            for branch in step['branches']:
                self.assertIn(branch['text'], extracted['consequences'])
        self.assertEqual(extracted['debrief'], scenario['debriefIntent'])

    def test_absent_or_empty_authored_fields_fail_visibly(self):
        for key in ('debriefIntent',):
            for value in (None, ''):
                scenario = copy.deepcopy(PACK[0])
                if value is None:
                    del scenario[key]
                else:
                    scenario[key] = value
                with self.assertRaisesRegex(ValueError, key):
                    audit.parts(scenario)
        for key in ('branches', 'defaultConsequence'):
            scenario = copy.deepcopy(PACK[0])
            del scenario['steps'][0][key]
            with self.assertRaisesRegex(ValueError, key):
                audit.parts(scenario)

    def test_empty_text_is_unavailable_not_identical(self):
        self.assertIsNone(audit.similarity('', ''))
        self.assertIsNone(audit.similarity('the and', 'operational evidence'))

    def test_each_artifact_requires_text_even_when_neighbor_is_populated(self):
        for index in (0, 1):
            for value in ('', '   ', '\t\n', None, 42):
                with self.subTest(index=index, value=value):
                    scenario = copy.deepcopy(PACK[0])
                    artifact = scenario['steps'][0]['artifacts'][index]
                    artifact['text'] = value
                    context = f"{scenario['id']}/{scenario['steps'][0]['id']}/{artifact['id']}"
                    with self.assertRaisesRegex(ValueError, context + ': missing or empty authored text'):
                        audit.parts(scenario)

    def test_missing_artifact_text_fails_report_with_source_context(self):
        scenario = copy.deepcopy(PACK[0])
        artifact = scenario['steps'][0]['artifacts'][0]
        del artifact['text']
        with self.assertRaisesRegex(ValueError, 'PILOT-ESC-A/route/ESC-A-01: missing or empty authored text'):
            audit.build_report([scenario, PACK[1]], [])

    def test_populated_artifact_text_is_preserved_in_order(self):
        for scenario in PACK:
            expected = ' '.join(artifact['text'] for step in scenario['steps'] for artifact in step['artifacts'])
            self.assertEqual(audit.parts(scenario)['artifacts'], expected)

    def test_real_shared_and_distinct_text_scores(self):
        self.assertEqual(audit.similarity('Notify the crew', 'Inform the resource'), 1.0)
        self.assertEqual(audit.similarity('alpha bravo', 'charlie delta'), 0.0)


if __name__ == '__main__':
    unittest.main()
