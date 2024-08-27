import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { DailyDiagramItem, DailyDiagramRule } from 'types';
import { EditThingModal } from './EditThingModal';
import { wait } from 'utils';
import { getLatestRuleUpdate, SYLLABLE_SEPARATOR } from './utils';

type ItemUpdateGuardProps = {
  things: UseResourceFirebaseDataReturnType<DailyDiagramItem>['data'];
  rules: Dictionary<DailyDiagramRule>;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  children: ReactNode;
};

export function ItemUpdateGuard({ children, things, rules, addEntryToUpdate }: ItemUpdateGuardProps) {
  // If any rules has been added or updated AFTER the last time the user has updated the item, the user will be warned to update the item
  const toUpdateThings = useMemo(() => {
    const latestRuleUpdate = getLatestRuleUpdate(rules);

    return Object.values(things).filter((item) => {
      const latestThingUpdate = item.updatedAt;

      // Temp until all new fields are in
      if (!item.syllables || item.stressedSyllable === undefined || item.name.includes(SYLLABLE_SEPARATOR)) {
        return true;
      }

      // Prevent updating items that have the syllables field but it's not correct
      if (item.syllables && item.syllables?.replace(/\|/g, '') !== item.name.replace(/\s/g, '')) {
        return true;
      }

      // if (item.syllables.endsWith('ie') && item.updatedAt < 1724527674296) {
      //   return true;
      // }

      return latestRuleUpdate > latestThingUpdate;
    });
  }, [things, rules]);

  const [activeThing, setActiveThing] = useState<DailyDiagramItem | null>(null);

  useEffect(() => {
    const updateThings = async (i: DailyDiagramItem) => {
      console.log('Found things that need to update...');
      setActiveThing(null);

      // Await the wait function here
      await wait(250);

      if (toUpdateThings.length > 0) {
        setActiveThing(toUpdateThings[0]);
      }
    };

    console.count('Checking for things that need to update...');
    if (toUpdateThings.length > 0) {
      updateThings(toUpdateThings[0]);
    }
  }, [toUpdateThings]);

  const onUpdateThing = (newThing: DailyDiagramItem) => {
    addEntryToUpdate(newThing.itemId, newThing);
  };

  return (
    <>
      {activeThing && (
        <EditThingModal
          subtitle={`(${toUpdateThings.length} left to update)`}
          isModalOpen={activeThing !== null}
          onSaveThing={onUpdateThing}
          onCancel={() => setActiveThing(null)}
          thing={activeThing}
          rules={rules}
          okButtonText="Update"
        />
      )}
      <>{children}</>
    </>
  );
}
