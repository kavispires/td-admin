import { Button, Card, Empty, Flex, Pagination, Popconfirm, Select, Space, Typography } from 'antd';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemGrouping } from 'hooks/useItemGrouping';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { isEmpty } from 'lodash';
import { useMedia } from 'react-use';

import { ItemGoTo, ItemId, ItemName, ItemSprite } from '../ItemBuildingBlocks';
import { AttributionValueButtons } from './AttributionValueButtons';
import { ItemAttributionDrawer } from './ItemAttributionDrawer';

const getStatSentence = (stats: Record<string, number>, scope: string | null) => {
  if (scope === 'unset' || !scope) {
    return `${100 - stats.percent}% done, ${stats.group} left`;
  }

  return `${stats.percent}%  - ${stats.group} items`;
};

export function ItemGroupingCard() {
  const { getItem, getItemAttributeValues, attributesList } = useItemsAttributeValuesContext();

  const { attribute, pageIds, updateAttributeValue, updatePageItemsAsUnrelated, pagination, stats, sorting } =
    useItemGrouping();
  const { searchParams, addQueryParam } = useItemQueryParams();
  const isNarrow = useMedia('(max-width: 1024px)');

  if (isEmpty(attribute)) {
    return (
      <Card className="my-4">
        <Typography.Text type="secondary">No group attribute has been selected.</Typography.Text>
      </Card>
    );
  }

  const paginationComponent = (
    <Flex justify="center">
      <Pagination
        key="pagination"
        onChange={pagination.onChange}
        current={pagination.current}
        total={pagination.total}
        pageSizeOptions={pagination.pageSizeOptions}
        pageSize={pagination.pageSize}
        onShowSizeChange={pagination.onShowSizeChange}
      />
    </Flex>
  );

  const sortingComponent = (
    <Flex align="center">
      <Typography.Text className="mr-2">Sort by</Typography.Text>
      <Select style={{ width: 120 }} value={sorting.sortBy} onChange={(v) => sorting.setSortBy(v)}>
        <Select.Option value={null}>Last Updated</Select.Option>
        <Select.Option value="prop::id">Id</Select.Option>
        {attributesList.map((a) => (
          <Select.Option key={a.id} value={`attribute::${a.id}`}>
            {a.name.en}
          </Select.Option>
        ))}
      </Select>
    </Flex>
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
      extra={
        <Flex align="center">
          {sortingComponent}

          {paginationComponent}
        </Flex>
      }
      actions={[
        unrelateButton,
        <ItemGroupAttributeNavigationButtons key="navigation-buttons" />,
        paginationComponent,
      ].filter(Boolean)}
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
                <Space.Compact>
                  <ItemGoTo item={item} />
                  <Button size="small" shape="round" onClick={() => addQueryParam('drawer', item.id)}>
                    Drawer
                  </Button>
                </Space.Compact>
                <ItemName item={item} language="en" />
                <ItemName item={item} language="pt" />
              </Flex>
              <AttributionValueButtons
                attribute={attribute}
                value={itemAttributes.attributes[attribute.id]}
                onlyButtons
                onChange={(attributeId: string, value: number) =>
                  updateAttributeValue(item.id, attributeId, value)
                }
              />
            </Flex>
          </Card.Grid>
        );
      })}
      <ItemAttributionDrawer />
    </Card>
  );
}

function ItemGroupAttributeNavigationButtons() {
  const { searchParams, addQueryParam } = useItemQueryParams();
  const { attributesList } = useItemsAttributeValuesContext();
  const currentAttribute = searchParams.get('attribute');

  const onPreviousAttribute = () => {
    const currentIndex = attributesList.findIndex((a) => a.id === currentAttribute);
    const previousAttribute = attributesList[currentIndex - 1];
    if (previousAttribute) {
      addQueryParam('attribute', previousAttribute.id);
    }
  };

  const onNextAttribute = () => {
    const currentIndex = attributesList.findIndex((a) => a.id === currentAttribute);
    const nextAttribute = attributesList[currentIndex + 1];
    if (nextAttribute) {
      addQueryParam('attribute', nextAttribute.id);
    }
  };

  return (
    <Flex gap={6} justify="space-between" className="mx-8">
      <Button
        key="previous"
        onClick={onPreviousAttribute}
        disabled={currentAttribute === attributesList[0]?.id}
      >
        Previous Attribute
      </Button>

      <GoToTopButton key="go-to-top" />

      <Button
        key="next"
        onClick={onNextAttribute}
        disabled={currentAttribute === attributesList[attributesList.length - 1]?.id}
      >
        Next Attribute
      </Button>
    </Flex>
  );
}
