import { ContactsOutlined, RobotOutlined, TableOutlined } from '@ant-design/icons';
import { Flex, Tooltip } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep } from 'lodash';
import type { TestimonyAnswers, useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import { deepCleanObject, sortJsonKeys } from 'utils';

export type TestimoniesFiltersProps = ReturnType<typeof useTestimoniesResource>;

export function TestimoniesFilters({
  data,
  hasNewData,
  isDirty,
  save,
  isSaving,
  entriesToUpdate,
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
          if (suspectEntry[suspectId].length >= 5) {
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
        <Flex vertical gap={12}>
          <SaveButton
            isDirty={isDirty}
            onSave={save}
            isSaving={isSaving}
            dirt={JSON.stringify(entriesToUpdate)}
          />

          <DownloadButton
            data={() => prepareFileForDownload(data)}
            fileName="testimony-answers.json"
            disabled={isDirty}
            hasNewData={hasNewData}
            block
          />
        </Flex>
      </SiderContent>
      <SiderContent>
        <FilterSegments
          label="Display"
          value={queryParams.get('display') ?? 'questions'}
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
        />
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
      </SiderContent>
    </>
  );
}

function prepareFileForDownload(entriesToUpdate: Dictionary<TestimonyAnswers>) {
  console.log('Preparing file for download...');

  // DO MIGRATIONS HERE
  const copy = cloneDeep(entriesToUpdate);

  // // Merge two questions
  // const q137 = copy['t-137-pt'];
  // const q179 = copy['t-179-pt'];
  // Object.keys(q179).forEach((suspectId) => {
  //   if (q137[suspectId] === undefined) {
  //     q137[suspectId] = q179[suspectId];
  //   } else {
  //     q137[suspectId].push(...q179[suspectId]);
  //   }
  // });
  // delete copy['t-179-pt'];

  // // Merge two opposite questions
  // const q114 = copy['t-114-pt'];
  // const q202 = copy['t-202-pt'];
  // Object.keys(q202).forEach((suspectId) => {
  //   const newResult = q202[suspectId].map((value) => {
  //     if (value === 1) return 0;
  //     if (value === 0) return 1;
  //     if (value === -3) return 3;
  //     if (value === 3) return -3;
  //     return value;
  //   });

  //   if (q114[suspectId] === undefined) {
  //     q114[suspectId] = newResult;
  //   } else {
  //     q114[suspectId].push(...newResult);
  //   }
  // });
  // delete copy['t-202-pt'];
  // // Object.keys(copy).forEach((testimonyId) => {
  // // });

  return sortJsonKeys(deepCleanObject(copy));
}
