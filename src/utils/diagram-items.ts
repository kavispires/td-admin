export function parseDiagramRuleId(ruleId: string): number {
  const match = /^ddr-([1-9]\d*)-pt$/.exec(ruleId);
  const number = Number(match?.[1]);

  if (match?.[0] !== ruleId || !Number.isSafeInteger(number)) {
    throw new Error(`Invalid Portuguese Diagram rule ID "${ruleId}".`);
  }

  return number;
}

export function composeDiagramRuleId(number: number): string {
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`Invalid Diagram rule number "${number}".`);
  }

  return `ddr-${number}-pt`;
}
