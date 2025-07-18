import { ContactsOutlined, RobotOutlined, TableOutlined } from '@ant-design/icons';
import { Flex, Tooltip } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { SuspectsStyleVariantSelector } from 'components/Suspects/SuspectsStyleVariantSelector';
import { getDocQueryFunction } from 'hooks/useGetFirestoreDoc';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep } from 'lodash';
import {
  countAnswers,
  type TestimonyAnswers,
  type useTestimoniesResource,
} from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import { deepCleanObject, deserializeFirestoreData, sortJsonKeys } from 'utils';
import { TestimonyDrawer } from './TestimonyDrawer';
import normalizeValues from './utils';

export type TestimoniesFiltersProps = ReturnType<typeof useTestimoniesResource>;

export function TestimoniesFilters({
  suspects,
  questions,
  data,
  hasNewData,
  isDirty,
  save,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
}: TestimoniesFiltersProps) {
  const { queryParams, addParams } = useQueryParams();

  const counts = useMemo(() => {
    const suspects: Record<string, number> = {};
    Object.values(data).forEach((suspectEntry) => {
      Object.keys(suspectEntry).forEach((suspectId) => {
        if (suspectEntry[suspectId]) {
          if (!suspects[suspectId]) {
            suspects[suspectId] = 0;
          }
          if (countAnswers(suspectEntry[suspectId]) >= 5) {
            suspects[suspectId] += 1;
          }
        }
      });
    });

    return {
      queriedTestimoniesCount: Object.keys(data).length,
      suspectsCount: Object.keys(suspects).length,
      reliableSuspectsCount: Object.values(suspects).filter((count) => count >= 5).length,
    };
  }, [data]);

  return (
    <>
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
            data={async () => await prepareFileForDownload(data)}
            disabled={isDirty}
            fileName="testimony-answers.json"
            hasNewData={hasNewData}
          />

          <FirestoreConsoleLink className="text-center" label="Firestore Data" path={'data/testimonies'} />

          <FirestoreConsoleLink className="text-center" label="Firestore TDR" path={'tdr/testimonies'} />
        </Flex>
      </SiderContent>
      <SiderContent>
        <FilterSegments
          label="Display"
          onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1 })}
          options={[
            {
              title: 'Questions',
              icon: <TableOutlined />,
              value: 'questions',
            },
            {
              title: 'Suspects',
              icon: <ContactsOutlined />,
              value: 'suspects',
            },
            {
              title: 'Simulator',
              icon: <RobotOutlined />,
              value: 'simulator',
            },
          ]}
          value={queryParams.get('display') ?? 'questions'}
        />

        <SuspectsStyleVariantSelector />
      </SiderContent>

      <SiderContent>
        <div style={{ fontSize: '0.85em' }}>
          <strong>Legend</strong>
          <ul>
            <li>Reliability: At least 5 votes</li>
            <li>Large Bars: There's enough data (at least 3)</li>
            <li>Small blue bar: in progress negative</li>
          </ul>
        </div>
      </SiderContent>
      <SiderContent>
        <div style={{ fontSize: '0.85em' }}>
          <strong>Counts</strong>
          <ul>
            <li>Testimonies: {counts.queriedTestimoniesCount}</li>
            <li>Suspects: {counts.suspectsCount}</li>
            <li>
              <Tooltip title="A reliable suspect is one that has at least 5 complete testimonies.">
                Reliable suspects: {counts.reliableSuspectsCount}
              </Tooltip>
            </li>
          </ul>
        </div>

        <TestimonyDrawer
          addEntryToUpdate={addEntryToUpdate}
          answers={data}
          questions={questions}
          suspects={suspects}
        />
      </SiderContent>
    </>
  );
}

async function prepareFileForDownload(entriesToUpdate: Dictionary<TestimonyAnswers>) {
  console.log('Preparing file for download...x');

  const firebaseRawData = await getDocQueryFunction<Dictionary<string>>('data', 'testimonies')();
  const parsedData = deserializeFirestoreData<TestimonyAnswers>(firebaseRawData);

  console.log('Parsed data from Firestore:', parsedData);

  // DO MIGRATIONS HERE
  const copy = cloneDeep(entriesToUpdate);

  Object.keys(copy).forEach((key) => {
    const entry = copy[key];
    const firestoreEntry = parsedData[key] || {};
    // For each person if they have 4 1s, convert into a 4 if they have 4 0s convert into a -4
    Object.keys(entry).forEach((suspectId) => {
      const firestoreValues = firestoreEntry[suspectId] || [];

      const values = normalizeValues([...entry[suspectId], ...firestoreValues]);

      // Replace the values with the normalized ones
      entry[suspectId] = values;
    });
  });

  return sortJsonKeys(deepCleanObject(copy));
}
