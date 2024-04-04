import { Button, Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { ItemAtributesValues } from 'types';
import { sortJsonKeys } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';

export function ItemAttributionFilters() {
  const { isDirty, save, itemsAttributeValues, attributesList, jumpToItem } =
    useItemsAttributeValuesContext();

  return (
    <SiderContent>
      <Flex vertical gap={6}>
        <Button block danger type="primary" disabled={!isDirty} onClick={save} size="large">
          Save
        </Button>
        <DownloadButton
          data={() => prepareFileForDownload(itemsAttributeValues, attributesList.length)}
          fileName="items-attribute-values.json"
          disabled={isDirty}
          block
        />
      </Flex>
      <Divider />

      <Button block onClick={() => jumpToItem('random')}>
        Random Item
      </Button>
    </SiderContent>
  );
}

function prepareFileForDownload(
  itemsAttributeValues: Dictionary<ItemAtributesValues>,
  totalAttributes: number
) {
  return sortJsonKeys(
    Object.values(itemsAttributeValues).reduce((acc: Dictionary<ItemAtributesValues>, item) => {
      // Assess item completion
      if (Object.keys(item.attributes).length === totalAttributes) {
        item.complete = true;
      } else {
        delete item.complete;
      }

      // Verify -4/-5 beef
      Object.keys(item.attributes).forEach((key) => {
        if (item.attributes[key] === -5 || item.attributes[key] === -4) {
          item.attributes[key] = ATTRIBUTE_VALUE.UNRELATED;
        }
      });

      acc[item.id] = item;

      return acc;
    }, {})
  );
}
