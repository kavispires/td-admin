import { Flex, Table, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useGridPagination } from 'hooks/useGridPagination';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import type { UseEscapeRoomResourceReturnType } from 'pages/EscapeRoom/useEscapeRoomResource';
import { useMemo } from 'react';
import { EscapeRoomCard } from './cards/EscapeRoomCard';
import type { EscapeRoomSet } from './cards/escape-room-types';
import { MissionBriefingsTable } from './MissionBriefingsTable';

export function AllCardsGrid({ isLoading, missionSets, cards, isSuccess }: UseEscapeRoomResourceReturnType) {
  const cardsList = useMemo(() => Object.values(cards), [cards]);
  const filteredData = useMemo(() => cardsList, [cardsList]);
  console.log(cards);
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
      </Flex>

      <PaginationWrapper className="full-width" pagination={pagination}>
        <Flex gap={16} wrap="wrap">
          {page.map((entry) => (
            <EscapeRoomCard card={entry} key={entry.id} width={200} />
          ))}
        </Flex>
      </PaginationWrapper>
    </Flex>
  );
}
