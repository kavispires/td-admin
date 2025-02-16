import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import type { ImageCardDescriptor, ImageCardPasscodeSet } from 'types';
import { useTDResource } from 'hooks/useTDResource';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';
import { ImageCardsDescriptorTable } from './ImageCardsDescriptorTable';
import { ImageCardsDescriptorModal } from './ImageCardsDescriptorModal';
import { useTablePagination } from 'hooks/useTablePagination';
import { useMemo, useState } from 'react';
import { orderBy } from 'lodash';
import { Button, Flex, Input, Select, Space, Table, TableProps } from 'antd';
import { ImageCard } from '../ImageCard';
import { ImageCardsPasscodeCreate } from './ImageCardsPasscodeCreate';
import { PasscodeSearch, SetsTable } from './ImageCardsPasscodeComponents';

export function ImageCardsPasscodeContent(query: UseResourceFirebaseDataReturnType<ImageCardPasscodeSet>) {
  const imageCardsDecksQuery = useImageCardsDecks();

  const { addParam, removeParam, is, queryParams } = useQueryParams();

  return (
    <>
      {(is('display', 'table') || !queryParams.has('display')) && <ImageCardsPasscodeTable {...query} />}
      {is('display', 'create') && <ImageCardsPasscodeCreate {...query} />}
    </>
  );
}

function ImageCardsPasscodeTable(query: UseResourceFirebaseDataReturnType<ImageCardPasscodeSet>) {
  const allSets = useMemo(() => orderBy(Object.values(query.data), ['id', 'passcode']), [query.data]);

  const [searchSetId, setSearchSetId] = useState<string | null>();

  return (
    <Space direction="vertical" className="full-width my-4">
      <PasscodeSearch data={query.data} onFinish={(setId) => setSearchSetId(setId)} />
      {searchSetId && (
        <>
          <SetsTable
            sets={[query.data[searchSetId]]}
            addEntryToUpdate={query.addEntryToUpdate}
            hidePagination
          />
          <Button size="small" onClick={() => setSearchSetId(null)}>
            Clear search
          </Button>
        </>
      )}
      <SetsTable sets={allSets} addEntryToUpdate={query.addEntryToUpdate} />
    </Space>
  );
}
