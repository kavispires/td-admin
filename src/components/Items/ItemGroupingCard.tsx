import { Button, Card, Flex, Input, Pagination, Popconfirm, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';

import { IdcardOutlined } from '@ant-design/icons';

import { isEmpty } from 'lodash';
import { AttributionValueButtons } from './AttributionValueButtons';
import { useItemGrouping } from 'hooks/useItemGrouping';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { GoToTopButton } from 'components/Common/GoToTopButton';
import { useMedia } from 'react-use';

export function ItemGroupingCard() {
  const { items, itemsAttributeValues } = useItemsAttributeValuesContext();
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
      title={`Are you sure everything is unrelated to ${attribute.name.pt}?`}
      onConfirm={updatePageItemsAsUnrelated}
    >
      <Button type="primary" danger disabled={pageIds.length === 0}>
        Unrelate Entire Page
      </Button>
    </Popconfirm>
  );
  return (
    <Card
      className="my-4"
      title={
        <Typography.Text>
          {attribute?.name.en} ({group.length})
        </Typography.Text>
      }
      extra={paginationComponent}
      actions={[unrelateButton, <GoToTopButton key="go-to-top" />, paginationComponent].filter(Boolean)}
    >
      {pageIds.map((itemId) => {
        const itemAttributes = itemsAttributeValues[itemId] ?? { id: itemId, attributes: {} };
        const item = items[itemId];

        return (
          <Card.Grid key={itemId} style={{ width: isNarrow ? '50%' : '25%' }}>
            <Flex gap={6}>
              <Flex vertical gap={6}>
                <Item id={item.id} width={75} title={`${item.name.en} | ${item.name.pt}`} />
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="Id"
                  variant="borderless"
                  size="small"
                  value={item.id}
                  readOnly
                />
                <Input
                  prefix={<LanguageFlag language="en" width="1em" />}
                  placeholder="Name in EN"
                  variant="borderless"
                  size="small"
                  value={item.name.en}
                  readOnly
                />
                <Input
                  prefix={<LanguageFlag language="pt" width="1em" />}
                  placeholder="Name in PT"
                  variant="borderless"
                  size="small"
                  value={item.name.pt}
                  readOnly
                />
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
