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
    <Space className="full-width my-4" direction="vertical">
      <PasscodeSearch data={query.data} onFinish={(setId) => setSearchSetId(setId)} />
      {searchSetId && (
        <>
          <SetsTable
            addEntryToUpdate={query.addEntryToUpdate}
            hidePagination
            sets={[query.data[searchSetId]]}
          />
          <Button onClick={() => setSearchSetId(null)} size="small">
            Clear search
          </Button>
        </>
      )}
      <SetsTable addEntryToUpdate={query.addEntryToUpdate} sets={allSets} />
    </Space>
  );
}
