import { Button, Flex, Modal, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useMemo, useState } from 'react';
import { DailyQuartetSet, Item as ItemT } from 'types';
import { ItemsQuartetsTable } from './ItemsQuartetsTable';
import { useTDResource } from 'hooks/useTDResource';
import { difference, sampleSize } from 'lodash';
import { Item } from 'components/Sprites';
import { PlusOutlined } from '@ant-design/icons';
import { removeDuplicates } from 'utils';

type NewQuartetModalProps = {
  data: UseResourceFirebaseDataReturnType<DailyQuartetSet>['data'];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyQuartetSet>['addEntryToUpdate'];
};

export function NewQuartetModal({ data, addEntryToUpdate }: NewQuartetModalProps) {
  const { is, removeParam } = useQueryParams();
  const newId = useMemo(() => {
    let latestIdNum = 0;
    Object.keys(data).forEach((id) => {
      const idNum = Number(id.split('-')[1]);
      if (idNum > latestIdNum) {
        latestIdNum = idNum;
      }
    });

    return `dqs-${String(latestIdNum + 1).padStart(4, '0')}-pt`;
  }, [data]);

  const [activeQuartet, setActiveQuartet] = useState<DailyQuartetSet>({
    id: newId,
    title: '',
    itemsIds: [],
    level: 0,
  });

  const onLocalUpdate = (_: string, value: DailyQuartetSet) => {
    setActiveQuartet({ ...value });
  };

  const onAddSampledItem = (itemId: string) => {
    setActiveQuartet((prev) => ({
      ...prev,
      itemsIds: removeDuplicates([...prev.itemsIds, itemId]),
    }));
  };

  const onEntry = () => {
    addEntryToUpdate(activeQuartet.id, activeQuartet);
    removeParam('newQuartet');
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
          <RandomSample onUpdate={onAddSampledItem} quartet={activeQuartet} />
        </>
      )}
    </Modal>
  );
}

type RandomSampleProps = {
  onUpdate: (itemId: string) => void;
  quartet: DailyQuartetSet;
};

function RandomSample({ onUpdate, quartet }: RandomSampleProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const getSample = (quantity: number) => {
    return difference(sampleSize(Object.keys(itemsTypeaheadQuery.data ?? {}), quantity), quartet.itemsIds);
  };

  const [sampledItems, setSampledItems] = useState<string[]>(getSample(5));

  const onSample = () => {
    setSampledItems(getSample(20));
  };

  return (
    <div className="mt-2">
      <Typography.Paragraph>
        Random Sample{' '}
        <Button size="small" onClick={onSample}>
          Get
        </Button>
      </Typography.Paragraph>
      <Flex gap={16} wrap="wrap">
        {sampledItems.map((itemId, index) => (
          <Flex key={`sample-${itemId}-${index}`} gap={2} vertical>
            <Item id={itemId} width={60} />
            <Flex justify="center" gap={6}>
              <Typography.Text>{itemId}</Typography.Text>
              <Button size="small" shape="circle" onClick={() => onUpdate(itemId)}>
                <PlusOutlined />
              </Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  );
}
