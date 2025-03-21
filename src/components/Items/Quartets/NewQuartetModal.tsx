import { Modal } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { cloneDeep } from 'lodash';
import { useMemo, useState } from 'react';
import type { DailyQuartetSet } from 'types';
import { createUUID, removeDuplicates, wait } from 'utils';
import { InspirationSample } from './InspirationSample';
import { ItemsQuartetsTable } from './ItemsQuartetsTable';

type NewQuartetModalProps = {
  data: UseResourceFirebaseDataReturnType<DailyQuartetSet>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyQuartetSet>['addEntryToUpdate'];
};

export function NewQuartetModal({ data, addEntryToUpdate }: NewQuartetModalProps) {
  const { is, removeParam } = useQueryParams();
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
    removeParam('newQuartet');
    await wait(250);
    setActiveQuartet(createNewQuartetPlaceholder());
  };

  return (
    <Modal
      title="Add Quartet"
      open={is('newQuartet')}
      width={'80vw'}
      onCancel={() => removeParam('newQuartet')}
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
          <InspirationSample onUpdate={onAddSampledItem} quartet={activeQuartet} />
        </>
      )}
    </Modal>
  );
}
