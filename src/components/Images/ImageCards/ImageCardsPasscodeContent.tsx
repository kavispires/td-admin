import { Button, Space } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import type { ImageCardPasscodeSet } from 'types';
import { PasscodeSearch, SetsTable } from './ImageCardsPasscodeComponents';
import { ImageCardsPasscodeCreate } from './ImageCardsPasscodeCreate';

export function ImageCardsPasscodeContent(query: UseResourceFirestoreDataReturnType<ImageCardPasscodeSet>) {
  const { is, queryParams } = useQueryParams();

  return (
    <>
      {(is('display', 'table') || !queryParams.has('display')) && <ImageCardsPasscodeTable {...query} />}
      {is('display', 'create') && <ImageCardsPasscodeCreate {...query} />}
    </>
  );
}

function ImageCardsPasscodeTable(query: UseResourceFirestoreDataReturnType<ImageCardPasscodeSet>) {
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
