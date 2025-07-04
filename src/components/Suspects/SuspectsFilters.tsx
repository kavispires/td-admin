import { Divider, Flex } from 'antd';
import { FilterNumber, FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import type { SuspectCard } from 'types';
import { sortJsonKeys } from 'utils';
import { SuspectsStats } from './SuspectsStats';
import { SuspectsStyleVariantSelector } from './SuspectsStyleVariantSelector';

const DEPRECATED_VERSIONS = [
  { value: 'ct', label: 'Cartoon (deprecated)' },
  { value: 'ai', label: 'AI (deprecated)' },
  { value: 'md', label: 'Models (deprecated)' },
  { value: 'wc', label: 'Wacky (deprecated)' },
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
      <Flex gap={12} vertical>
        <SaveButton
          dirt={JSON.stringify(entriesToUpdate)}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={save}
        />

        <DownloadButton
          block
          data={() => prepareFileForDownload(data)}
          disabled={isDirty}
          fileName="suspects.json"
          hasNewData={hasFirestoreData}
        />

        <FirestoreConsoleLink className="text-center" path={'tdr/suspects'} />
      </Flex>

      <Divider />

      <SuspectsStyleVariantSelector />

      <FilterNumber
        label="Cards Per Row"
        max={12}
        min={2}
        onChange={(v) => addParam('cardsPerRow', v)}
        value={Number(queryParams.get('cardsPerRow') ?? '10')}
      />
      <FilterSelect
        label="Sort By"
        onChange={(v) => addParam('sortBy', v)}
        options={SORT_BY}
        value={queryParams.get('sortBy') ?? 'id'}
      />
      <FilterSelect
        label="Other Versions"
        onChange={(v) => addParam('variant', v)}
        options={DEPRECATED_VERSIONS}
        value={queryParams.get('variant') ?? 'gb'}
      />
      <SuspectsStats data={data} />
    </SiderContent>
  );
}

function prepareFileForDownload(data: Dictionary<SuspectCard>) {
  const copy = cloneDeep(data);
  for (const key in copy) {
    const suspect = copy[key];

    // if (suspect.height.length === 1 || suspect.build.length === 1) {
    //   if (suspect.height === 'S') suspect.height = 'short';
    //   if (suspect.height === 'M') suspect.height = 'medium';
    //   if (suspect.height === 'L') suspect.height = 'tall';

    //   if (suspect.build === 'S') suspect.build = 'thin';
    //   if (suspect.build === 'M') suspect.build = 'average';
    // }
    // if (suspect.build === 'fat') suspect.build = 'large';
    // if (suspect.build === 'heavy') suspect.build = 'large';
    if (suspect.name.pt.endsWith('.')) {
      suspect.name.pt = suspect.name.pt.slice(0, -1).trim();
    }
    if (suspect.name.en.endsWith('.')) {
      suspect.name.en = suspect.name.en.slice(0, -1).trim();
    }

    // if Id number is over 114, add gbExclusive = true property
    const numberedId = Number(suspect.id.match(/\d+/));
    if (numberedId > 114) {
      suspect.gbExclusive = true;
    }
  }

  return sortJsonKeys(copy, ['gender', 'ethnicity', 'age', 'height', 'build', 'features']);
}
