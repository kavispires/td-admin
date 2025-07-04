import { Button, Card, Empty, Flex, Pagination, Popconfirm, Select, Space, Typography } from 'antd';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemGrouping } from 'hooks/useItemGrouping';
import { useQueryParams } from 'hooks/useQueryParams';
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
  const { queryParams, addParam } = useQueryParams();
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
        current={pagination.current}
        key="pagination"
        onChange={pagination.onChange}
        onShowSizeChange={pagination.onShowSizeChange}
        pageSize={pagination.pageSize}
        pageSizeOptions={pagination.pageSizeOptions}
        total={pagination.total}
      />
    </Flex>
  );

  const sortingComponent = (
    <Flex align="center">
      <Typography.Text className="mr-2">Sort by</Typography.Text>
      <Select onChange={(v) => sorting.setSortBy(v)} style={{ width: 120 }} value={sorting.sortBy}>
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

  const isUnsetSet = queryParams.get('scope') === 'unset' || !queryParams.get('scope');
  const unrelateButton = isUnsetSet && (
    <Popconfirm
      key="unrelate-button"
      onConfirm={updatePageItemsAsUnrelated}
      title={`Are you sure everything is unrelated to ${attribute.name.en}?`}
    >
      <Button className="mx-2" danger disabled={pageIds.length === 0} type="primary">
        Unrelate Unset Items on Page
      </Button>
    </Popconfirm>
  );
  return (
    <Card
      actions={[
        <Flex justify="space-between" key="options">
          {unrelateButton}
          <ItemGroupAttributeNavigationButtons key="navigation-buttons" />
        </Flex>,
        paginationComponent,
      ].filter(Boolean)}
      className="my-4"
      extra={
        <Flex align="center" className="mx-2" justify="space-around">
          {sortingComponent}

          {paginationComponent}
        </Flex>
      }
      title={
        <Typography.Text>
          {attribute?.name.en} ({getStatSentence(stats, queryParams.get('scope'))}) -{' '}
          {attribute.description.en}
        </Typography.Text>
      }
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
              <Flex gap={6} vertical>
                <ItemSprite item={item} width={75} />
                <ItemId item={item} />
                <Space.Compact>
                  <ItemGoTo item={item} />
                  <Button onClick={() => addParam('drawer', item.id)} shape="round" size="small">
                    Drawer
                  </Button>
                </Space.Compact>
                <ItemName item={item} language="en" />
                <ItemName item={item} language="pt" />
              </Flex>
              <AttributionValueButtons
                attribute={attribute}
                onChange={(attributeId: string, value: number) =>
                  updateAttributeValue(item.id, attributeId, value)
                }
                onlyButtons
                value={itemAttributes.attributes[attribute.id]}
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
  const { queryParams, addParam } = useQueryParams();
  const { attributesList } = useItemsAttributeValuesContext();
  const currentAttribute = queryParams.get('attribute');

  const onPreviousAttribute = () => {
    const currentIndex = attributesList.findIndex((a) => a.id === currentAttribute);
    const previousAttribute = attributesList[currentIndex - 1];
    if (previousAttribute) {
      addParam('attribute', previousAttribute.id);
    }
  };

  const onNextAttribute = () => {
    const currentIndex = attributesList.findIndex((a) => a.id === currentAttribute);
    const nextAttribute = attributesList[currentIndex + 1];
    if (nextAttribute) {
      addParam('attribute', nextAttribute.id);
    }
  };

  return (
    <Flex className="mx-8" gap={6} justify="space-between">
      <Button
        disabled={currentAttribute === attributesList[0]?.id}
        key="previous"
        onClick={onPreviousAttribute}
      >
        Previous Attribute
      </Button>

      <GoToTopButton key="go-to-top" />

      <Button
        disabled={currentAttribute === attributesList[attributesList.length - 1]?.id}
        key="next"
        onClick={onNextAttribute}
      >
        Next Attribute
      </Button>
    </Flex>
  );
}
