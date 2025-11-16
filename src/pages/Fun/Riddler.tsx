import { Button, Layout, Table, Typography } from 'antd';
import type { TableProps } from 'antd/lib';
import { LanguageToggle } from 'components/Common/LanguageToggle';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout, SiderContent } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useQueryParams } from 'hooks/useQueryParams';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty, shuffle } from 'lodash';
import { useMemo, useState } from 'react';
import type { TextCard } from 'types';

type Riddle = {
  id: string;
  text: string;
};

export function Riddler() {
  const { queryParams } = useQueryParams({ language: 'pt' });
  const language = queryParams.get('language');
  const riddleWordsQuery = useTDResource<TextCard>(`riddle-words-${language}`, !!language);
  const riddleConjunctionsQuery = useTDResource<TextCard>(`riddle-conjunctions-${language}`, !!language);
  const [retrigger, setRetrigger] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retrigger is only use to regenerate the riddles
  const rows = useMemo(() => {
    const words = riddleWordsQuery.data ?? [];
    const conjunctions = riddleConjunctionsQuery.data ?? [];
    if (isEmpty(words) || isEmpty(conjunctions)) {
      return [];
    }

    const randomizedWords = shuffle(words);
    const randomizedConjunctions = shuffle(conjunctions);

    const result: Riddle[] = [];
    const prefix = language === 'en' ? 'What' : 'O que é o que é que';
    for (let i = 0; i < randomizedWords.length - 1; i += 2) {
      const preposition = randomizedConjunctions[i % randomizedConjunctions.length];
      const beginning = randomizedWords[i];
      const ending = randomizedWords[i + 1];
      const id = `riddle-${beginning.id.split('-')[1]}-${preposition.id.split('-')[1]}-${ending.id.split('-')[1]}`;
      result.push({
        id,
        text: `${prefix} ${beginning.text} ${preposition.text} ${ending.text}?`,
      });
    }
    return result;
  }, [riddleWordsQuery.data, riddleConjunctionsQuery.data, language, retrigger]);

  const columns: TableProps<Riddle>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Title',
      dataIndex: 'text',
      key: 'title',
      sorter: (a, b) => a.text.localeCompare(b.text),
      render: (text) => <Typography.Text copyable>{text}</Typography.Text>,
    },
  ];

  return (
    <PageLayout subtitle="Randomly generate riddle prompts" title="Riddler">
      <Layout hasSider>
        <PageSider>
          <SiderContent>
            <LanguageToggle value={language ? language : undefined} withLabel withQueryParams />
            <Button block onClick={() => setRetrigger((prev) => prev + 1)}>
              Retrigger
            </Button>
          </SiderContent>
        </PageSider>

        <Layout.Content className="content my-4">
          <DataLoadingWrapper
            error={riddleWordsQuery.error || riddleConjunctionsQuery.error}
            hasResponseData={!isEmpty(riddleWordsQuery.data) || !isEmpty(riddleConjunctionsQuery.data)}
            isLoading={riddleWordsQuery.isLoading || riddleConjunctionsQuery.isLoading}
          >
            <Table
              columns={columns}
              dataSource={rows}
              // pagination={paginationProps}
              // /pagination
              rowKey="id"
            />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Riddler;
