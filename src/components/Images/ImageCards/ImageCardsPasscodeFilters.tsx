import { FileAddOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex, Tag, Typography } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import type { ImageCardPasscodeSet } from 'types';
import { sortJsonKeys } from 'utils';

export function ImageCardsPasscodeFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  hasFirestoreData,
}: UseResourceFirebaseDataReturnType<ImageCardPasscodeSet>) {
  const { addParams, queryParams } = useQueryParams();

  const { complete, incomplete, varied, mappings, mappedImages, overdone } = useMemo(() => {
    let complete = 0;
    let incomplete = 0;
    let overdone = 0;
    let varied = 0;
    let mappings = 0;
    const mappedImages: BooleanDictionary = {};

    Object.values(data).forEach((set) => {
      if (set.imageCardsIds.length >= 3) {
        complete++;
      }
      if (set.imageCardsIds.length > 4) {
        overdone++;
      }
      if (set.imageCardsIds.length < 3) {
        incomplete++;
      }
      if (set.passcode.length > 3) {
        varied++;
      }
      mappings += set.imageCardsIds.length;
      set.imageCardsIds.forEach((id) => {
        mappedImages[id] = true;
      });
    });

    return {
      complete,
      incomplete,
      varied,
      mappings,
      mappedImages: Object.keys(mappedImages).length,
      overdone,
    };
  }, [data]);

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
          fileName="daily-passcode-sets.json"
          disabled={isDirty}
          hasNewData={hasFirestoreData}
          block
        />
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
        value={queryParams.get('display') ?? 'table'}
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1, display: 'table' })}
        options={[
          {
            title: 'Table',
            icon: <TableOutlined />,
            value: 'table',
          },
          {
            title: 'Create',
            icon: <FileAddOutlined />,
            value: 'create',
          },
        ]}
      />

      <p>Stats</p>
      <Typography.Text>
        Passcode sets: <Tag>{Object.keys(data).length}</Tag>
      </Typography.Text>
      <br />
      <Typography.Text>
        Complete: <Tag color="green-inverse">{complete}</Tag>
      </Typography.Text>
      <br />
      <Typography.Text>
        Incomplete: <Tag color="gold-inverse">{incomplete}</Tag>
      </Typography.Text>
      <br />
      <Typography.Text>
        Overdone: <Tag color="purple">{overdone}</Tag>
      </Typography.Text>
      <br />
      <Typography.Text>
        Varied: <Tag>{varied}</Tag>
      </Typography.Text>
      <br />
      <Typography.Text>
        Mappings: <Tag>{mappings}</Tag>
      </Typography.Text>
      <br />
      <Typography.Text>
        Unique images: <Tag>{mappedImages}</Tag>
      </Typography.Text>
    </SiderContent>
  );
}

function prepareFileForDownload(diagramItems: Dictionary<ImageCardPasscodeSet>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);
  return sortJsonKeys(copy);
}
