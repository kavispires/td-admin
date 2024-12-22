import { App, Button } from 'antd';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { sample } from 'lodash';
import { useMemo, useState } from 'react';
import type { DailyDiagramItem, DailyDiagramRule, Item as ItemT } from 'types';
import { wait } from 'utils';
import { EditThingModal } from './EditThingModal';

type AddNewThingFlowProps = {
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiagramItem>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRule>;
  width: number;
};

export function AddNewThingFlow({ addEntryToUpdate, availableThings, rules, width }: AddNewThingFlowProps) {
  const { notification } = App.useApp();

  const [activeThing, setActiveThing] = useState<DailyDiagramItem | null>(null);

  const onActivateThing = () => {
    const randomItem = sample(availableThings);
    if (randomItem) {
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
      notification.error({ message: 'Name and Item ID are required' });
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
      <Button size="large" onClick={onActivateThing}>
        Classify New Item
      </Button>
      {!!activeThing && (
        <EditThingModal
          isModalOpen={activeThing !== null}
          onSaveThing={onAddItem}
          onCancel={() => setActiveThing(null)}
          thing={activeThing}
          rules={rules}
          width={width * 0.9}
          itemAliases={aliases as string[]}
          onGiveAnotherThing={onGiveAnotherThing}
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
