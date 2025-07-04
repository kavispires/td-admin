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
        hasResponseData={!isEmpty(data)}
        isDirty={isDirty}
        isError={isError}
        isLoading={isLoading || isSaving}
      />

      <SiderContent>
        <FilterSwitch label="Show Ids" onChange={(c) => setShowIds(c)} value={showIds} />

        <FilterSelect
          label="Sample Size"
          onChange={(value) => setSampleSize(value)}
          options={SAMPLE_SIZE_OPTIONS}
          value={sampleSize}
        />

        <FilterSelect
          label="Card Size"
          onChange={(value) => setCardSize(value)}
          options={CARD_SIZE_OPTIONS}
          value={cardSize}
        />

        <Button block onClick={nextSet} type="primary">
          New Random Sample
        </Button>
      </SiderContent>

      <SiderContent>
        <RelationshipsStats />
      </SiderContent>

      <SiderContent>
        <DownloadButton
          block
          data={data}
          disabled={isEmpty(data)}
          fileName="imageCardsRelationships.json"
          loading={isSaving}
        />
      </SiderContent>
    </PageSider>
  );
}
