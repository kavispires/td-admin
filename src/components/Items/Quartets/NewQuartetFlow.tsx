import { Button, Card, Flex, Modal } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep, orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import stringSimilarity from 'string-similarity';
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

  const similarQuartets = useMemo(() => {
    if (activeQuartet.title.length < 3) {
      return [];
    }
    return orderBy(
      Object.values(data),
      (quartet) =>
        stringSimilarity.compareTwoStrings(
          quartet.title.toLocaleLowerCase(),
          activeQuartet.title.toLocaleLowerCase(),
        ),
      'desc',
    )
      .slice(0, 5)
      .filter((quartet) => quartet.id !== activeQuartet.id);
  }, [activeQuartet.title, activeQuartet.id, data]);

  return (
    <>
      <Button block onClick={() => setOpen(true)} type="dashed">
        Add New Set
      </Button>

      <Modal
        maskClosable={false}
        okButtonProps={{ disabled: !activeQuartet.title, onClick: onEntry }}
        onCancel={() => setOpen(false)}
        open={open}
        title="Add Quartet"
        width={'80vw'}
      >
        {Boolean(activeQuartet) && (
          <>
            <ItemsQuartetsTable
              addEntryToUpdate={onLocalUpdate}
              expandedRowKeys={[activeQuartet.id]}
              rows={[activeQuartet]}
            />
            {similarQuartets.length > 0 && (
              <Card size="small">
                <Flex gap={4} vertical>
                  {similarQuartets.map((quartet) => (
                    <div key={quartet.id}>{quartet.title}</div>
                  ))}
                </Flex>
              </Card>
            )}
            <InspirationSample excludeList={activeQuartet.itemsIds} onSelect={onAddSampledItem} />
          </>
        )}
      </Modal>
    </>
  );
}
