import { Form, Input, Select, Button, Drawer } from 'antd';
import { useState } from 'react';
import type { EscapeRoomEpisode } from './types';
import { FolderAddOutlined } from '@ant-design/icons';
import type { EscapeRoomResourceContextType } from './EscapeRoomFilters';

const { Option } = Select;

type AddNewEpisodeProps = Pick<EscapeRoomResourceContextType, 'data' | 'addEntryToUpdate'>;

export function AddNewEpisode({ data, addEntryToUpdate }: AddNewEpisodeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button block icon={<FolderAddOutlined />} onClick={() => setOpen(true)}>
        Add New Episode
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <NewEpisodeForm data={data} addEntryToUpdate={addEntryToUpdate} />
      </Drawer>
    </>
  );
}

function NewEpisodeForm({ data, addEntryToUpdate }: AddNewEpisodeProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: Partial<EscapeRoomEpisode>) => {
    const newEpisode: EscapeRoomEpisode = {
      id: generateEpisodeId(data, values.language || 'en'),
      title: values.title || '',
      language: values.language || 'en',
      total: 0,
      difficulty: values.difficulty || 'basic',
      missions: {}, // Placeholder
      cards: {
        'erc-0': {
          id: 'erc-0',
          type: 'complete-mission',
          content: null,
        },
      }, // Placeholder
      ready: false,
      updatedAt: Date.now(),
    };

    addEntryToUpdate(newEpisode.id, newEpisode);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        difficulty: 'basic',
      }}
    >
      <Form.Item
        label="Language"
        name="language"
        rules={[{ required: true, message: 'Please select the language of the episode' }]}
      >
        <Select>
          <Option value="en">English</Option>
          <Option value="pt">Portuguese</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter the title' }]}>
        <Input placeholder="Enter the title" />
      </Form.Item>

      <Form.Item
        label="Difficulty"
        name="difficulty"
        rules={[{ required: true, message: 'Please select the difficulty level' }]}
      >
        <Select>
          <Option value="basic">Basic</Option>
          <Option value="medium">Medium</Option>
          <Option value="complex">Complex</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create Episode
        </Button>
      </Form.Item>
    </Form>
  );
}

/**
 * Generates a new episode id based on the current data.
 * The ids are comprised of `ere-${number}` where number is the highest number in the current ids + 1
 * @param data - The data from which to generate the new episode ID.
 * @returns string
 */
const generateEpisodeId = (data: EscapeRoomResourceContextType['data'], language: Language) => {
  const ids = Object.keys(data);
  const numbers = ids.map((id) => Number.parseInt(id.split('-')[1], 10));
  const highestNumber = Math.max(0, ...numbers);
  return `ere-${highestNumber + 1}-${language}`;
};
