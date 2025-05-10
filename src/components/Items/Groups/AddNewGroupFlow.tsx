import { App, Button, Form, Input, Modal, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMemo, useState } from 'react';
import stringSimilarity from 'string-similarity';
import type { ItemGroup } from 'types';
import { createUUID } from 'utils';

type AddNewGroupFlowProps = {
  data: UseResourceFirebaseDataReturnType<ItemGroup>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<ItemGroup>['addEntryToUpdate'];
};

export function AddNewGroupFlow({ addEntryToUpdate, data }: AddNewGroupFlowProps) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const onFinish = (values: any) => {
    const id = createUUID(Object.keys(data));
    addEntryToUpdate(id, {
      id: id,
      name: { pt: values.nome, en: values.name },
      itemsIds: [],
      keywords: values.keywords,
    });
    notification.success({ message: 'Group added successfully' });
    setOpen(false);
    form.resetFields();
  };

  const nameEn = Form.useWatch('name', form);
  const namePt = Form.useWatch('nome', form);
  const similar = useMemo(() => {
    const selection: PlainObject = {};
    if (nameEn && nameEn.length > 2) {
      const similarityThreshold = 0.2;
      const similarity = Object.entries(data).reduce((acc, [id, group]) => {
        const similarityScoreEn = stringSimilarity.compareTwoStrings(group.name.en, nameEn);
        const similarityScorePt = stringSimilarity.compareTwoStrings(group.name.pt, namePt);
        if (similarityScoreEn > similarityThreshold || similarityScorePt > similarityThreshold) {
          acc[id] = Math.max(similarityScoreEn, similarityScorePt);
        }
        return acc;
      }, {} as PlainObject);
      Object.keys(similarity).forEach((id) => {
        selection[id] = similarity[id];
      });
    }
    return Object.keys(selection);
  }, [nameEn, namePt, data]);

  return (
    <>
      <Button type="dashed" block onClick={() => setOpen(true)} className="mb-4">
        Add New Group
      </Button>
      <Modal
        title="Add New Set"
        open={open}
        onOk={form.submit}
        onCancel={() => setOpen(false)}
        maskClosable={false}
        okText="Add"
        okButtonProps={{ htmlType: 'submit' }}
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true }]}>
            <Input
              prefix={<LanguageFlag language="pt" width="1em" />}
              placeholder={'Name in pt'}
              size="small"
            />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input
              prefix={<LanguageFlag language="en" width="1em" />}
              placeholder={'Name in en'}
              size="small"
            />
          </Form.Item>
        </Form>
        <Typography.Text>Similar:</Typography.Text>
        <ul>
          {similar.map((id) => (
            <li key={id}>
              {id} - {data[id]?.name.en} / {data[id]?.name.pt}
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
