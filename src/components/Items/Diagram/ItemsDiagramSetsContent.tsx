import { Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo, useState } from 'react';
import type { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';

import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { orderBy } from 'lodash';
import { useMeasure } from 'react-use';
import { EditThingModal } from './EditThingModal';
import { GameSimulator } from './GameSimulator';
import { ItemUpdateGuard } from './ItemUpdateGuard';
import { RulesByThing } from './RulesByThing';
import { ThingsByRule } from './ThingsByRule';

const getSingleWordAlias = (aliases: string[]) => {
  const singleWordAliases = aliases.filter((alias) => alias.split(' ').length === 1);
  return singleWordAliases.length > 0 ? singleWordAliases[0] : '';
};

export function ItemsDiagramSetsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyDiagramItem>) {
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

      if (item.decks?.includes('alien') && item.aliasesPt) {
        const singleWordAlias = getSingleWordAlias(item.aliasesPt);
        if (singleWordAlias) return true;
      }
      if (item.decks?.includes('manufactured') && item.aliasesPt) {
        const singleWordAlias = getSingleWordAlias(item.aliasesPt);
        if (singleWordAlias) return true;
      }
      if (item.decks?.includes('meta') && isNameSingleWord) return true;

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
