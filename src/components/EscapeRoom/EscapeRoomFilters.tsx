import { Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import type { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { cloneDeep } from 'lodash';
import { deepCleanObject, sortJsonKeys } from 'utils';
import type { EscapeRoomEpisode } from 'components/EscapeRoom/types';
import { AddNewEpisode } from './AddNewEpisode';
import './EscapeRoom.scss';

export type EscapeRoomResourceContextType = ReturnType<typeof useResourceFirebaseData<EscapeRoomEpisode>>;

export function EscapeRoomFilters({
  data,
  isDirty,
  save,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
}: EscapeRoomResourceContextType) {
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
            fileName="escape-room.json"
            disabled={isDirty}
            block
          />
        </Flex>
      </SiderContent>

      <SiderContent>
        <AddNewEpisode data={data} addEntryToUpdate={addEntryToUpdate} />
      </SiderContent>

      <SiderContent>{/* <DeckCounts data={data} /> */}?</SiderContent>
    </>
  );
}

function prepareFileForDownload(entriesToUpdate: Dictionary<EscapeRoomEpisode>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(entriesToUpdate);
  // // Remove any undefined values of any keys in each entry
  // Object.values(copy).forEach((entry) => {
  //   const exclusivity = entry.exclusivity as string;
  //   if (entry.exclusivity === undefined || exclusivity === 'none') {
  //     entry.exclusivity = undefined;
  //   }
  // });

  return sortJsonKeys(deepCleanObject(copy));
}
