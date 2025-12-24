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
    <Space orientation="vertical">
      <Typography.Title level={5}>Search Movie</Typography.Title>

      <Typeahead
        data={data}
        onFinish={(id) => setActiveMovieId(id)}
        parser={typeaheadParser}
        placeholder="Search movie by title..."
        style={{ width: '100%', minWidth: 450 }}
      />

      {!!activeMovie && <ItemsMoviesTable addEntryToUpdate={addEntryToUpdate} rows={[activeMovie]} />}
    </Space>
  );
}

const typeaheadParser = (data: Record<string, DailyMovieSet>) => {
  return Object.values(data ?? {}).reduce((acc: Record<string, string>, movie) => {
    acc[`${movie.title} (${movie.year})`] = movie.id;
    return acc;
  }, {});
};
