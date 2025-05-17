import { DeleteFilled } from '@ant-design/icons';
import { Button, Flex, Popconfirm, Space, Typography } from 'antd';
import { Item } from 'components/Sprites';
import type { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyDiscSet } from 'types';
import { CopyIdsButton } from '../CopyIdsButton';
import { ItemsDiscSetsTable } from './ItemsDiscSetsTable';
import { OrphanItems } from './OrphanItems';

export function ItemsDiscSetsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyDiscSet>) {
  const { is, queryParams } = useQueryParams();

  return (
    <>
      {(is('display', 'sets') || !queryParams.has('display')) && (
        <ItemsDiscSetsTable data={data} addEntryToUpdate={addEntryToUpdate} />
      )}

      {(is('display', 'orphans') || !queryParams.has('display')) && (
        <OrphanItems data={data} addEntryToUpdate={addEntryToUpdate} />
      )}
    </>
  );
}

type RemoveItemFlowProps = {
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
  itemId: string;
};

export function RemoveItemFlow({ disc, addEntryToUpdate, itemId }: RemoveItemFlowProps) {
  const onRemove = () => {
    addEntryToUpdate(disc.id, {
      ...disc,
      itemsIds: disc.itemsIds.filter((id) => id !== itemId),
    });
  };

  return (
    <Popconfirm
      title="Are you sure you want to remove this item?"
      onConfirm={onRemove}
      okText="Yes"
      cancelText="No"
    >
      <Button icon={<DeleteFilled />} size="small" type="text" />
    </Popconfirm>
  );
}

type DiscEditableTitleCellProps = {
  value: DualLanguageValue;
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DiscEditableTitleCell({ value, disc, addEntryToUpdate }: DiscEditableTitleCellProps) {
  const handleChange = (newValue: string, language: Language) => {
    addEntryToUpdate(disc.id, {
      ...disc,
      title: {
        ...disc.title,
        [language]: newValue,
      },
    });
  };

  return (
    <Space direction="vertical" size="small">
      <Typography.Text
        editable={{
          onChange: (v) => handleChange(v, 'pt'),
        }}
      >
        {String(value.pt)}
      </Typography.Text>
      <Typography.Text
        editable={{
          onChange: (v) => handleChange(v, 'en'),
        }}
      >
        {String(value.en)}
      </Typography.Text>
    </Space>
  );
}

type DiscItemsCellProps = {
  disc: DailyDiscSet;
  itemsIds: string[];
  copyToClipboard: ReturnType<typeof useCopyToClipboardFunction>;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DiscItemsCell({ disc, itemsIds, copyToClipboard, addEntryToUpdate }: DiscItemsCellProps) {
  return (
    <Flex gap={6} wrap="wrap" key={`items-${disc.title}`}>
      {itemsIds.map((itemId, index) => (
        <Flex key={`${disc.title}-${itemId}-${index}`} gap={2} vertical>
          <Item id={itemId} width={60} />
          <Flex justify="center">
            <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
            <RemoveItemFlow disc={disc} addEntryToUpdate={addEntryToUpdate} itemId={itemId} />
          </Flex>
        </Flex>
      ))}
      <CopyIdsButton ids={itemsIds} />
    </Flex>
  );
}
