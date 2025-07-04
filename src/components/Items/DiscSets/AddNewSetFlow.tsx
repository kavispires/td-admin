import { Button, Form, Input, Modal, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { camelCase } from 'lodash';
import { useMemo, useState } from 'react';
import stringSimilarity from 'string-similarity';
import type { DailyDiscSet } from 'types';

type AddNewSetFlowProps = {
  ids: string[];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function AddNewSetFlow({ addEntryToUpdate, ids }: AddNewSetFlowProps) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const id = camelCase(values.name);
    addEntryToUpdate(camelCase(id), {
      id: id,
      title: { pt: values.nome, en: values.name },
      itemsIds: [],
    });
  };

  const nameEn = Form.useWatch('name', form);
  const similar = useMemo(() => {
    const selection: PlainObject = {};
    if (nameEn && nameEn.length > 2) {
      const id = camelCase(nameEn);
      if (id) {
        try {
          const sim = stringSimilarity.findBestMatch(id, ids);
          sim.ratings.forEach((rating) => {
            if (rating.rating > 0.4) {
              selection[rating.target] = rating.rating;
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    return Object.keys(selection);
  }, [nameEn, ids]);

  return (
    <>
      <Button block onClick={() => setOpen(true)} type="dashed">
        Add New Set
      </Button>
      <Modal
        maskClosable={false}
        okButtonProps={{ htmlType: 'submit' }}
        okText="Add"
        onCancel={() => setOpen(false)}
        onOk={form.submit}
        open={open}
        title="Add New Set"
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item label="Nome" name="nome" rules={[{ required: true }]}>
            <Input
              placeholder={'Name in pt'}
              prefix={<LanguageFlag language="pt" width="1em" />}
              size="small"
            />
          </Form.Item>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input
              placeholder={'Name in en'}
              prefix={<LanguageFlag language="en" width="1em" />}
              size="small"
            />
          </Form.Item>
        </Form>
        <Typography.Text>Similar:</Typography.Text>
        <ul>
          {similar.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
