import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep } from 'lodash';
import type { CrimeSceneTile, CrimesHediondosCard } from 'types';
import { sortJsonKeys } from 'utils';

import { EnvironmentOutlined, SkinOutlined, TagOutlined } from '@ant-design/icons';
import type { CrimesHediondosContentProps } from './CrimesHediondosContent';

export function CrimesHediondosFilters({
  weaponsQuery,
  evidenceQuery,
  scenesQuery,
}: CrimesHediondosContentProps) {
  const { queryParams, addParam, addParams, is } = useQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <span>Weapons</span>
        <SaveButton
          isDirty={weaponsQuery.isDirty}
          onSave={weaponsQuery.save}
          isSaving={weaponsQuery.isSaving}
          dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(weaponsQuery.data)}
          fileName="crime-weapons.json"
          disabled={weaponsQuery.isDirty}
          block
        />

        <span>Evidence</span>
        <SaveButton
          isDirty={evidenceQuery.isDirty}
          onSave={evidenceQuery.save}
          isSaving={evidenceQuery.isSaving}
          dirt={JSON.stringify(evidenceQuery.entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(evidenceQuery.data)}
          fileName="crime-evidence.json"
          disabled={evidenceQuery.isDirty}
          block
        />

        <span>Scenes</span>
        <SaveButton
          isDirty={scenesQuery.isDirty}
          onSave={scenesQuery.save}
          isSaving={scenesQuery.isSaving}
          dirt={JSON.stringify(scenesQuery.entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(scenesQuery.data)}
          fileName="crime-scenes.json"
          disabled={scenesQuery.isDirty}
          block
        />
      </Flex>
      <Divider />

      <FilterSegments
        label="Display"
        value={queryParams.get('display') ?? 'listing'}
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1 })}
        options={[
          {
            title: 'Cards',
            icon: <SkinOutlined />,
            value: 'cards',
          },
          {
            title: 'Tags',
            icon: <TagOutlined />,
            value: 'tags',
          },
          {
            title: 'Scenes',
            icon: <EnvironmentOutlined />,
            value: 'scenes',
          },
        ]}
      />

      {is('display', 'item') && (
        <FilterSwitch
          label="No Groups Only"
          value={is('emptyOnly')}
          onChange={(mode) => addParam('emptyOnly', mode, false)}
        />
      )}
    </SiderContent>
  );
}

function prepareFileForDownload(diagramItems: Dictionary<CrimesHediondosCard | CrimeSceneTile>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);

  return sortJsonKeys(copy);
}
