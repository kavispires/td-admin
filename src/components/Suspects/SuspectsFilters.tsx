import { Divider, Flex, Form } from 'antd';
import { FilterNumber, FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleWipe } from 'components/Common/FirestoreConsoleLink';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import type { SuspectCard, SuspectExtendedInfo } from 'types';
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

const PROMPTS = [
  { value: '', label: 'No Prompt/Custom' },
  { value: 'ghibli', label: 'Ghibli Style' },
  { value: 'realistic', label: 'Realistic Style' },
  { value: 'pixar', label: 'Pixar Style' },
  { value: 'fox', label: 'Fox Style' },
  { value: 'zootopia', label: 'Zootopia Style' },
];

export function SuspectsFilters({
  suspectsQuery,
  suspectsExtendedInfoQuery,
}: {
  suspectsQuery: UseResourceFirestoreDataReturnType<SuspectCard>;
  suspectsExtendedInfoQuery: UseResourceFirestoreDataReturnType<SuspectExtendedInfo>;
}) {
  const { addParam, queryParams } = useQueryParams();
  return (
    <SiderContent>
      <Flex gap={12} vertical>
        <SaveButton
          dirt={JSON.stringify(suspectsQuery.entriesToUpdate)}
          isDirty={suspectsQuery.isDirty}
          isSaving={suspectsQuery.isSaving}
          onSave={suspectsQuery.save}
        >
          Save Suspects
        </SaveButton>

        <DownloadButton
          block
          data={() => prepareSuspectFileForDownload(suspectsQuery.data)}
          disabled={suspectsQuery.isDirty}
          fileName="suspects.json"
          hasNewData={suspectsQuery.hasFirestoreData}
        />

        <Flex justify="center">
          <FirestoreConsoleWipe docId="suspects" path="tdr" queryKey={['tdr', 'suspects']} />
        </Flex>
      </Flex>

      <Divider />

      <Flex gap={12} vertical>
        <SaveButton
          dirt={JSON.stringify(suspectsExtendedInfoQuery.entriesToUpdate)}
          isDirty={suspectsExtendedInfoQuery.isDirty}
          isSaving={suspectsExtendedInfoQuery.isSaving}
          onSave={suspectsExtendedInfoQuery.save}
        >
          Save Extended
        </SaveButton>

        <DownloadButton
          block
          data={() => prepareExtendedInfoFileForDownload(suspectsExtendedInfoQuery.data)}
          disabled={suspectsExtendedInfoQuery.isDirty}
          fileName="suspects-extended-info.json"
          hasNewData={suspectsExtendedInfoQuery.hasFirestoreData}
        />

        <Flex justify="center">
          <FirestoreConsoleWipe
            docId="suspectsExtendedInfo"
            path="tdr"
            queryKey={['tdr', 'suspectsExtendedInfo']}
          />
        </Flex>
      </Flex>

      <Divider />

      <SuspectsStyleVariantSelector />
      <Divider />
      <Form layout="vertical">
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

        <FilterSelect
          label="Prompt Style"
          onChange={(v) => addParam('prompt', v)}
          options={PROMPTS}
          value={queryParams.get('prompt') ?? ''}
        />
      </Form>

      <Divider />
      <SuspectsStats data={suspectsQuery.data} />
    </SiderContent>
  );
}

function prepareSuspectFileForDownload(data: Dictionary<SuspectCard>) {
  const copy = cloneDeep(data);
  // TO PERFORM CLEANUPS OR UPDATES ON EXISTING SUSPECTS
  // for (const key in copy) {
  //   const suspect = copy[key];
  //   // If key/id has a number lower than 100, I need to pad it with a 0
  //   const idNumber = Number(suspect.id.split('-')[1]);
  //   if (idNumber < 100) {
  //     const paddedId = `us-${idNumber.toString().padStart(3, '0')}`;
  //     copy[paddedId] = {
  //       ...suspect,
  //       id: paddedId,
  //     };
  //   }
  // }

  // TO ADD NEW SUSPECTS
  // Add 40 new blank suspects with ids from 151 to 190 following the SuspectCard type
  // for (let i = 196; i <= 200; i++) {
  //   const id = `us-${i.toString().padStart(3, '0')}`;
  //   const newSuspect: SuspectCard = {
  //     id,
  //     name: { en: '', pt: '' },
  //     persona: { en: '', pt: '' },
  //     gender: '',
  //     ethnicity: '',
  //     age: '',
  //     build: '',
  //     height: '',
  //     features: [],
  //     gbExclusive: true,
  //     prompt: '',
  //     animal: '',
  //   };
  //   if (copy[id] === undefined) {
  //     copy[id] = newSuspect;
  //   }
  // }

  return sortJsonKeys(copy, [
    'id',
    'name',
    'gender',
    'race',
    'ethnicity',
    'age',
    'height',
    'build',
    'features',
    'gbExclusive',
  ]);
}

export function prepareExtendedInfoFileForDownload(data: Dictionary<SuspectExtendedInfo>) {
  return sortJsonKeys(data, ['id', 'persona', 'prompt', 'description']);
}
