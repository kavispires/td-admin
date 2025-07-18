import { Affix, Button, Flex, Form, Input, Modal, Radio, Switch } from 'antd';
import clsx from 'clsx';
import { Item } from 'components/Sprites';
import { orderBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import type { DailyDiagramItem, DailyDiagramRule } from 'types';
import {
  SYLLABLE_SEPARATOR,
  separateSyllables,
  stressSyllableDependencyVerifier,
  syllableDependencyVerifier,
  verifiers,
} from './utils';

export type ThingFormValues = Record<string, boolean | string | number>;

type EditThingModalProps = {
  isModalOpen: boolean;
  onSaveThing: (item: DailyDiagramItem) => void;
  onCancel: () => void;
  thing: DailyDiagramItem;
  rules: Dictionary<DailyDiagramRule>;
  width?: number | string;
  itemAliases?: string[];
  subtitle?: string;
  okButtonText?: string;
  onGiveAnotherThing?: () => void;
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
  onGiveAnotherThing,
}: EditThingModalProps) {
  // Sort rules properly by type
  const orderedRules = useMemo(() => {
    return orderBy(Object.values(rules), [
      // Not auto
      (r) => {
        const index = ['manual', 'dependency', 'auto'].indexOf(r.method);
        return index === -1 ? Number.POSITIVE_INFINITY : index;
      },
      // Sort by type
      (r) => {
        const index = ['grammar', 'comparison', 'order', 'count', 'contains', 'ends'].indexOf(r.type);
        return index === -1 ? Number.POSITIVE_INFINITY : index;
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    // If initial state where name is still undefined, ignore
    if (!nameWatch) return;

    if (thing.name && thing.syllables && nameWatch === thing.name) return;

    // If name changes, recalculate all rules
    const fields: Record<string, boolean | string | number | undefined> = {
      syllables: separateSyllables(nameWatch),
      stressedSyllable: (thing.stressedSyllable ?? nameWatch.includes(' ')) ? -1 : 0,
    };
    Object.keys(rules).forEach((ruleId) => {
      if (verifiers[ruleId]) {
        fields[ruleId] = verifiers[ruleId](nameWatch);
      } else {
        fields[ruleId] = thing.rules.length > 0 ? thing.rules.includes(ruleId) : undefined;
      }
    });
    form.setFieldsValue(fields);
  }, [nameWatch]);

  // Automation: Syllables
  const syllables = Form.useWatch('syllables', form);
  const isAcronym = form.getFieldValue('ddr-51-pt');

  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (isAcronym) {
      form.setFieldsValue({ stressedSyllable: undefined });
      form.setFieldsValue({ 'ddr-43-pt': false });
      form.setFieldsValue({ 'ddr-44-pt': false });
      form.setFieldsValue({ 'ddr-45-pt': false });
      form.setFieldsValue({ 'ddr-46-pt': false });
    }
    if (isAcronym === undefined) {
      form.setFieldsValue({ 'ddr-51-pt': false });
    }
  }, [isAcronym]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (syllables) {
      const syllableRulesUpdate = Object.keys(rules).reduce((acc: Record<string, boolean>, ruleId) => {
        if (syllableDependencyVerifier[ruleId]) {
          acc[ruleId] = syllableDependencyVerifier[ruleId](nameWatch, syllables, isAcronym);
        }
        return acc;
      }, {});
      form.setFieldsValue({
        ...syllableRulesUpdate,
        stressedSyllable:
          syllables === thing.syllables
            ? thing.stressedSyllable
            : (thing.stressedSyllable ?? nameWatch.includes(' '))
              ? -1
              : undefined,
      });
    }
  }, [nameWatch, syllables, isAcronym]);

  // Automation: Stressed syllable
  const stressedSyllable = Form.useWatch('stressedSyllable', form);
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (!isAcronym && stressedSyllable !== undefined) {
      const stressSyllableRulesUpdate = Object.keys(rules).reduce((acc: Record<string, boolean>, ruleId) => {
        if (stressSyllableDependencyVerifier[ruleId]) {
          acc[ruleId] = stressSyllableDependencyVerifier[ruleId](nameWatch, syllables, stressedSyllable);
        }
        return acc;
      }, {});

      form.setFieldsValue({
        ...stressSyllableRulesUpdate,
      });
    }
  }, [stressedSyllable]);

  // Automation: Male vs Female nouns vs Both genders
  const rule1 = form.getFieldValue('ddr-1-pt');
  const rule2 = form.getFieldValue('ddr-2-pt');
  const rule5 = form.getFieldValue('ddr-50-pt');
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (rule1 === true) {
      form.setFieldsValue({ 'ddr-2-pt': false });
      form.setFieldsValue({ 'ddr-50-pt': false });
    }
  }, [rule1]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (rule2 === true) {
      form.setFieldsValue({ 'ddr-1-pt': false });
      form.setFieldsValue({ 'ddr-50-pt': false });
    }
  }, [rule2]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (rule5 === true) {
      form.setFieldsValue({ 'ddr-1-pt': false });
      form.setFieldsValue({ 'ddr-2-pt': false });
    }
  }, [rule5]);

  // Automation: syllable count
  const rule3 = form.getFieldValue('ddr-3-pt');
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (rule3 === true) {
      form.setFieldsValue({ 'ddr-4-pt': false });
    }
  }, [rule3]);
  const rule4 = form.getFieldValue('ddr-4-pt');
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    if (rule4 === true) {
      form.setFieldsValue({ 'ddr-3-pt': false });
    }
  }, [rule4]);

  // Automation: has hyphen
  // biome-ignore lint/correctness/useExhaustiveDependencies: form is not a dependency
  useEffect(() => {
    const hasHyphen = nameWatch?.includes('-');
    if (hasHyphen) {
      form.setFieldsValue({ 'ddr-5-pt': true });
    }
  }, [nameWatch]);

  const onFinish = (values: any) => {
    const preparedThing = serializeThing(values);
    onSaveThing(preparedThing);
  };

  const splitSyllables: string[] = useMemo(() => (syllables ?? '').split(SYLLABLE_SEPARATOR), [syllables]);

  return (
    <Modal
      maskClosable={false}
      okButtonProps={{ disabled: hasUndefinedValues, htmlType: 'submit', size: 'large' }}
      okText={okButtonText ?? 'Add Item'}
      onCancel={onCancel}
      onOk={form.submit}
      open={isModalOpen}
      title={
        <>
          Edit {thing.name} {subtitle && <small>{subtitle}</small>}
        </>
      }
      width={width}
    >
      <Form
        autoComplete="off"
        form={form}
        initialValues={deserializeThing(thing, rules)}
        labelWrap
        layout="vertical"
        name={`new-item-${thing.itemId}`}
        onFinish={onFinish}
        size="small"
      >
        <div className="diagram-container">
          <div>
            <Item id={thing.itemId} width={50} />
          </div>

          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>

          <Form.Item label="Item" name="itemId">
            <Input readOnly />
          </Form.Item>

          <Form.Item label="Syllables" name="syllables">
            <Input />
          </Form.Item>

          <Form.Item label="Stressed Syllable" name="stressedSyllable">
            <Radio.Group buttonStyle="solid" optionType="button">
              {splitSyllables.map((syllable, index) => (
                <Radio key={index} value={splitSyllables.length - index - 1}>
                  {syllable}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Updated At" name="updatedAt">
            <Input readOnly value={new Date(thing.updatedAt).toLocaleString()} />
          </Form.Item>

          {(itemAliases || onGiveAnotherThing) && (
            <div>
              {onGiveAnotherThing && (
                <Button className="mt-2" onClick={onGiveAnotherThing} size="small" type="dashed">
                  Give me another thing
                </Button>
              )}
              {itemAliases && <span>Options: {itemAliases?.join(', ')}</span>}
            </div>
          )}

          <div>
            <Affix offsetTop={50}>
              <Flex align="center" justify="center">
                <Button disabled={hasUndefinedValues} htmlType="submit" size="large" type="primary">
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
                  className={clsx(thing.updatedAt < rule.updatedAt && 'diagram-container__outdated-rule')}
                  key={rule.id}
                  label={rule.title}
                  name={rule.id}
                  valuePropName="checked"
                >
                  <Switch checkedChildren="✅" disabled unCheckedChildren="❌" />
                </Form.Item>
              );
            }

            if (rule.method === 'dependency') {
              return (
                <Form.Item
                  className={clsx(thing.updatedAt < rule.updatedAt && 'diagram-container__outdated-rule')}
                  key={rule.id}
                  label={rule.title}
                  name={rule.id}
                  valuePropName="checked"
                >
                  <Switch checkedChildren="✅" disabled unCheckedChildren="❌" />
                </Form.Item>
              );
            }

            return (
              <Form.Item
                className={clsx(thing.updatedAt < rule.updatedAt && 'diagram-container__outdated-rule')}
                key={rule.id}
                label={rule.title}
                name={rule.id}
              >
                <Radio.Group buttonStyle="solid" optionType="button">
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
  rules: Dictionary<DailyDiagramRule>,
): Record<string, boolean | string | number> => {
  let wasAnyRuleUpdated = false;
  return {
    name: thing.name,
    itemId: thing.itemId,
    syllables: thing.syllables ?? separateSyllables(thing.name),
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
  const { itemId, name, syllables, stressedSyllable, ...thingRules } = values;

  return {
    itemId: itemId as string,
    name: name as string,
    updatedAt: Date.now(),
    syllables: syllables as string,
    stressedSyllable: stressedSyllable as number,
    rules: Object.keys(thingRules).filter((key) => thingRules[key] === true),
  };
};
