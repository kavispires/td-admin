import { Flex, Select, Table, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { IdTag } from 'components/Common/IdTag';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useGridPagination } from 'hooks/useGridPagination';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import type { UseEscapeRoomResourceReturnType } from 'pages/Games/EscapeRoom/useEscapeRoomResource';
import { useMemo, useState } from 'react';
import { EscapeRoomCard } from './cards/EscapeRoomCard';
import type { EscapeRoomSet } from './cards/escape-room-types';
import { MissionBriefingsTable } from './MissionBriefingsTable';

export function AllCardsGrid({ isLoading, missionSets, cards, isSuccess }: UseEscapeRoomResourceReturnType) {
  const [sortByField, setSortByField] = useState<string>('updatedAt');
  const [cardSize, setCardSize] = useState<number>(200);
  const cardsList = useMemo(
    () => orderBy(Object.values(cards), [sortByField], ['desc']),
    [cards, sortByField],
  );
  const filteredData = useMemo(() => cardsList, [cardsList]);

  const { page, pagination } = useGridPagination({
    data: filteredData,
    resetter: '',
    defaultPageSize: 32,
  });

  return (
    <Flex className="full-width py-4" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={4}>
          All Cards
        </Typography.Title>
        <Flex gap={12}>
          <Flex align="center">
            Sort By:{' '}
            <Select
              className="ml-2"
              onChange={(value) => setSortByField(value)}
              options={[
                { label: 'Latest', value: 'updatedAt' },
                { label: 'Type', value: 'type' },
                { label: 'Id', value: 'id' },
              ]}
              value={sortByField}
            />
          </Flex>
          <Flex align="center">
            Card Size:{' '}
            <Select
              className="ml-2"
              onChange={(value) => setCardSize(value)}
              options={[
                { label: '100', value: 100 },
                { label: '150', value: 150 },
                { label: '200', value: 200 },
                { label: '250', value: 250 },
              ]}
              value={cardSize}
            />
          </Flex>
        </Flex>
      </Flex>

      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((entry) => (
            <Flex gap={8} key={entry.id} vertical>
              <span>
                ID <IdTag withQuotes>{entry.id}</IdTag>
              </span>
              <EscapeRoomCard card={entry} width={cardSize} />
            </Flex>
          ))}
        </Flex>
      </PaginationWrapper>
    </Flex>
  );
}
