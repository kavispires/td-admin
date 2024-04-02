import { Button, Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';

export function ItemAttributionFilters() {
  const { isDirty, save, items, jumpToItem } = useItemsAttributeValuesContext();

  return (
    <SiderContent>
      <Flex vertical gap={6}>
        <Button block danger type="primary" disabled={!isDirty} onClick={save} size="large">
          Save
        </Button>
        <DownloadButton data={items} fileName="itemsAttributeValues.json" disabled={isDirty} block />
      </Flex>
      <Divider />

      <Button block onClick={() => jumpToItem('random')}>
        Random Item
      </Button>
    </SiderContent>
  );
}
