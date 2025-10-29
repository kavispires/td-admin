import { Divider, Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout, PageSider } from 'components/Layout';
import { Header } from 'components/Layout/Header';
import { SuspectsPersonalitiesContent } from 'components/Suspects/PersonalityPage/SuspectsPersonalitiesContent';
import { useSuspectPersonalitiesData } from 'components/Suspects/PersonalityPage/useSuspectPersonalitiesData';
import { isEmpty } from 'lodash';
import { useTitle } from 'react-use';
import { PlaygroundContent } from './PlaygroundContent';

export function SuspectsPersonalities() {
  useTitle('Suspect Personalities');
  const dataQuery = useSuspectPersonalitiesData();

  return (
    <PageLayout
      subtitle="Dive deep into the suspect personalities based on their testimonies"
      title="Suspect Personalities"
    >
      <Layout hasSider>
        <PageSider>-</PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={dataQuery.error}
            hasResponseData={!isEmpty(dataQuery.data)}
            isLoading={dataQuery.isLoading}
          >
            <SuspectsPersonalitiesContent {...dataQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default SuspectsPersonalities;
