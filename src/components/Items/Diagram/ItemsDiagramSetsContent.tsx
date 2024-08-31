import { Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMemo, useState } from 'react';
import { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { useTDResource } from 'hooks/useTDResource';

import { RulesByThing } from './RulesByThing';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ThingsByRule } from './ThingsByRule';
import { orderBy } from 'lodash';
import { ItemUpdateGuard } from './ItemUpdateGuard';
import { GameSimulator } from './GameSimulator';
import { EditThingModal } from './EditThingModal';
import { useMeasure } from 'react-use';

export function ItemsDiagramSetsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyDiagramItem>) {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();
  const tdrItemsQuery = useTDResource<ItemT>('items');
  const tdrDiagramRulesQuery = useTDResource<DailyDiagramRule>('daily-diagram-rules');

  const availableThings = useMemo(() => {
    return Object.values(tdrItemsQuery.data ?? {}).filter((item) => {
      if (data && data[item.id] !== undefined) return false;
      if (item.nsfw) return false;
      const isNameSingleWord = item.name.pt.split(' ').length === 1;

      if (item.decks?.includes('thing')) return true;
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
  const [activeThing, setActiveThing] = useState<DailyDiagramItem | null>(null);

  if (tdrItemsQuery.isLoading || tdrDiagramRulesQuery.isLoading) {
    return <Typography.Text>Loading...</Typography.Text>;
  }

  const onUpdateThing = (newThing: DailyDiagramItem) => {
    addEntryToUpdate(newThing.itemId, newThing);
  };

  return (
    <DataLoadingWrapper
      isLoading={tdrItemsQuery.isLoading || tdrDiagramRulesQuery.isLoading}
      hasResponseData={tdrItemsQuery.hasResponseData || tdrDiagramRulesQuery.hasResponseData}
    >
      <div ref={ref}>
        <ItemUpdateGuard things={data} rules={rules} addEntryToUpdate={addEntryToUpdate}>
          {activeThing && (
            <EditThingModal
              isModalOpen={activeThing !== null}
              onSaveThing={(at) => {
                onUpdateThing(at);
                setActiveThing(null);
              }}
              onCancel={() => setActiveThing(null)}
              thing={activeThing}
              rules={rules}
              okButtonText="Update"
              width={containerWidth}
            />
          )}

          {(is('display', 'rule') || !queryParams.has('display')) && (
            <ThingsByRule
              things={data}
              addEntryToUpdate={addEntryToUpdate}
              availableThings={availableThings}
              rules={rules}
              thingsByRules={thingsByRules}
              setActiveThing={setActiveThing}
              containerWidth={containerWidth}
            />
          )}

          {is('display', 'thing') && (
            <RulesByThing
              things={data}
              addEntryToUpdate={addEntryToUpdate}
              availableThings={availableThings}
              rules={rules}
              thingsByRules={thingsByRules}
              setActiveThing={setActiveThing}
            />
          )}

          {is('display', 'simulator') && (
            <GameSimulator
              things={data}
              addEntryToUpdate={addEntryToUpdate}
              availableThings={availableThings}
              rules={rules}
            />
          )}
        </ItemUpdateGuard>
      </div>
    </DataLoadingWrapper>
  );
}
