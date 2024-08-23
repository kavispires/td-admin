import { Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMemo } from 'react';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { useTDResource } from 'hooks/useTDResource';

import { RulesByThing } from './RulesByThing';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ThingsByRule } from './ThingsByRule';
import { orderBy } from 'lodash';

export function ItemsDiagramSetsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyDiagramItem>) {
  const tdrItemsQuery = useTDResource<ItemT>('items');
  const tdrDiagramRulesQuery = useTDResource<DailyDiagramRule>('daily-diagram-rules');

  const availableThings = useMemo(() => {
    return Object.values(tdrItemsQuery.data ?? {}).filter((item) => {
      if (data && data[item.id] !== undefined) return false;
      if (item.decks?.includes('thing')) return true;
      const isNameSingleWord = item.name.pt.split(' ').length === 1;

      if (item.decks?.includes('alien') && isNameSingleWord) return true;
      if (item.decks?.includes('manufactured') && isNameSingleWord) return true;

      return false;
    });
  }, [data, tdrItemsQuery.data]);

  const rules = useMemo(() => {
    return tdrDiagramRulesQuery.data ?? {};
  }, [tdrDiagramRulesQuery.data]);

  const thingsByRules = useMemo(() => {
    const dict = Object.values(rules).reduce((acc: Record<string, string[]>, rule) => {
      acc[rule.id] = [];
      return acc;
    }, {});

    orderBy(Object.values(data), ['updatedAt'], ['desc']).forEach((entry) => {
      entry.rules.forEach((ruleId) => {
        dict[ruleId].push(entry.itemId);
      });
    });
    return dict;
  }, [data, rules]);

  const { is, queryParams } = useQueryParams();

  if (tdrItemsQuery.isLoading || tdrDiagramRulesQuery.isLoading) {
    return <Typography.Text>Loading...</Typography.Text>;
  }

  return (
    <DataLoadingWrapper
      isLoading={tdrItemsQuery.isLoading || tdrDiagramRulesQuery.isLoading}
      hasResponseData={tdrItemsQuery.hasResponseData || tdrDiagramRulesQuery.hasResponseData}
    >
      {(is('display', 'rule') || !queryParams.has('display')) && (
        <ThingsByRule
          data={data}
          addEntryToUpdate={addEntryToUpdate}
          availableThings={availableThings}
          rules={rules}
          thingsByRules={thingsByRules}
        />
      )}

      {is('display', 'thing') && (
        <RulesByThing
          data={data}
          addEntryToUpdate={addEntryToUpdate}
          availableThings={availableThings}
          rules={rules}
          thingsByRules={thingsByRules}
        />
      )}
    </DataLoadingWrapper>
  );
}
