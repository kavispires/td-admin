import { App, Button } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { sample } from 'lodash';
import { useMemo, useState } from 'react';
import type { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { wait } from 'utils';
import { EditThingModal } from './EditThingModal';

type AddNewThingFlowProps = {
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  width: number;
  allThings: Dictionary<DailyDiagramItem>;
};

export function AddNewThingFlow({
  addEntryToUpdate,
  availableThings,
  rules,
  width,
  allThings,
}: AddNewThingFlowProps) {
  const { notification } = App.useApp();

  const [activeThing, setActiveThing] = useState<DailyDiagramItem | null>(null);
  const [cycledThings, setCycledThings] = useState<Dictionary<boolean>>({});

  const onActivateThing = () => {
    const randomItem = sample(availableThings.filter((item) => !cycledThings[item.id]));
    if (randomItem) {
      setCycledThings((prev) => ({
        ...prev,
        [randomItem.id]: true,
      }));
      setActiveThing({
        itemId: randomItem.id,
        name: chooseNameThatIsASingleWord(randomItem),
        updatedAt: Date.now(),
        syllables: '',
        stressedSyllable: 0,
        rules: [],
      });
    } else {
      setActiveThing(null);
    }
  };

  const aliases = useMemo(() => {
    if (!activeThing) return [];
    const item = availableThings.find((thing) => thing.id === activeThing.itemId);
    return [item?.name.pt, ...(item?.aliasesPt ?? [])].filter(Boolean);
  }, [activeThing, availableThings]);

  const onAddItem = async (newThing: DailyDiagramItem) => {
    if (!activeThing) return;
    if (!newThing.name || !newThing.itemId) {
      notification.error({ title: 'Name and Item ID are required' });
    }

    addEntryToUpdate(newThing.itemId, newThing);

    console.log('COMPLETED SAVE');

    setActiveThing(null);

    await wait(250);

    onActivateThing();
  };

  const onGiveAnotherThing = async () => {
    setActiveThing(null);
    await wait(100);
    onActivateThing();
  };

  return (
    <>
      <Button onClick={onActivateThing} size="large">
        Classify New Item
      </Button>
      {!!activeThing && (
        <EditThingModal
          allThings={allThings}
          isModalOpen={activeThing !== null}
          itemAliases={aliases as string[]}
          onCancel={() => setActiveThing(null)}
          onGiveAnotherThing={onGiveAnotherThing}
          onSaveThing={onAddItem}
          rules={rules}
          thing={activeThing}
          width={width * 0.9}
        />
      )}
    </>
  );
}

const chooseNameThatIsASingleWord = (item: ItemT) => {
  if (item.name.pt.split(' ').length === 1) return item.name.pt;

  if (item.aliasesPt) {
    return item.aliasesPt.find((alias) => alias.split(' ').length === 1) ?? item.name.pt;
  }
  return item.name.pt;
};
