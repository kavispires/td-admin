import { EnvironmentOutlined, SkinOutlined, TagOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep } from 'lodash';
import type { CrimeSceneTile, CrimesHediondosCard } from 'types';
import { sortJsonKeys } from 'utils';
import type { CrimesHediondosContentProps } from './CrimesHediondosContent';

export function CrimesHediondosFilters({
  weaponsQuery,
  evidenceQuery,
  scenesQuery,
  locationsQuery,
  victimsQuery,
}: CrimesHediondosContentProps) {
  const { queryParams, addParam, addParams, is } = useQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <Flex gap={6}>
          <Flex vertical gap={6}>
            <span>Weapons</span>
            <SaveButton
              isDirty={weaponsQuery.isDirty}
              onSave={weaponsQuery.save}
              isSaving={weaponsQuery.isSaving}
              dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
              size="middle"
            />

            <DownloadButton
              data={() => prepareFileForDownload(weaponsQuery.data)}
              fileName="crime-weapons.json"
              disabled={weaponsQuery.isDirty}
              hasNewData={weaponsQuery.hasFirestoreData}
              block
            >
              JSON
            </DownloadButton>
          </Flex>

          <Flex vertical gap={6}>
            <span>Evidence</span>
            <SaveButton
              isDirty={evidenceQuery.isDirty}
              onSave={evidenceQuery.save}
              isSaving={evidenceQuery.isSaving}
              dirt={JSON.stringify(evidenceQuery.entriesToUpdate)}
              size="middle"
            />

            <DownloadButton
              data={() => prepareFileForDownload(evidenceQuery.data)}
              fileName="crime-evidence.json"
              disabled={evidenceQuery.isDirty}
              hasNewData={evidenceQuery.hasFirestoreData}
              block
            >
              JSON
            </DownloadButton>
          </Flex>
        </Flex>

        <Flex gap={6}>
          <Flex vertical gap={6}>
            <span>Locations</span>
            <SaveButton
              isDirty={weaponsQuery.isDirty}
              onSave={weaponsQuery.save}
              isSaving={weaponsQuery.isSaving}
              dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
              size="middle"
            />
            <DownloadButton
              data={() => prepareFileForDownload(locationsQuery.data)}
              fileName="crime-locations.json"
              disabled={weaponsQuery.isDirty}
              hasNewData={weaponsQuery.hasFirestoreData}
              block
            >
              JSON
            </DownloadButton>
          </Flex>

          <Flex vertical gap={6}>
            <span>Victims</span>
            <SaveButton
              isDirty={weaponsQuery.isDirty}
              onSave={weaponsQuery.save}
              isSaving={weaponsQuery.isSaving}
              dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
              size="middle"
            />
            <DownloadButton
              data={() => prepareFileForDownload(victimsQuery.data)}
              fileName="crime-victims.json"
              disabled={weaponsQuery.isDirty}
              hasNewData={weaponsQuery.hasFirestoreData}
            >
              JSON
            </DownloadButton>
          </Flex>
        </Flex>

        <span>Scenes</span>
        <SaveButton
          isDirty={scenesQuery.isDirty}
          onSave={scenesQuery.save}
          isSaving={scenesQuery.isSaving}
          dirt={JSON.stringify(scenesQuery.entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareScenesFileForDownload(scenesQuery.data)}
          fileName="crime-scenes.json"
          disabled={scenesQuery.isDirty}
          hasNewData={scenesQuery.hasFirestoreData}
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

function prepareFileForDownload(cards: Dictionary<CrimesHediondosCard>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(cards);
  Object.values(copy).forEach((card) => {
    if (!card.likelihood) {
      card.likelihood = {};
    }
  });

  return sortJsonKeys(copy);
}

function prepareScenesFileForDownload(scenes: Dictionary<CrimeSceneTile>) {
  console.log('Preparing scenes file for download...');
  const copy = cloneDeep(scenes);
  // Object.values(copy).forEach((scene) => {

  // });

  return sortJsonKeys(copy);
}
