import { LanguageToggle } from '@components/Common/LanguageToggle';
import { PaginationWrapper } from '@components/Common/PaginationWrapper';
import { DataLoadingWrapper } from '@components/DataLoadingWrapper';
import { PageLayout, SiderContent } from '@components/Layout';
import { PageSider } from '@components/Layout/PageSider';
import { useGridPagination } from '@hooks/useGridPagination';
import { useQueryParams } from '@hooks/useQueryParams';
import { useTDResource } from '@hooks/useTDResource';
import type { MovieCardData } from '@types';
import { RESOURCES_NAMES } from '@utils/resources-list';
import { Button, Card, Flex, Layout, Typography } from 'antd';
import { chunk, isEmpty, shuffle } from 'lodash';
import { useMemo, useState } from 'react';

type RandomMovieTitles = {
  id: string;
  text: string;
};

export function MovieTitles() {
  const { queryParams } = useQueryParams({ language: 'pt' });
  const language = queryParams.get('language');
  const movieTitlesQuery = useTDResource<MovieCardData>(`${RESOURCES_NAMES.MOVIES}-${language}`, {
    enabled: !!language,
  });
  const [retrigger, setRetrigger] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retrigger is only use to regenerate the riddles
  const rows = useMemo(() => {
    const movieTitles = Object.values(movieTitlesQuery.data ?? {});

    const result: Dictionary<string> = {};

    for (let i = 0; i < 4; i++) {
      const batch1 = shuffle(movieTitles);
      const batch2 = shuffle(movieTitles);
      batch1.forEach((movie, index) => {
        const id = `${movie.id}-${batch2[index].id}`;
        if (!result[id]) {
          result[id] = `"${movie.prefix} ${batch2[index].suffix}"`;
        }
      });
    }

    const entries = Object.keys(result).map((id) => result[id]);
    const chunks = chunk(entries, 5);
    return chunks.map((chunk, index) => ({
      id: `group-${index}`,
      text: chunk.join(', '),
    }));
  }, [movieTitlesQuery.data, language, retrigger]);

  const { page, pagination } = useGridPagination({ data: rows });

  return (
    <PageLayout
      subtitle="Randomly generate movie titles"
      title="Movie Titles"
    >
      <Layout hasSider>
        <PageSider>
          <SiderContent>
            <LanguageToggle
              value={language ? language : undefined}
              withLabel
              withQueryParams
            />
            <Button
              block
              onClick={() => setRetrigger((prev) => prev + 1)}
            >
              Retrigger
            </Button>
          </SiderContent>
        </PageSider>

        <Layout.Content className="content my-4">
          <DataLoadingWrapper
            error={movieTitlesQuery.error}
            hasResponseData={!isEmpty(movieTitlesQuery.data)}
            isLoading={movieTitlesQuery.isLoading}
          >
            <PaginationWrapper
              className="full-width"
              pagination={pagination}
            >
              <Flex
                gap={16}
                wrap="wrap"
              >
                {page.map((item) => (
                  <Card
                    key={item.id}
                    style={{ width: '19vw', maxWidth: 256, minWidth: 128 }}
                  >
                    <Typography.Text copyable>{item.text}</Typography.Text>
                  </Card>
                ))}
              </Flex>
            </PaginationWrapper>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default MovieTitles;
