import { Button, Card, Flex, Pagination, Popconfirm, Typography } from 'antd';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemGrouping } from 'hooks/useItemGrouping';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { isEmpty } from 'lodash';
import { useMedia } from 'react-use';

import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributionValueButtons } from './AttributionValueButtons';

export function ItemGroupingCard() {
  const { getItem, getItemAttributeValues } = useItemsAttributeValuesContext();
  const { attribute, pageIds, group, updateAttributeValue, updatePageItemsAsUnrelated, pagination } =
    useItemGrouping();
  const { searchParams } = useItemQueryParams();
  const isNarrow = useMedia('(max-width: 1024px)');

  if (isEmpty(attribute)) {
    return (
      <Card className="my-4">
        <Typography.Text type="secondary">No group attribute has been selected.</Typography.Text>
      </Card>
    );
  }

  const paginationComponent = (
    <Pagination
      key="pagination"
      onChange={pagination.onChange}
      current={pagination.current}
      total={pagination.total}
      pageSizeOptions={pagination.pageSizeOptions}
      pageSize={pagination.pageSize}
      onShowSizeChange={pagination.onShowSizeChange}
    />
  );

  const isUnsetSet = searchParams.get('scope') === 'unset' || !searchParams.get('scope');
  const unrelateButton = isUnsetSet && (
    <Popconfirm
      key="unrelate-button"
      title={`Are you sure everything is unrelated to ${attribute.name.en}?`}
      onConfirm={updatePageItemsAsUnrelated}
    >
      <Button type="primary" danger disabled={pageIds.length === 0}>
        Unrelate Unset Items on Page
      </Button>
    </Popconfirm>
  );
  return (
    <Card
      className="my-4"
      title={
        <Typography.Text>
          {attribute?.name.en} ({group.length}) - {attribute.description.en}
        </Typography.Text>
      }
      extra={paginationComponent}
      actions={[unrelateButton, <GoToTopButton key="go-to-top" />, paginationComponent].filter(Boolean)}
    >
      {pageIds.map((itemId) => {
        const itemAttributes = getItemAttributeValues(itemId);
        const item = getItem(itemId);

        return (
          <Card.Grid
            key={`${itemId}-${itemAttributes.updatedAt}`}
            style={{ width: isNarrow ? '50%' : '25%' }}
          >
            <Flex gap={6}>
              <Flex vertical gap={6}>
                <ItemSprite item={item} width={75} />
                <ItemId item={item} />
                <ItemGoTo item={item} />
                <ItemName item={item} language="en" />
                <ItemName item={item} language="pt" />
              </Flex>
              <AttributionValueButtons
                attribute={attribute!}
                value={itemAttributes.attributes[attribute!.id]}
                onlyButtons
                onChange={(attributeId: string, value: number) =>
                  updateAttributeValue(item.id, attributeId, value)
                }
              />
            </Flex>
          </Card.Grid>
        );
      })}
    </Card>
  );
}
