import { Button, Flex, Input, Space, Table } from 'antd';

import { shuffle } from 'lodash';
import type { CrimesHediondosCard, Item as ItemT } from 'types';

import { CopyOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo } from 'react';
import { ItemId, ItemName } from './ItemBuildingBlocks';

type Crime = {
  id: string;
  suspect: ItemT;
  weapon: ItemT;
  evidence: ItemT;
  location: ItemT;
};

export function ItemsCrimeHistoryTable() {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const copyToClipboard = useCopyToClipboardFunction();

  const crimes = useMemo(() => {
    const suspects = shuffle(
      Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('suspect')),
    );

    const weapons = shuffle(
      Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('weapon')),
    );

    const evidence = shuffle(
      Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('evidence')),
    );

    const locations = shuffle(
      Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('location')),
    );

    const total = Math.max(suspects.length, weapons.length, evidence.length, locations.length);
    const crimesArray: Crime[] = [];
    for (let i = 0; i < total; i++) {
      crimesArray.push({
        id: `crime-${i}`,
        suspect: suspects[i],
        weapon: weapons[i],
        evidence: evidence[i],
        location: locations[i],
      });
    }
    return crimesArray;
  }, [itemsTypeaheadQuery.data]);

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
      title: 'Location',
      dataIndex: 'location',
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
      title: 'Crime',
      dataIndex: 'id',
      render: (_, record) => {
        const content = `${record.id} - Suspect: ${record.suspect?.name?.en} (id: ${record.suspect.id}), Means of Murder:${record.weapon?.name?.en} (id: ${record.weapon.id}), Piece of Evidence: ${record?.evidence?.name?.en} (id: ${record.evidence.id}), and the Location: ${record?.location?.name?.en} (id: ${record.location.id})`;

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

interface Entry {
  id: string;
  name: string;
  clue: string;
}
interface CrimeScenario {
  suspect: Entry;
  means: Entry;
  evidence: Entry;
  location: Entry;
  // A sentence telling the crime
  summary: string;
}
