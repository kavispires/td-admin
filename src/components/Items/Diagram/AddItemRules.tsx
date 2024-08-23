import { Affix, App, Button, Flex, Form, Input, Modal, Radio, Switch } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { sample } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { verifiers } from './utils';
import { Item } from 'components/Sprites';
import { wait } from 'utils';

type AddItemRulesProps = {
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  width: number;
};

export function AddItemRules({ addEntryToUpdate, availableThings, rules, width }: AddItemRulesProps) {
  const { notification } = App.useApp();

  const [activeThing, setActiveThing] = useState<ItemT | null>(null);

  const onActivateThing = () => {
    setActiveThing(sample(availableThings) ?? null);
  };

  const onAddItem = async (newItem: Record<string, boolean | string | number>) => {
    if (!activeThing) return;
    if (!newItem.name || !newItem.itemId) {
      notification.error({ message: 'Name and Item ID are required' });
    }

    const { itemId, name, updatedAt, ...itemRules } = newItem;

    const itemEntry: DailyDiagramItem = {
      itemId: itemId as string,
      name: name as string,
      updatedAt: updatedAt as number,
      rules: Object.keys(itemRules).filter((key) => itemRules[key] === true),
    };

    addEntryToUpdate(itemId as string, itemEntry);

    console.log('COMPLETED SAVE');

    setActiveThing(null);

    await wait(500);

    onActivateThing();
  };

  return (
    <>
      <Button size="large" onClick={onActivateThing}>
        Classify New Item
      </Button>
      {!!activeThing && (
        <AddItemModal
          isModalOpen={activeThing !== null}
          onAddItem={onAddItem}
          handleCancel={() => setActiveThing(null)}
          item={activeThing}
          rules={rules}
          width={width * 0.9}
        />
      )}
    </>
  );
}

const chooseNameThatIsASingleWord = (item: ItemT) => {
  if (item.name.pt.split(' ').length === 1) return item.name.pt;

  if (item.aliasesPt) {
    return item.aliasesPt.find((alias) => alias.split(' ').length === 1) ?? item.name.pt;
  }
  return item.name.pt;
};

type AddItemModalProps = {
  isModalOpen: boolean;
  onAddItem: (item: Record<string, boolean | string>) => void;
  handleCancel: () => void;
  item: ItemT;
  rules: Dictionary<DailyDiagramRule>;
  width?: number;
};

function AddItemModal({ isModalOpen, onAddItem, handleCancel, item, rules, width }: AddItemModalProps) {
  const initialValues = useMemo(() => {
    const name = chooseNameThatIsASingleWord(item);
    return {
      itemId: item.id,
      name,
      updatedAt: Date.now(),
      ...Object.keys(rules).reduce((acc: Record<string, boolean | undefined>, ruleId) => {
        if (verifiers[ruleId]) {
          acc[ruleId] = verifiers[ruleId](name);
        } else {
          acc[ruleId] = undefined;
        }

        return acc;
      }, {}),
    };
  }, [item, rules]);

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  const hasUndefinedValues = !values || Object.values(values ?? {}).some((value) => value === undefined);

  // Automation: If name is changed, recalculates all rules
  const nameWatch = Form.useWatch('name', form);
  useEffect(() => {
    console.log('Name changed', nameWatch);
    // If initial state where name is still undefined, ignore
    if (!nameWatch) return;

    // If name changes, recalculate all rules
    Object.keys(rules).forEach((ruleId) => {
      if (verifiers[ruleId]) {
        form.setFieldsValue({ [ruleId]: verifiers[ruleId](nameWatch) });
      } else {
        form.setFieldsValue({ [ruleId]: undefined });
      }
    });
  }, [nameWatch]); // eslint-disable-line react-hooks/exhaustive-deps

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
    console.log('Received values:', values);
    onAddItem(values);
  };

  return (
    <Modal
      width={width}
      title="Evaluate Random item"
      open={isModalOpen}
      onOk={form.submit}
      onCancel={handleCancel}
      maskClosable={false}
      okButtonProps={{ disabled: hasUndefinedValues, htmlType: 'submit', size: 'large' }}
      okText="Add Item"
    >
      <Form
        form={form}
        name={`new-item-${item.id}`}
        onFinish={onFinish}
        autoComplete="off"
        initialValues={initialValues}
        layout="vertical"
        size="small"
        labelWrap
      >
        <div className="diagram-container">
          <div>
            <Item id={item.id} width={50} />
          </div>

          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>

          <Form.Item name="itemId" label="Item">
            <Input readOnly />
          </Form.Item>

          <Form.Item name="updatedAt" label="Updated At">
            <Input readOnly />
          </Form.Item>

          <div>
            Options: {item.name.pt} {item.aliasesPt?.join(', ')}
          </div>

          <div>
            <Affix offsetTop={50}>
              <Flex justify="center" align="center">
                <Button type="primary" htmlType="submit" size="large" disabled={hasUndefinedValues}>
                  Add Item
                </Button>
              </Flex>
            </Affix>
          </div>
        </div>
        <div className="diagram-container">
          {Object.values(rules).map((rule) => {
            if (rule.auto && verifiers[rule.id]) {
              return (
                <Form.Item key={rule.id} name={rule.id} label={rule.title} valuePropName="checked">
                  <Switch checkedChildren="✅" unCheckedChildren="❌" disabled />
                </Form.Item>
              );
            }

            return (
              <Form.Item key={rule.id} name={rule.id} label={rule.title}>
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
