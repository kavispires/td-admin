import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type { DailyDiagramItem, DailyDiagramRule } from 'types';
import { wait } from 'utils';
import { EditThingModal } from './EditThingModal';
import { SYLLABLE_SEPARATOR } from './utils';

type ItemUpdateGuardProps = {
  things: UseResourceFirestoreDataReturnType<DailyDiagramItem>['data'];
  rules: Dictionary<DailyDiagramRule>;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  children: ReactNode;
};

export function ItemUpdateGuard({ children, things, rules, addEntryToUpdate }: ItemUpdateGuardProps) {
  // If any rules has been added or updated AFTER the last time the user has updated the item, the user will be warned to update the item
  const toUpdateThings = useMemo(() => {
    return Object.values(things).filter((item) => {
      // Prevent updating items that have the syllables field but it's not correct
      if (
        item.syllables &&
        item.syllables.split(SYLLABLE_SEPARATOR).join('') !== item.name.replace(/\s/g, '')
      ) {
        console.log('❗️ Name and syllables do not match', item.name, item.syllables);
        return true;
      }

      const outdatedRules = Object.values(rules).filter((rule) => rule.updatedAt > item.updatedAt);

      const autoUpdates = outdatedRules.filter((rule) => rule.method === 'auto');
      if (autoUpdates.length > 0) {
        console.log(
          '❗️ Thing has auto updates that will be performed automatically upon downloading the JSON',
        );
      }

      return outdatedRules.some((rule) => rule.method !== 'auto');
    });
  }, [things, rules]);

  const [activeThing, setActiveThing] = useState<DailyDiagramItem | null>(null);

  useEffect(() => {
    const updateThings = async (_: DailyDiagramItem) => {
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
          isModalOpen={activeThing !== null}
          okButtonText="Update"
          onCancel={() => setActiveThing(null)}
          onSaveThing={onUpdateThing}
          rules={rules}
          subtitle={`(${toUpdateThings.length} left to update)`}
          thing={activeThing}
          width="90vw"
        />
      )}
      {children}
    </>
  );
}
