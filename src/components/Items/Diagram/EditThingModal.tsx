import { Affix, Button, Flex, Form, Input, Modal, Radio, Switch } from 'antd';
import { useEffect, useMemo } from 'react';
import { DailyDiagramItem, DailyDiagramRule } from 'types';
import {
  CONSONANTS,
  stressSyllableDependencyVerifier,
  SYLLABLE_SEPARATOR,
  syllableDependencyVerifier,
  verifiers,
  VOWELS,
} from './utils';
import { Item } from 'components/Sprites';
import { orderBy } from 'lodash';
import clsx from 'clsx';
import { stringRemoveAccents } from 'utils';

export type ThingFormValues = Record<string, boolean | string | number>;

type EditThingModalProps = {
  isModalOpen: boolean;
  onSaveThing: (item: DailyDiagramItem) => void;
  onCancel: () => void;
  thing: DailyDiagramItem;
  rules: Dictionary<DailyDiagramRule>;
  width?: number;
  itemAliases?: string[];
  subtitle?: string;
  okButtonText?: string;
};

export function EditThingModal({
  isModalOpen,
  onSaveThing,
  onCancel,
  thing,
  rules,
  width,
  itemAliases,
  subtitle,
  okButtonText,
}: EditThingModalProps) {
  // Sort rules properly by type
  const orderedRules = useMemo(() => {
    return orderBy(Object.values(rules), [
      // Not auto
      (r) => {
        const index = ['manual', 'dependency', 'auto'].indexOf(r.method);
        return index === -1 ? Infinity : index;
      },
      // Sort by type
      (r) => {
        const index = ['grammar', 'comparison', 'order', 'count', 'contain', 'ends'].indexOf(r.type);
        return index === -1 ? Infinity : index;
      },
      // Sort by partial title
      (r) => r.title.slice(0, 7),
      // Sort by id
      (r) => Number(r.id.split('-')[1]),
    ]);
  }, [rules]);

  // Build initial values
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  const hasUndefinedValues = !values || Object.values(values ?? {}).some((value) => value === undefined);

  // Automation: If name is changed, recalculates all rules
  const nameWatch = Form.useWatch('name', form);
  useEffect(() => {
    console.log('Name changed', nameWatch);
    // If initial state where name is still undefined, ignore
    if (!nameWatch) return;

    if (thing.name && thing.syllables && nameWatch === thing.name) return;

    // If name changes, recalculate all rules
    const fields: Record<string, boolean | string | number | undefined> = {
      syllables: guessSyllablesSeparation(nameWatch),
      stressedSyllable: thing.stressedSyllable ?? nameWatch.includes(' ') ? -1 : 0,
    };
    Object.keys(rules).forEach((ruleId) => {
      if (verifiers[ruleId]) {
        fields[ruleId] = verifiers[ruleId](nameWatch);
      } else {
        fields[ruleId] = thing.rules.length > 0 ? thing.rules.includes(ruleId) : undefined;
      }
    });
    form.setFieldsValue(fields);
  }, [nameWatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Automation: Syllables
  const syllables = Form.useWatch('syllables', form);
  useEffect(() => {
    if (syllables) {
      const syllableRulesUpdate = Object.keys(rules).reduce((acc: Record<string, boolean>, ruleId) => {
        if (syllableDependencyVerifier[ruleId]) {
          acc[ruleId] = syllableDependencyVerifier[ruleId](syllables);
        }
        return acc;
      }, {});
      form.setFieldsValue({
        ...syllableRulesUpdate,
        stressedSyllable:
          syllables === thing.syllables
            ? thing.stressedSyllable
            : thing.stressedSyllable ?? nameWatch.includes(' ')
              ? -1
              : undefined,
      });
    }
  }, [syllables]); // eslint-disable-line react-hooks/exhaustive-deps

  // Automation: Stressed syllable
  const stressedSyllable = Form.useWatch('stressedSyllable', form);
  useEffect(() => {
    if (stressedSyllable !== undefined) {
      const stressSyllableRulesUpdate = Object.keys(rules).reduce((acc: Record<string, boolean>, ruleId) => {
        if (stressSyllableDependencyVerifier[ruleId]) {
          acc[ruleId] = stressSyllableDependencyVerifier[ruleId](syllables, stressedSyllable);
        }
        return acc;
      }, {});

      form.setFieldsValue({
        ...stressSyllableRulesUpdate,
      });
    }
  }, [stressedSyllable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Automation: Male vs Female nouns
  const rule1 = form.getFieldValue('ddr-1-pt');
  useEffect(() => {
    if (rule1 === true) {
      form.setFieldsValue({ 'ddr-2-pt': false });
    }
  }, [rule1]); // eslint-disable-line react-hooks/exhaustive-deps
  const rule2 = form.getFieldValue('ddr-2-pt');
  useEffect(() => {
    if (rule2 === true) {
      form.setFieldsValue({ 'ddr-1-pt': false });
    }
  }, [rule2]); // eslint-disable-line react-hooks/exhaustive-deps
  // Automation: syllable count
  const rule3 = form.getFieldValue('ddr-3-pt');
  useEffect(() => {
    if (rule3 === true) {
      form.setFieldsValue({ 'ddr-4-pt': false });
    }
  }, [rule3]); // eslint-disable-line react-hooks/exhaustive-deps
  const rule4 = form.getFieldValue('ddr-4-pt');
  useEffect(() => {
    if (rule4 === true) {
      form.setFieldsValue({ 'ddr-3-pt': false });
    }
  }, [rule4]); // eslint-disable-line react-hooks/exhaustive-deps
  // Automation: has hyphen
  useEffect(() => {
    const hasHyphen = nameWatch?.includes('-');
    if (hasHyphen) {
      form.setFieldsValue({ 'ddr-5-pt': true });
    }
  }, [nameWatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = (values: any) => {
    const preparedThing = serializeThing(values);
    onSaveThing(preparedThing);
  };

  const splitSyllables: string[] = (syllables ?? '').split(SYLLABLE_SEPARATOR);

  return (
    <Modal
      width={width}
      title={
        <>
          Edit {thing.name} {subtitle && <small>{subtitle}</small>}
        </>
      }
      open={isModalOpen}
      onOk={form.submit}
      onCancel={onCancel}
      maskClosable={false}
      okButtonProps={{ disabled: hasUndefinedValues, htmlType: 'submit', size: 'large' }}
      okText={okButtonText ?? 'Add Item'}
    >
      <Form
        form={form}
        name={`new-item-${thing.itemId}`}
        onFinish={onFinish}
        autoComplete="off"
        initialValues={deserializeThing(thing, rules)}
        layout="vertical"
        size="small"
        labelWrap
      >
        <div className="diagram-container">
          <div>
            <Item id={thing.itemId} width={50} />
          </div>

          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>

          <Form.Item name="itemId" label="Item">
            <Input readOnly />
          </Form.Item>

          <Form.Item name="syllables" label="Syllables">
            <Input />
          </Form.Item>

          <Form.Item name="stressedSyllable" label="Stressed Syllable">
            <Radio.Group optionType="button" buttonStyle="solid">
              {splitSyllables.map((syllable, index) => (
                <Radio key={index} value={splitSyllables.length - index - 1}>
                  {syllable}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item name="updatedAt" label="Updated At">
            <Input value={new Date(thing.updatedAt).toLocaleString()} readOnly />
          </Form.Item>

          {itemAliases && <div>Options: {itemAliases?.join(', ')}</div>}

          <div>
            <Affix offsetTop={50}>
              <Flex justify="center" align="center">
                <Button type="primary" htmlType="submit" size="large" disabled={hasUndefinedValues}>
                  {okButtonText ?? 'Add Item'}
                </Button>
              </Flex>
            </Affix>
          </div>
        </div>
        <div className="diagram-container">
          {orderedRules.map((rule) => {
            if (rule.method === 'auto' && verifiers[rule.id]) {
              return (
                <Form.Item
                  key={rule.id}
                  name={rule.id}
                  label={rule.title}
                  valuePropName="checked"
                  className={clsx(thing.updatedAt < rule.updatedAt && 'diagram-container__outdated-rule')}
                >
                  <Switch checkedChildren="✅" unCheckedChildren="❌" disabled />
                </Form.Item>
              );
            }

            if (rule.method === 'dependency') {
              return (
                <Form.Item
                  key={rule.id}
                  name={rule.id}
                  label={rule.title}
                  valuePropName="checked"
                  className={clsx(thing.updatedAt < rule.updatedAt && 'diagram-container__outdated-rule')}
                >
                  <Switch checkedChildren="✅" unCheckedChildren="❌" disabled />
                </Form.Item>
              );
            }

            return (
              <Form.Item
                key={rule.id}
                name={rule.id}
                label={rule.title}
                className={clsx(thing.updatedAt < rule.updatedAt && 'diagram-container__outdated-rule')}
              >
                <Radio.Group optionType="button" buttonStyle="solid">
                  <Radio value={true}>✅</Radio>
                  <Radio value={false}>❌</Radio>
                </Radio.Group>
              </Form.Item>
            );
          })}
        </div>
      </Form>
    </Modal>
  );
}

const deserializeThing = (
  thing: DailyDiagramItem,
  rules: Dictionary<DailyDiagramRule>
): Record<string, boolean | string | number> => {
  let wasAnyRuleUpdated = false;
  return {
    name: thing.name,
    itemId: thing.itemId,
    syllables: thing.syllables ?? guessSyllablesSeparation(thing.name),
    stressedSyllable: thing.stressedSyllable ?? 0,

    ...Object.keys(rules).reduce((acc: Record<string, boolean | undefined>, ruleId) => {
      // Only re-verify if rule is older than the last update
      if (thing.updatedAt < rules[ruleId].updatedAt) {
        if (verifiers[ruleId]) {
          const reVerify = verifiers[ruleId](thing.name);
          if (reVerify && thing.rules.includes(ruleId)) {
            wasAnyRuleUpdated = true;
          }
          acc[ruleId] = reVerify;
        } else {
          acc[ruleId] = undefined;
        }
      } else {
        acc[ruleId] = thing.rules.includes(ruleId);
      }

      return acc;
    }, {}),
    updatedAt: wasAnyRuleUpdated ? Date.now() : thing.updatedAt,
  };
};

const serializeThing = (values: Record<string, boolean | string | number>): DailyDiagramItem => {
  const { itemId, name, updatedAt, syllables, stressedSyllable, ...thingRules } = values;

  return {
    itemId: itemId as string,
    name: name as string,
    updatedAt: Date.now(),
    syllables: syllables as string,
    stressedSyllable: stressedSyllable as number,
    rules: Object.keys(thingRules).filter((key) => thingRules[key] === true),
  };
};

const checkIsVowel = (char: string) => VOWELS.includes(stringRemoveAccents(char));
const checkIsConsonant = (char: string) => CONSONANTS.includes(stringRemoveAccents(char));
const LMNRS = ['s', 'r', 'l', 'm', 'n'];
const DOUBLE_LETTERS = [
  'rr',
  'ss',
  'st',
  'sc',
  'lm',
  'ld',
  'mp',
  'mb',
  'rn',
  'rm',
  'rt',
  'rd',
  'lt',
  'ld',
  'nt',
  'nd',
  'sp',
  'ls',
];
const guessSyllablesSeparation = (word: string): string => {
  let syllables: string[] = [];
  let currentSyllable = '';

  const stringWithoutAccents = stringRemoveAccents(word);

  for (let i = 0; i < word.length; i++) {
    const char = stringWithoutAccents[i];
    // Space makes a syllable
    if (char === ' ') {
      syllables.push(currentSyllable);
      currentSyllable = '';
      continue;
    }

    // Hyphen makes a syllable
    if (char === '-') {
      syllables.push(currentSyllable + '-');
      currentSyllable = '';
      continue;
    }

    if (checkIsVowel(char) && i < stringWithoutAccents.length - 2) {
      const nextChar = stringWithoutAccents[i + 1];
      const nextNextChar = stringWithoutAccents[i + 2];
      // If the next character is a consonant and the next next character is a consonant, the first pair is a syllable
      if (LMNRS.includes(nextChar) && checkIsConsonant(nextNextChar)) {
        currentSyllable += word[i] + word[i + 1];
        i++; // Skip the next character
        continue;
      }
    }

    // Handle "c" followed by "h", "r", or "l"
    if (
      char === 'c' &&
      i < stringWithoutAccents.length - 2 &&
      ['h', 'r', 'l'].includes(stringWithoutAccents[i + 1]) &&
      checkIsVowel(stringWithoutAccents[i + 2])
    ) {
      currentSyllable += word[i] + word[i + 1] + word[i + 2];
      i += 2; // Skip the next two characters
      continue;
    }

    // Handle "l" or "n" followed by "h"
    if (
      ['l', 'n'].includes(char) &&
      i < stringWithoutAccents.length - 2 &&
      stringWithoutAccents[i + 1] === 'h' &&
      checkIsVowel(stringWithoutAccents[i + 2])
    ) {
      currentSyllable += word[i] + word[i + 1] + word[i + 2];
      i += 2; // Skip the next two characters
      continue;
    }

    // Handle consonant followed by vowel followed by consonant cluster
    if (
      checkIsConsonant(char) &&
      i < stringWithoutAccents.length - 3 &&
      checkIsVowel(stringWithoutAccents[i + 1]) &&
      LMNRS.includes(stringWithoutAccents[i + 2]) &&
      checkIsConsonant(stringWithoutAccents[i + 3])
    ) {
      currentSyllable += word[i] + word[i + 1] + word[i + 2];
      i += 2; // Skip the next two characters
      continue;
    }

    currentSyllable += word[i];

    if (
      checkIsVowel(char) &&
      i < stringWithoutAccents.length - 1 &&
      !checkIsVowel(stringWithoutAccents[i + 1]) &&
      !['l', 'r', 'n'].includes(stringWithoutAccents[i + 1])
    ) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
  }

  if (currentSyllable !== '') {
    syllables.push(currentSyllable);
  }

  // As a final effort, if there are syllables with "rr" or "ss", split them but keep the characters. e.g. carro -> car:ro
  syllables = syllables.map((syllable) => {
    for (const doubleLetter of DOUBLE_LETTERS) {
      if (syllable.includes(doubleLetter)) {
        return syllable.split(doubleLetter).join(`${doubleLetter[0]}${SYLLABLE_SEPARATOR}${doubleLetter[1]}`);
      }
    }
    return syllable;
  });

  return syllables.filter(Boolean).join(SYLLABLE_SEPARATOR);
};
