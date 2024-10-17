import { Button, Divider, Flex } from 'antd';
import { FilterSelect, ResponseState } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { PageSider, SiderContent } from 'components/Layout';
import { isEmpty } from 'lodash';

import { UseImageCardsRelationshipDataReturnValue } from './hooks';
import { useQueryParams } from 'hooks/useQueryParams';

type ComparatorFiltersProps = {
  query: UseImageCardsRelationshipDataReturnValue;
};

export function ComparatorFilters({ query }: ComparatorFiltersProps) {
  const { data, isDirty, isSaving, save, isLoading, isError } = query;
  const { queryParams, addParam } = useQueryParams();

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
        <Button block onClick={() => addParam('open', 'true')}>
          Open Modal
        </Button>

        <Divider />

        <FilterSelect
          label="Cycle Threshold"
          value={queryParams.get('cycle') || 3}
          onChange={(v) => addParam('cycle', v)}
          options={[1, 3, 5, 10]}
        />
      </SiderContent>
    </PageSider>
  );
}
