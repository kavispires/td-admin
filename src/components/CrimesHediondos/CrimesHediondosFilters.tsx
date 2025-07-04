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
      <Flex gap={12} vertical>
        <Flex gap={6}>
          <Flex gap={6} vertical>
            <span>Weapons</span>
            <SaveButton
              dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
              isDirty={weaponsQuery.isDirty}
              isSaving={weaponsQuery.isSaving}
              onSave={weaponsQuery.save}
              size="middle"
            />

            <DownloadButton
              block
              data={() => prepareFileForDownload(weaponsQuery.data)}
              disabled={weaponsQuery.isDirty}
              fileName="crime-weapons.json"
              hasNewData={weaponsQuery.hasFirestoreData}
            >
              JSON
            </DownloadButton>
          </Flex>

          <Flex gap={6} vertical>
            <span>Evidence</span>
            <SaveButton
              dirt={JSON.stringify(evidenceQuery.entriesToUpdate)}
              isDirty={evidenceQuery.isDirty}
              isSaving={evidenceQuery.isSaving}
              onSave={evidenceQuery.save}
              size="middle"
            />

            <DownloadButton
              block
              data={() => prepareFileForDownload(evidenceQuery.data)}
              disabled={evidenceQuery.isDirty}
              fileName="crime-evidence.json"
              hasNewData={evidenceQuery.hasFirestoreData}
            >
              JSON
            </DownloadButton>
          </Flex>
        </Flex>

        <Flex gap={6}>
          <Flex gap={6} vertical>
            <span>Locations</span>
            <SaveButton
              dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
              isDirty={weaponsQuery.isDirty}
              isSaving={weaponsQuery.isSaving}
              onSave={weaponsQuery.save}
              size="middle"
            />
            <DownloadButton
              block
              data={() => prepareFileForDownload(locationsQuery.data)}
              disabled={weaponsQuery.isDirty}
              fileName="crime-locations.json"
              hasNewData={weaponsQuery.hasFirestoreData}
            >
              JSON
            </DownloadButton>
          </Flex>

          <Flex gap={6} vertical>
            <span>Victims</span>
            <SaveButton
              dirt={JSON.stringify(weaponsQuery.entriesToUpdate)}
              isDirty={weaponsQuery.isDirty}
              isSaving={weaponsQuery.isSaving}
              onSave={weaponsQuery.save}
              size="middle"
            />
            <DownloadButton
              data={() => prepareFileForDownload(victimsQuery.data)}
              disabled={weaponsQuery.isDirty}
              fileName="crime-victims.json"
              hasNewData={weaponsQuery.hasFirestoreData}
            >
              JSON
            </DownloadButton>
          </Flex>
        </Flex>

        <span>Scenes</span>
        <SaveButton
          dirt={JSON.stringify(scenesQuery.entriesToUpdate)}
          isDirty={scenesQuery.isDirty}
          isSaving={scenesQuery.isSaving}
          onSave={scenesQuery.save}
        />

        <DownloadButton
          block
          data={() => prepareScenesFileForDownload(scenesQuery.data)}
          disabled={scenesQuery.isDirty}
          fileName="crime-scenes.json"
          hasNewData={scenesQuery.hasFirestoreData}
        />
      </Flex>
      <Divider />

      <FilterSegments
        label="Display"
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
        value={queryParams.get('display') ?? 'listing'}
      />

      {is('display', 'item') && (
        <FilterSwitch
          label="No Groups Only"
          onChange={(mode) => addParam('emptyOnly', mode, false)}
          value={is('emptyOnly')}
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
