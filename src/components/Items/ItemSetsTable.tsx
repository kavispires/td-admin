import { Flex, Space, Switch, Table, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTDResource } from 'hooks/useTDResource';
import { fromPairs, isEqual, orderBy, range, sampleSize } from 'lodash';
import { useState } from 'react';
import { DailyDiscSet } from 'types';
import { removeDuplicates } from 'utils';
import { LETTERS } from 'utils/constants';

import type { TableProps } from 'antd';

function orderSets(givenSets: DailyDiscSet[]) {
  return orderBy(givenSets, [
    (s) => removeDuplicates(s.itemsIds).filter(Boolean).length > 20,
    (s) => s.title.pt,
  ]).map((s) => ({
    ...s,
    itemsIds: orderBy(s.itemsIds, (id) => Number(id)),
  }));
}

export function ItemsSetsTable() {
  const { data } = useTDResource<DailyDiscSet>('daily-disc-sets');
  const sets = data ? orderSets(Object.values(data)) : [];
  const copyToClipboard = useCopyToClipboardFunction();

  const columns: TableProps<DailyDiscSet>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span>{title.pt}</span>,
    },
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <Flex gap={6} wrap="wrap" key={`items-${record.title.en}`}>
          {itemsIds.map((itemId) => (
            <Flex key={`${record.title.en}-${itemId}`} gap={2} vertical>
              <Item id={itemId} width={60} />
              <Flex justify="center">
                <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
  ];

  const [selectedSet, setSelectedSet] = useState('set');

  return (
    <Space direction="vertical">
      <Space>
        <Switch
          checkedChildren="Set"
          unCheckedChildren="Misc"
          defaultChecked
          onChange={() => setSelectedSet(selectedSet === 'set' ? 'misc' : 'set')}
        />
      </Space>
      <Table columns={columns} dataSource={sets} pagination={{ showQuickJumper: true }} />
    </Space>
  );
}

function generateUniqueArrays(sets: Dictionary<DailyDiscSet>, N: number): string[][] {
  const result: number[][] = [];
  const nsfwIds = [
    '239',
    '331',
    '256',
    '383',
    '420',
    '433',
    '584',
    '683',
    '769',
    '1122',
    '1174',
    '1188',
    '1316',
    '1320',
    '1388',
    '1396',
    '1480',
    '1549',
    '1550',
    '1591',
    '1677',
    '1778',
    '1790',
    '1792',
    '1820',
  ];
  let previouslyUsedIds: BooleanDictionary = {
    ...fromPairs(nsfwIds.map((key) => [key, true])),
  };
  Object.values(sets).forEach((set) => set.itemsIds.forEach((id) => (previouslyUsedIds[id] = true)));

  let availableRange = range(1, 1858).filter((n) => !previouslyUsedIds[n] && !nsfwIds.includes(String(n)));
  while (result.length < N) {
    const randomNumbers = sampleSize(availableRange, 21);
    if (!result.some((arr) => isEqual(arr, randomNumbers))) {
      previouslyUsedIds = { ...previouslyUsedIds, ...fromPairs(randomNumbers.map((key) => [key, true])) };
      availableRange = availableRange.filter((n) => !randomNumbers.includes(n));
      result.push([0, ...randomNumbers]);
    }
  }

  return result.map((arr) => orderBy(arr.map(String), (id) => Number(id)));
}

export function generateMiscSets(sets: Dictionary<DailyDiscSet>) {
  const newSets = generateUniqueArrays(sets, LETTERS.length).map((items, i) => ({
    title: {
      pt: `Diversos ${LETTERS[i]}`,
      en: `Misc ${LETTERS[i]}`,
    },
    itemsIds: items,
  }));

  console.log(JSON.stringify(newSets));
}
