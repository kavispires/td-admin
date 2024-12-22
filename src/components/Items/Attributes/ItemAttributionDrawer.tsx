import { Divider, Drawer, Flex, Space, Switch } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { useEffect, useMemo, useState } from 'react';
import { ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributionValueButtons } from './AttributionValueButtons';

export function ItemAttributionDrawer() {
  const { searchParams, removeQueryParam } = useItemQueryParams();
  const queryParamsItemId = searchParams.get('drawer');
  const [showOnlyUnset, setUnsetOnly] = useState(false);

  const { activeItem, attributesList, itemAttributeValues, onAttributeChange, jumpToItem } =
    useItemsAttributeValuesContext();

  const onClose = () => {
    removeQueryParam('drawer');
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: function
  useEffect(() => {
    if (queryParamsItemId) {
      jumpToItem('goTo', queryParamsItemId);
    }
  }, [queryParamsItemId, jumpToItem, removeQueryParam]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const filteredAttributesList = useMemo(
    () =>
      showOnlyUnset
        ? attributesList.filter((attribute) => !itemAttributeValues.attributes[attribute.id])
        : attributesList,
    [showOnlyUnset, activeItem.id],
  );

  return (
    <Drawer open={!!queryParamsItemId} title={`Edit: ${activeItem.name.en}`} onClose={onClose} width="640px">
      <Flex gap={6}>
        <Flex vertical gap={6}>
          <ItemSprite item={activeItem} width={50} />
          <ItemId item={activeItem} />
        </Flex>
        <Flex vertical gap={6}>
          <ItemName item={activeItem} language="en" />
          <ItemName item={activeItem} language="pt" />
        </Flex>
        <Flex vertical gap={6}>
          <Switch
            checked={showOnlyUnset}
            onChange={setUnsetOnly}
            checkedChildren="Unset"
            unCheckedChildren="All"
          />
        </Flex>
      </Flex>

      <Divider className="my-1" />

      <Space size="small" direction="vertical" className="my-4 attribute-button-container" wrap>
        {filteredAttributesList.map((attribute) => (
          <AttributionValueButtons
            size="small"
            key={attribute.id}
            attribute={attribute}
            value={itemAttributeValues.attributes[attribute.id]}
            onChange={onAttributeChange}
          />
        ))}
      </Space>
    </Drawer>
  );
}
