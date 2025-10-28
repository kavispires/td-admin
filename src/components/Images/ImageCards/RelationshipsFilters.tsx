import { Flex, Form } from 'antd';
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
        <Flex gap={6} vertical>
          <SaveButton
            dirt={JSON.stringify(data)}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={() => save({})}
          />

          <DownloadButton
            block
            data={data}
            disabled={isEmpty(data)}
            fileName="imageCardsRelationships.json"
            loading={isSaving}
          />
        </Flex>
      </SiderContent>

      <ResponseState
        hasResponseData={!isEmpty(data)}
        isDirty={isDirty}
        isError={isError}
        isLoading={isLoading || isSaving}
      />

      <SiderContent>
        <FilterSwitch
          label="Use Cycles"
          onChange={() => filters.toggleUseCycles()}
          value={filters.useCycles}
        />

        <FilterSwitch label="Show Ids" onChange={(c) => setShowIds(c)} value={showIds} />

        <Form layout="vertical">
          <FilterSelect
            label="Tag Count"
            onChange={(value) => setTagThreshold(value)}
            options={TAGS_SELECTOR_OPTIONS}
            value={tagThreshold}
          />

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
        </Form>
      </SiderContent>

      <SiderContent>
        <RelationshipsStats />
      </SiderContent>
    </PageSider>
  );
}
