import { Space, Typography } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMeasure } from 'react-use';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { AddItemRules } from './AddItemRules';

type RulesByThingProps = {
  data: UseResourceFirebaseDataReturnType<DailyDiagramItem>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  thingsByRules: Record<string, string[]>;
};

export function RulesByThing({
  data,
  addEntryToUpdate,
  availableThings,
  rules,
  thingsByRules,
}: RulesByThingProps) {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  return (
    <Space direction="vertical" ref={ref}>
      <Typography.Title level={5}>
        Rules By Items (Added: {Object.keys(data).length} | {availableThings.length})
      </Typography.Title>

      <AddItemRules
        addEntryToUpdate={addEntryToUpdate}
        availableThings={availableThings}
        rules={rules}
        width={containerWidth}
      />
    </Space>
  );
}
