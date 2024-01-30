import { Divider, Form, InputNumber, Select } from 'antd';

type SuspectsFiltersProps = {
  selectedVersion: string;
  setSelectedVersion: (deck: string) => void;
  cardsPerRow: number;
  setCardsPerRow: (cardsPerRow: number) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
};

export function SuspectsFilters({
  selectedVersion,
  setSelectedVersion,
  cardsPerRow,
  setCardsPerRow,
  sortBy,
  setSortBy,
}: SuspectsFiltersProps) {
  return (
    <div className="sider-content">
      <Form.Item label="Version">
        <Select style={{ minWidth: '150px' }} onChange={setSelectedVersion} value={selectedVersion}>
          <Select.Option value="ct">Cartoon</Select.Option>
          <Select.Option value="ai">AI</Select.Option>
          <Select.Option value="md">Models</Select.Option>
          <Select.Option value="wc">Wacky</Select.Option>
          <Select.Option value="original">Original</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Cards Per Row">
        <InputNumber
          min={1}
          max={8}
          value={cardsPerRow}
          onChange={(v) => setCardsPerRow(v ?? 8)}
          style={{ minWidth: '150px' }}
        />
      </Form.Item>
      <Form.Item label="Sort By">
        <Select style={{ minWidth: '150px' }} onChange={setSortBy} value={sortBy}>
          <Select.Option value="id">Id</Select.Option>
          <Select.Option value="name.pt">Name (PT)</Select.Option>
          <Select.Option value="name.en">Name (EN)</Select.Option>
          <Select.Option value="ethnicity">Ethnicity</Select.Option>
          <Select.Option value="gender">Gender</Select.Option>
        </Select>
      </Form.Item>
      <Divider />
    </div>
  );
}
