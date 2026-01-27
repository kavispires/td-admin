import { DotChartOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex, Form } from 'antd';
import { FilterNumber, FilterSegments, FilterSelect } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleWipe } from 'components/Common/FirestoreConsoleLink';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep, merge } from 'lodash';
import type { SuspectCard, SuspectExtendedInfo } from 'types';
import { sortJsonKeys } from 'utils';
import { NewSuspectFlow } from './NewSuspectFlow';
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
  const { addParam, queryParams, is } = useQueryParams();
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
      <FilterSegments
        label="Display"
        onChange={(mode) => addParam('display', mode)}
        options={[
          {
            title: 'Listing',
            icon: <TableOutlined />,
            value: 'listing',
          },
          {
            title: 'Stats',
            icon: <DotChartOutlined />,
            value: 'stats',
          },
        ]}
        value={queryParams.get('display') ?? 'listing'}
      />
      {!is('display', 'stats') && (
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
      )}

      <Divider />

      <NewSuspectFlow
        addExtendedInfoEntryToUpdate={suspectsExtendedInfoQuery.addEntryToUpdate}
        addSuspectEntryToUpdate={suspectsQuery.addEntryToUpdate}
        suspects={suspectsQuery.data}
        suspectsExtendedInfos={suspectsExtendedInfoQuery.data}
      />

      <DownloadButton
        block
        className="my-2"
        data={() => {
          return merge(
            {},
            prepareSuspectFileForDownload(suspectsQuery.data),
            prepareExtendedInfoFileForDownload(suspectsExtendedInfoQuery.data),
          );
        }}
        disabled={suspectsQuery.isDirty || suspectsExtendedInfoQuery.isDirty}
        fileName="suspects-combined.json"
      >
        Combined Data
      </DownloadButton>
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

  // for (const key in copy) {
  //   const suspect = copy[key];
  //   // Add decks field if missing
  //   const idNumber = Number(suspect.id.split('-')[1]);
  //   if (idNumber < 115) {
  //     suspect.decks = ['base'];
  //   }
  //   if (idNumber >= 115 && idNumber < 200) {
  //     suspect.decks = ['personas'];
  //   }
  // }

  return sortJsonKeys(copy, [
    'id',
    'name',
    'decks',
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
  // Change profession to occupation
  // Change personalityTraits to traits
  // for (const key in data) {
  //   const info = data[key];
  // if ((info as any).profession !== undefined) {
  //   info.occupation = (info as any).profession;
  //   delete (info as any).profession;
  //   info.traits = (info as any).personalityTraits;
  //   delete (info as any).personalityTraits;
  // }
  // }

  return sortJsonKeys(data, [
    'id',
    'prompt',
    'persona',
    'description',
    'animal',
    'occupation',
    'sexualOrientation',
    'ethnicity',
    'economicClass',
    'educationLevel',
    'traits',
  ]);
}
