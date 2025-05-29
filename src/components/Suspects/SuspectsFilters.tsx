import { Divider, Flex } from 'antd';
import { FilterNumber, FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
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
  const copy = cloneDeep(data);
  for (const key in copy) {
    const suspect = copy[key];

    if (suspect.height.length === 1 || suspect.build.length === 1) {
      if (suspect.height === 'S') suspect.height = 'short';
      if (suspect.height === 'M') suspect.height = 'medium';
      if (suspect.height === 'L') suspect.height = 'tall';

      if (suspect.build === 'S') suspect.build = 'thin';
      if (suspect.build === 'M') suspect.build = 'average';
    }
    if (suspect.build === 'fat') suspect.build = 'large';
    if (suspect.build === 'heavy') suspect.build = 'large';
  }

  return sortJsonKeys(copy, ['gender', 'ethnicity', 'age', 'height', 'build', 'features']);
}

const NEW_SUSPECTS: Dictionary<SuspectCard> = {
  'us-115': {
    id: 'us-115',
    name: {
      pt: 'Kai V', // hawaiian
      en: 'Kai V',
    },
    gender: 'male',
    age: '18-21',
    ethnicity: 'asian',
    height: 'short',
    build: 'muscular',
    features: [],
    gbExclusive: true,
  },
  'us-116': {
    id: 'us-116',
    name: {
      pt: 'Téo', // flamboyant
      en: 'Theo',
    },
    gender: 'male',
    age: '21-30',
    ethnicity: 'white',
    height: 'medium',
    build: 'thin',
    features: [],
    gbExclusive: true,
  },
  'us-117': {
    id: 'us-117',
    name: {
      pt: 'aaa', //
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-118': {
    id: 'us-118',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-119': {
    id: 'us-119',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-120': {
    id: 'us-120',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-121': {
    id: 'us-121',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-122': {
    id: 'us-122',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-123': {
    id: 'us-123',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-124': {
    id: 'us-124',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-125': {
    id: 'us-125',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-126': {
    id: 'us-126',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-127': {
    id: 'us-127',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-128': {
    id: 'us-128',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-129': {
    id: 'us-129',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
  'us-130': {
    id: 'us-130',
    name: {
      pt: 'aaa',
      en: 'aaa',
    },
    gender: 'male',
    age: '',
    ethnicity: '',
    height: '',
    build: '',
    features: [],
    gbExclusive: true,
  },
};
