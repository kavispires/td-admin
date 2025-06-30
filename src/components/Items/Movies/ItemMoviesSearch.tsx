import { Space, Typography } from 'antd';
import { Typeahead } from 'components/Common/Typeahead';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useMemo, useState } from 'react';
import type { DailyMovieSet } from 'types';
import { ItemsMoviesTable } from './ItemsMoviesTable';

export function ItemsMoviesSearch({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyMovieSet>) {
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  const activeMovie = useMemo(() => {
    if (!activeMovieId) return null;
    return data[activeMovieId];
  }, [activeMovieId, data]);
  return (
    <Space direction="vertical">
      <Typography.Title level={5}>Search Movie</Typography.Title>

      <Typeahead
        data={data}
        onFinish={(id) => setActiveMovieId(id)}
        placeholder="Search movie by title..."
        parser={typeaheadParser}
        style={{ width: '100%', minWidth: 450 }}
      />

      {!!activeMovie && <ItemsMoviesTable rows={[activeMovie]} addEntryToUpdate={addEntryToUpdate} />}
    </Space>
  );
}

const typeaheadParser = (data: Record<string, DailyMovieSet>) => {
  return Object.values(data ?? {}).reduce((acc: Record<string, string>, movie) => {
    acc[`${movie.title} (${movie.year})`] = movie.id;
    return acc;
  }, {});
};
