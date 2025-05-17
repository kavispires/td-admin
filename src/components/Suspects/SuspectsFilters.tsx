import { Divider, Flex } from 'antd';
import { FilterNumber, FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { SuspectCard } from 'types';
import { sortJsonKeys } from 'utils';
import { SuspectsStats } from './SuspectsStats';

const VERSIONS = [
  { value: 'ct', label: 'Cartoon' },
  { value: 'gb', label: 'Ghibli' },
  { value: 'ai', label: 'AI' },
  { value: 'md', label: 'Models' },
  { value: 'wc', label: 'Wacky' },
];

const SORT_BY = [
  { value: 'id', label: 'Id' },
  { value: 'name.pt', label: 'Name (PT)' },
  { value: 'name.en', label: 'Name (EN)' },
  { value: 'ethnicity', label: 'Ethnicity' },
  { value: 'gender', label: 'Gender' },
  { value: 'age', label: 'Age' },
  { value: 'height', label: 'Height' },
  { value: 'build', label: 'Build' },
];

export function SuspectsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<SuspectCard>) {
  const { addParam, queryParams } = useQueryParams();
  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <SaveButton
          isDirty={isDirty}
          onSave={save}
          isSaving={isSaving}
          dirt={JSON.stringify(entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="suspects.json"
          disabled={isDirty}
          hasNewData={hasFirestoreData}
          block
        />
      </Flex>

      <Divider />

      <FilterSelect
        label="Version"
        value={queryParams.get('version') ?? 'gb'}
        onChange={(v) => addParam('version', v)}
        options={VERSIONS}
      />
      <FilterNumber
        label="Cards Per Row"
        value={Number(queryParams.get('cardsPerRow') ?? '8')}
        onChange={(v) => addParam('cardsPerRow', v)}
        min={2}
        max={12}
      />
      <FilterSelect
        label="Sort By"
        value={queryParams.get('sortBy') ?? 'id'}
        onChange={(v) => addParam('sortBy', v)}
        options={SORT_BY}
      />

      <SuspectsStats data={data} />
    </SiderContent>
  );
}

function prepareFileForDownload(data: Dictionary<SuspectCard>) {
  return sortJsonKeys(data, ['gender', 'ethnicity', 'age', 'height', 'build', 'features']);
}
