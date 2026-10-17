import { describe, expect, it } from 'vitest';
import { composeDiagramRuleId, parseDiagramRuleId } from './diagram-items';

describe('Diagram rule IDs', () => {
  it.each([1, 14, 83, Number.MAX_SAFE_INTEGER])('converts rule number %s in both directions', (number) => {
    const ruleId = `ddr-${number}-pt`;
    expect(composeDiagramRuleId(number)).toBe(ruleId);
    expect(parseDiagramRuleId(ruleId)).toBe(number);
  });

  it.each(['1', 'ddr-01-pt', 'ddr-0-pt', 'ddr-1-en', 'ddr-1-pt\n', 'ddr-9007199254740992-pt'])(
    'rejects invalid rule ID %s',
    (ruleId) => {
      expect(() => parseDiagramRuleId(ruleId)).toThrow(`Invalid Portuguese Diagram rule ID "${ruleId}".`);
    },
  );

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid rule number %s',
    (number) => {
      expect(() => composeDiagramRuleId(number)).toThrow(`Invalid Diagram rule number "${number}".`);
    },
  );
});
