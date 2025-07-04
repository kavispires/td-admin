import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCardsPasscodeContent } from 'components/Images/ImageCards/ImageCardsPasscodeContent';
import { ImageCardsPasscodeFilters } from 'components/Images/ImageCards/ImageCardsPasscodeFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { ImageCardPasscodeSet } from 'types';

export function ImageCardsPasscode() {
  const imageCardsPasscodeQuery = useResourceFirestoreData<ImageCardPasscodeSet>({
    tdrResourceName: 'daily-passcode-sets',
    firestoreDataCollectionName: 'imagePasscode',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Daily Set Entries" title="Image Cards Passcode Sets">
      <Layout hasSider>
        <PageSider>
          <ImageCardsPasscodeFilters {...imageCardsPasscodeQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={imageCardsPasscodeQuery.error}
            hasResponseData={!isEmpty(imageCardsPasscodeQuery.data)}
            isLoading={imageCardsPasscodeQuery.isLoading}
          >
            <ImageCardsPasscodeContent {...imageCardsPasscodeQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ImageCardsPasscode;
