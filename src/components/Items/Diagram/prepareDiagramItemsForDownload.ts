import type { DailyDiagramItemData, DailyDiagramRuleData } from '@types';
import { parseDiagramRuleId } from '@utils/diagram-items';
import { sortJsonKeys } from '@utils/json';
import { cloneDeep } from 'lodash';
import { stressSyllableDependencyVerifier, syllableDependencyVerifier, verifiers } from './utils';

export function prepareDiagramItemsForDownload(
  diagramItems: Dictionary<DailyDiagramItemData>,
  rules: Dictionary<DailyDiagramRuleData>,
) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);

  const now = Date.now();

  Object.values(copy).forEach((item) => {
    const outdatedRules = Object.values(rules).filter((rule) => rule.updatedAt > item.updatedAt);
    const hasRuleBeenUpdated = outdatedRules.map(() => false);

    // Track initial rules to detect actual changes
    const initialRules = [...item.rules];
    let rulesChanged = false;

    // Performing AUTO updates - Re-run ALL auto rules regardless of timestamp
    const allAutoRules = Object.values(rules).filter((rule) => rule.method === 'auto');
    if (allAutoRules.length > 0) {
      console.log(`Performing ${allAutoRules.length} auto updates for ${item.name}`);
      // Remove all auto rules
      const autoRuleIds = allAutoRules.map((rule) => parseDiagramRuleId(rule.id));
      item.rules = item.rules.filter((ruleId) => !autoRuleIds.includes(ruleId));
      // Rerun all auto rules
      allAutoRules.forEach((rule) => {
        const pass = verifiers[rule.id](item.name);
        if (pass) {
          item.rules.push(parseDiagramRuleId(rule.id));
        }
        // Mark outdated rule as verified
        const ruleIndex = outdatedRules.findIndex((r) => r.id === rule.id);
        if (ruleIndex !== -1) {
          hasRuleBeenUpdated[ruleIndex] = true;
        }
      });
    }

    // Performing DEPENDENCY updates - Re-run ALL dependency rules regardless of timestamp
    const allDependencyRules = Object.values(rules).filter((rule) => rule.method === 'dependency');
    if (allDependencyRules.length > 0) {
      console.log(`Performing ${allDependencyRules.length} dependency updates for ${item.name}`);

      // Remove all dependency rules
      const dependencyRuleIds = allDependencyRules.map((rule) => parseDiagramRuleId(rule.id));
      item.rules = item.rules.filter((ruleId) => !dependencyRuleIds.includes(ruleId));

      const isAcronym = item.rules.includes(51);
      const syllables = item.syllables ?? '';
      const stressSyllable = item.stressedSyllable;
      // Rerun all dependency rules
      allDependencyRules.forEach((rule) => {
        const ruleNumber = parseDiagramRuleId(rule.id);
        // Try to do a syllable verifier
        if (syllableDependencyVerifier[rule.id] && syllables) {
          const pass = syllableDependencyVerifier[rule.id](item.name, syllables, isAcronym);
          if (pass) {
            item.rules.push(ruleNumber);
          } else {
            item.rules = item.rules.filter((r) => r !== ruleNumber);
          }
          const ruleIndex = outdatedRules.findIndex((r) => r.id === rule.id);
          if (ruleIndex !== -1) {
            hasRuleBeenUpdated[ruleIndex] = true;
          }
        }
        // Try to do a stress syllable verifier
        if (stressSyllableDependencyVerifier[rule.id] && syllables && stressSyllable !== undefined) {
          const pass = stressSyllableDependencyVerifier[rule.id](item.name, syllables, stressSyllable);
          if (pass) {
            item.rules.push(ruleNumber);
          } else {
            item.rules = item.rules.filter((r) => r !== ruleNumber);
          }
          const ruleIndex = outdatedRules.findIndex((r) => r.id === rule.id);
          if (ruleIndex !== -1) {
            hasRuleBeenUpdated[ruleIndex] = true;
          }
        }
      });
    }

    // Check if rules actually changed
    rulesChanged =
      initialRules.length !== item.rules.length ||
      !initialRules.every((ruleId) => item.rules.includes(ruleId));

    if (rulesChanged) {
      console.log(`Rules changed for ${item.name}, updating timestamp`);
      item.updatedAt = now;
    } else if (hasRuleBeenUpdated.every(Boolean) && hasRuleBeenUpdated.length > 0) {
      console.log(`All outdated rules verified for ${item.name}, but no changes detected`);
    }

    // Sort rules by value
    item.rules.sort((a, b) => a - b);
  });

  return sortJsonKeys(copy);
}
