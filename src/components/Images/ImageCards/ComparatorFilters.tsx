import { Button, Divider, Flex } from 'antd';
import { FilterSelect, ResponseState } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { PageSider, SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { isEmpty } from 'lodash';
import type { UseImageCardsRelationshipDataReturnValue } from './hooks/hooks';

type ComparatorFiltersProps = {
  query: UseImageCardsRelationshipDataReturnValue;
};

export function ComparatorFilters({ query }: ComparatorFiltersProps) {
  const { data, isDirty, isSaving, save, isLoading, isError } = query;
  const { queryParams, addParam } = useQueryParams();

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
        <Button block onClick={() => addParam('open', 'true')}>
          Open Modal
        </Button>

        <Divider />

        <FilterSelect
          label="Cycle Threshold"
          onChange={(v) => addParam('cycle', v)}
          options={[1, 3, 5, 10]}
          value={queryParams.get('cycle') || 3}
        />
      </SiderContent>
    </PageSider>
  );
}
