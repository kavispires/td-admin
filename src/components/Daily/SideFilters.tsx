import { Form, Select } from 'antd';
import { LANGUAGES } from 'utils/constants';

type SideFiltersProps = {
  language: string;
  setLanguage: (language: string) => void;
};
export function SideFilters({ language, setLanguage }: SideFiltersProps) {
  return (
    <div className="sider-content">
      <Form.Item label="Language">
        <Select style={{ minWidth: '150px' }} value={language} onChange={setLanguage}>
          <Select.Option value={''} disabled>
            Select a language
          </Select.Option>
          {LANGUAGES.map((entry) => (
            <Select.Option key={entry} value={entry}>
              {entry}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  );
}
