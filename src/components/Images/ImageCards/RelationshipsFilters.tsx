import { Flex } from 'antd';
import { FilterSelect, FilterSwitch, ResponseState } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { PageSider, SiderContent } from 'components/Layout';
import { isEmpty } from 'lodash';
import { CARD_SIZE_OPTIONS, SAMPLE_SIZE_OPTIONS, TAGS_SELECTOR_OPTIONS } from 'utils/constants';

import { useImagesRelationshipsContext } from './ImagesRelationshipsContext';
import { RelationshipsStats } from './RelationshipsStats';

export function RelationshipsFilters() {
  const {
    query: { isDirty, isSaving, save, data, isLoading, isError },
    randomGroups: { filters },
    showIds,
    setShowIds,
    tagThreshold,
    setTagThreshold,
    sampleSize,
    setSampleSize,
    cardSize,
    setCardSize,
  } = useImagesRelationshipsContext();

  return (
    <PageSider>
      <SiderContent>
        <Flex vertical gap={6}>
          <SaveButton
            isDirty={isDirty}
            dirt={JSON.stringify(data)}
            onSave={() => save({})}
            isSaving={isSaving}
          />

          <DownloadButton
            data={data}
            fileName="imageCardsRelationships.json"
            loading={isSaving}
            disabled={isEmpty(data)}
            block
          />
        </Flex>
      </SiderContent>

      <ResponseState
        isLoading={isLoading || isSaving}
        isDirty={isDirty}
        isError={isError}
        hasResponseData={!isEmpty(data)}
      />

      <SiderContent>
        <FilterSwitch
          label="Use Cycles"
          value={filters.useCycles}
          onChange={() => filters.toggleUseCycles()}
        />

        <FilterSwitch label="Show Ids" value={showIds} onChange={(c) => setShowIds(c)} />

        <FilterSelect
          onChange={(value) => setTagThreshold(value)}
          value={tagThreshold}
          options={TAGS_SELECTOR_OPTIONS}
          label="Tag Count"
        />

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
      </SiderContent>

      <SiderContent>
        <RelationshipsStats />
      </SiderContent>
    </PageSider>
  );
}
