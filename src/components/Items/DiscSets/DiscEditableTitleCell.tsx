import { Space, Typography } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyDiscSet } from 'types';

type DiscEditableTitleCellProps = {
  value: DualLanguageValue;
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DiscEditableTitleCell({ value, disc, addEntryToUpdate }: DiscEditableTitleCellProps) {
  const handleChange = (newValue: string, language: Language) => {
    addEntryToUpdate(disc.id, {
      ...disc,
      title: {
        ...disc.title,
        [language]: newValue,
      },
    });
  };

  return (
    <Space orientation="vertical" size="small">
      <Typography.Text
        editable={{
          onChange: (v) => handleChange(v, 'pt'),
        }}
      >
        {String(value.pt)}
      </Typography.Text>
      <Typography.Text
        editable={{
          onChange: (v) => handleChange(v, 'en'),
        }}
      >
        {String(value.en)}
      </Typography.Text>
    </Space>
  );
}
