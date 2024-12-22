import { Button } from 'antd';
import { FilterSelect, FilterSwitch, ResponseState } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { PageSider, SiderContent } from 'components/Layout';
import { isEmpty } from 'lodash';
import { CARD_SIZE_OPTIONS, SAMPLE_SIZE_OPTIONS } from 'utils/constants';
import { useImagesRelationshipsContext } from './ImagesRelationshipsContext';
import { RelationshipsStats } from './RelationshipsStats';

export function ConnectionsFilters() {
  const {
    query: { isDirty, isSaving, data, isLoading, isError },
    showIds,
    setShowIds,
    sampleSize,
    setSampleSize,
    cardSize,
    setCardSize,
    randomGroups: { nextSet },
  } = useImagesRelationshipsContext();

  return (
    <PageSider>
      <ResponseState
        isLoading={isLoading || isSaving}
        isDirty={isDirty}
        isError={isError}
        hasResponseData={!isEmpty(data)}
      />

      <SiderContent>
        <FilterSwitch label="Show Ids" value={showIds} onChange={(c) => setShowIds(c)} />

        <FilterSelect
          onChange={(value) => setSampleSize(value)}
          value={sampleSize}
          options={SAMPLE_SIZE_OPTIONS}
          label="Sample Size"
        />

        <FilterSelect
          onChange={(value) => setCardSize(value)}
          value={cardSize}
          options={CARD_SIZE_OPTIONS}
          label="Card Size"
        />

        <Button onClick={nextSet} block type="primary">
          New Random Sample
        </Button>
      </SiderContent>

      <SiderContent>
        <RelationshipsStats />
      </SiderContent>

      <SiderContent>
        <DownloadButton
          data={data}
          fileName="imageCardsRelationships.json"
          loading={isSaving}
          disabled={isEmpty(data)}
          block
        />
      </SiderContent>
    </PageSider>
  );
}
