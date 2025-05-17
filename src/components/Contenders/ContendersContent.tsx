import type { ContenderCard } from 'types';
import './Contenders.scss';
import { Flex, Typography } from 'antd';
import { useFilterDataByDataFilters } from 'components/Common/DataFilters';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useGridPagination } from 'hooks/useGridPagination';
import type { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import { useEffect } from 'react';
import { ContenderEditCard } from './ContenderEditCard';

export type ContendersContentProps = ReturnType<typeof useResourceFirestoreData<ContenderCard>>;

export function ContendersContent({ data, addEntryToUpdate }: ContendersContentProps) {
  const filteredData = useFilterDataByDataFilters(data);

  const { page, pagination } = useGridPagination({
    data: filteredData,
    resetter: '',
    defaultPageSize: 32,
  });

  useEffect(() => parsedData(data), [data]);

  return (
    <>
      <>
        <Typography.Title level={2}>
          Listing - Contenders ({filteredData.length} | {Object.values(data ?? {}).length})
        </Typography.Title>

        <PaginationWrapper pagination={pagination} className="full-width">
          <Flex gap={16} wrap="wrap">
            {page.map((entry) => (
              <ContenderEditCard key={entry.id} contender={entry} addEntryToUpdate={addEntryToUpdate} />
            ))}
          </Flex>
        </PaginationWrapper>
      </>
    </>
  );
}

const DECK_PRIORITY = ['random', 'cartoon', 'comics', 'pop-culture', 'movies', 'television'];

const parsedData = (data: Dictionary<ContenderCard>) => {
  const result = Object.values(cloneDeep(data)).reduce(
    (acc: any, entry) => {
      if (entry.decks.includes('base')) {
        acc.base.push(entry);
        entry.decks = ['base'];
        return acc;
      }
      if (entry.exclusivity === 'pt') {
        return acc;
      }

      const decksWithoutBase = entry.decks.filter((deck) => deck !== 'base');
      if (decksWithoutBase.length > 1) {
        console.log('Multiple decks', entry.name.en, entry.decks);
      }

      const deck = decksWithoutBase.find((deck) => DECK_PRIORITY.includes(deck)) || decksWithoutBase[0];

      if (!acc[deck]) {
        acc[deck] = [];
      }
      entry.decks = [deck];
      acc[deck].push(entry);

      return acc;
    },
    {
      base: [],
    },
  );

  Object.keys(result).forEach((key) => {
    console.log(key, result[key].length);
    // console.log(result[key].map((e: any) => `${e.name.en} (${e.id})`));
    console.log(
      result[key].map((e: any) => {
        return {
          id: e.id,
          name: e.name.en,
          description: e.description?.en ?? '',
          deck: e.decks[0],
        };
      }),
    );
    console.log('-----------------');
  });

  const res: any[] = [];
  Object.keys(result).forEach((key) => {
    res.push(
      ...result[key].map((e: any) => {
        return {
          id: e.id,
          name: e.name.en,
          description: e.description?.en ?? '',
          deck: e.decks[0],
        };
      }),
    );
  });

  console.log(res);
};
