import { ContactsOutlined, TableOutlined } from '@ant-design/icons';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { TestimonyAnswers, useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { deepCleanObject, sortJsonKeys } from 'utils';

export type TestimoniesFiltersProps = ReturnType<typeof useTestimoniesResource>;

export function TestimoniesFilters({ data }: TestimoniesFiltersProps) {
  const { queryParams, addParams } = useQueryParams();
  return (
    <>
      <SiderContent>
        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="testimony-answers.json"
          // disabled={isDirty}
          block
        />
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
    </>
  );
}

function prepareFileForDownload(entriesToUpdate: Dictionary<TestimonyAnswers>) {
  console.log('Preparing file for download...');
  // const copy = cloneDeep(entriesToUpdate);
  // // Remove any undefined values of any keys in each entry
  // Object.values(copy).forEach((entry) => {
  //   const exclusivity = entry.exclusivity as string;
  //   if (entry.exclusivity === undefined || exclusivity === 'none') {
  //     entry.exclusivity = undefined;
  //   }
  // });

  return sortJsonKeys(deepCleanObject(entriesToUpdate));
}
