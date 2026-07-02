import { App, Button } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { sample } from 'lodash';
import { useMemo, useState } from 'react';
import type { DailyDiagramItemData, DailyDiagramRuleData, ItemData as ItemT } from 'types';
import { wait } from 'utils/time';
import { EditThingModal } from './EditThingModal';

type AddNewThingFlowProps = {
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiagramItemData>['addEntryToUpdate'];
  availableThings: ItemT[];
  rules: Dictionary<DailyDiagramRuleData>;
  width: number;
  allThings: Dictionary<DailyDiagramItemData>;
};

export function AddNewThingFlow({
  addEntryToUpdate,
  availableThings,
  rules,
  width,
  allThings,
}: AddNewThingFlowProps) {
  const { notification } = App.useApp();

  const [activeThing, setActiveThing] = useState<DailyDiagramItemData | null>(null);
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

  const onAddItem = async (newThing: DailyDiagramItemData) => {
    if (!activeThing) return;
    if (!newThing.name || !newThing.itemId) {
      notification.error({ title: 'Name and ItemData ID are required' });
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
      <Button
        onClick={onActivateThing}
        size="large"
      >
        Classify New ItemData
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
