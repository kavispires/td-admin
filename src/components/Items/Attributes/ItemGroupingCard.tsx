import { Button, Card, Empty, Flex, Pagination, Popconfirm, Typography } from 'antd';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemGrouping } from 'hooks/useItemGrouping';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { isEmpty } from 'lodash';
import { useMedia } from 'react-use';

import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributionValueButtons } from './AttributionValueButtons';

const getStatSentence = (stats: Record<string, number>, scope: string | null) => {
  if (scope === 'unset' || !scope) {
    return `${100 - stats.percent}% done, ${stats.group} left`;
  }

  return `${stats.percent}%  - ${stats.group} items`;
};

export function ItemGroupingCard() {
  const { getItem, getItemAttributeValues } = useItemsAttributeValuesContext();
  const { attribute, pageIds, updateAttributeValue, updatePageItemsAsUnrelated, pagination, stats } =
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
          {attribute?.name.en} ({getStatSentence(stats, searchParams.get('scope'))}) -{' '}
          {attribute.description.en}
        </Typography.Text>
      }
      extra={paginationComponent}
      actions={[unrelateButton, <GoToTopButton key="go-to-top" />, paginationComponent].filter(Boolean)}
    >
      {pageIds.length === 0 && (
        <Empty
          description="No items found in this scope for this attribute."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
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
