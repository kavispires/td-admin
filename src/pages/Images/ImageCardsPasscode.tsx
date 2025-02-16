import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCardsPasscodeContent } from 'components/Images/ImageCards/ImageCardsPasscodeContent';
import { ImageCardsPasscodeFilters } from 'components/Images/ImageCards/ImageCardsPasscodeFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import type { ImageCardPasscodeSet } from 'types';

export function ImageCardsPasscode() {
  const imageCardsPasscodeQuery = useResourceFirebaseData<ImageCardPasscodeSet>({
    tdrResourceName: 'daily-passcode-sets',
    firebaseDataCollectionName: 'imagePasscode',
    serialize: true,
  });

  return (
    <PageLayout title="Image Cards Passcode Sets" subtitle="Daily Set Entries">
      <Layout hasSider>
        <PageSider>
          <ImageCardsPasscodeFilters {...imageCardsPasscodeQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={imageCardsPasscodeQuery.isLoading}
            error={imageCardsPasscodeQuery.error}
            hasResponseData={!isEmpty(imageCardsPasscodeQuery.data)}
          >
            <ImageCardsPasscodeContent {...imageCardsPasscodeQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ImageCardsPasscode;
