import { Button, Modal } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import { useMemo, useState } from 'react';
import type { DailyQuartetSet } from 'types';
import { createUUID, removeDuplicates, wait } from 'utils';
import { InspirationSample } from '../InspirationSample';
import { ItemsQuartetsTable } from './ItemsQuartetsTable';

type NewQuartetFlowProps = {
  data: UseResourceFirestoreDataReturnType<DailyQuartetSet>['data'];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyQuartetSet>['addEntryToUpdate'];
};

export function NewQuartetFlow({ data, addEntryToUpdate }: NewQuartetFlowProps) {
  const [open, setOpen] = useState(false);

  const newId = useMemo(() => {
    return createUUID(Object.keys(data));
  }, [data]);

  const createNewQuartetPlaceholder = () => {
    return cloneDeep({
      id: newId,
      title: '',
      itemsIds: [],
      level: 0,
    });
  };

  const [activeQuartet, setActiveQuartet] = useState<DailyQuartetSet>(createNewQuartetPlaceholder());

  const onLocalUpdate = (_: string, value: DailyQuartetSet) => {
    setActiveQuartet({ ...value });
  };

  const onAddSampledItem = (itemId: string) => {
    setActiveQuartet((prev) => ({
      ...prev,
      itemsIds: removeDuplicates([...prev.itemsIds, itemId]),
    }));
  };

  const onEntry = async () => {
    addEntryToUpdate(activeQuartet.id, cloneDeep(activeQuartet));
    setOpen(false);
    await wait(250);
    setActiveQuartet(createNewQuartetPlaceholder());
  };

  return (
    <>
      <Button type="dashed" block onClick={() => setOpen(true)}>
        Add New Set
      </Button>

      <Modal
        title="Add Quartet"
        open={open}
        width={'80vw'}
        onCancel={() => setOpen(false)}
        okButtonProps={{ disabled: !activeQuartet.title, onClick: onEntry }}
        maskClosable={false}
      >
        {Boolean(activeQuartet) && (
          <>
            <ItemsQuartetsTable
              rows={[activeQuartet]}
              addEntryToUpdate={onLocalUpdate}
              expandedRowKeys={[activeQuartet.id]}
            />
            <InspirationSample onSelect={onAddSampledItem} excludeList={activeQuartet.itemsIds} />
          </>
        )}
      </Modal>
    </>
  );
}
