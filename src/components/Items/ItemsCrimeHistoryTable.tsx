import { Button, Flex, Input, Space, Table } from 'antd';

import { shuffle } from 'lodash';
import type { CrimesHediondosCard, Item as ItemT } from 'types';

import type { TableProps } from 'antd';
import { useTDResource } from 'hooks/useTDResource';
import { Item } from 'components/Sprites';
import { useMemo } from 'react';
import { ItemId, ItemName } from './ItemBuildingBlocks';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { CopyOutlined } from '@ant-design/icons';

type Crime = {
  id: string;
  suspect: ItemT;
  weapon: ItemT;
  evidence: ItemT;
};

export function ItemsCrimeHistoryTable() {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const copyToClipboard = useCopyToClipboardFunction();

  const suspects = useMemo(
    () =>
      shuffle(
        Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('suspect')),
      ),
    [itemsTypeaheadQuery.data],
  );

  const weapons = useMemo(
    () =>
      shuffle(Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('weapon'))),
    [itemsTypeaheadQuery.data],
  );

  const evidence = useMemo(
    () =>
      shuffle(
        Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('evidence')),
      ),
    [itemsTypeaheadQuery.data],
  );

  const crimes = useMemo(() => {
    const total = Math.max(suspects.length, weapons.length, evidence.length);
    const crimesArray: Crime[] = [];
    for (let i = 0; i < total; i++) {
      crimesArray.push({
        id: `crime-${i}`,
        suspect: suspects[i],
        weapon: weapons[i],
        evidence: evidence[i],
      });
    }
    return crimesArray;
  }, [suspects, weapons, evidence]);

  const onCopyAsCrimesHediondosCard = (record: ItemT, kind: string) => {
    const prefix = kind === 'weapon' ? 'wp' : 'ev';
    const card: CrimesHediondosCard = {
      id: `dmhk-${prefix}-000`,
      type: kind,
      name: {
        en: record.name.en,
        pt: record.name.pt,
      },
      tags: [],
      itemId: record.id,
    };

    const stringifiedCard = JSON.stringify({ [card.id]: card }, null, 2);

    copyToClipboard(stringifiedCard.substring(1, stringifiedCard.length - 1));
  };

  const columns: TableProps<Crime>['columns'] = [
    {
      title: 'id',
      dataIndex: 'id',
    },
    {
      title: 'Suspect',
      dataIndex: 'suspect',
      render: (item) => (
        <Flex gap={6} vertical>
          {item ? (
            <>
              <Item id={item.id} width={60} />
              <ItemId item={item} />
              <ItemName item={item} language="pt" />
              <ItemName item={item} language="en" />
            </>
          ) : (
            <>?</>
          )}
        </Flex>
      ),
    },
    {
      title: 'Means of Murder',
      dataIndex: 'weapon',
      render: (item) => (
        <Flex gap={6} vertical>
          {item ? (
            <>
              <Item id={item.id} width={60} />
              <ItemId item={item} />
              <ItemName item={item} language="pt" />
              <ItemName item={item} language="en" />
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => onCopyAsCrimesHediondosCard(item, 'weapon')}
              >
                Crime
              </Button>
            </>
          ) : (
            <>?</>
          )}
        </Flex>
      ),
    },
    {
      title: 'Evidence',
      dataIndex: 'evidence',
      render: (item) => (
        <Flex gap={6} vertical>
          {item ? (
            <>
              <Item id={item.id} width={60} />
              <ItemId item={item} />
              <ItemName item={item} language="pt" />
              <ItemName item={item} language="en" />
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => onCopyAsCrimesHediondosCard(item, 'evidence')}
              >
                Crime
              </Button>
            </>
          ) : (
            <>?</>
          )}
        </Flex>
      ),
    },
    {
      title: 'Crime',
      dataIndex: 'id',
      render: (_, record) => {
        const content = `${record.id} - Suspect: ${record.suspect?.name?.en}, Means of Murder:${record.weapon?.name?.en}, and Piece of Evidence: ${record?.evidence?.name?.en}`;

        return (
          <Flex vertical>
            <CopyToClipboardButton content={content} />
            <Input.TextArea rows={3} readOnly value={content} />
          </Flex>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" className="my-4">
      <Table columns={columns} rowKey="id" dataSource={crimes} pagination={{ showQuickJumper: true }} />
    </Space>
  );
}
