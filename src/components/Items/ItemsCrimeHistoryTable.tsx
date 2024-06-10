import { Flex, Input, Space, Table } from 'antd';

import { shuffle } from 'lodash';
import { type Item as ItemT } from 'types';

import type { TableProps } from 'antd';
import { useTDResource } from 'hooks/useTDResource';
import { Item } from 'components/Sprites';
import { useMemo } from 'react';
import { ItemName } from './ItemBuildingBlocks';
import { CopyToClipboardButton } from 'components/CopyToClipboardButton';

type Crime = {
  id: string;
  suspect: ItemT;
  weapon: ItemT;
  evidence: ItemT;
};

export function ItemsCrimeHistoryTable() {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const suspects = useMemo(
    () =>
      shuffle(
        Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('suspect'))
      ),
    [itemsTypeaheadQuery.data]
  );

  const weapons = useMemo(
    () =>
      shuffle(Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('weapon'))),
    [itemsTypeaheadQuery.data]
  );

  const evidence = useMemo(
    () =>
      shuffle(
        Object.values(itemsTypeaheadQuery.data ?? []).filter((item) => item.decks?.includes('evidence'))
      ),
    [itemsTypeaheadQuery.data]
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
      title: 'Evidence',
      dataIndex: 'evidence',
      render: (item) => (
        <Flex gap={6} vertical>
          {item ? (
            <>
              <Item id={item.id} width={60} />
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
    <Space direction="vertical">
      <Table columns={columns} rowKey="id" dataSource={crimes} pagination={{ showQuickJumper: true }} />
    </Space>
  );
}
