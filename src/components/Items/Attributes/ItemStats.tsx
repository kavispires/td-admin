import { SkinOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Flex, Progress, Rate, Space, Table, type TableProps, Tabs, Tag, Typography } from 'antd';
import type { TabsProps } from 'antd/lib';
import { DownloadButton } from 'components/Common/DownloadButton';
import { PopoverInfo } from 'components/Common/PopoverInfo';
import { AlienSign } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ItemAttribute, ItemAttributesValues } from 'types';
import { deepCleanObject, sortJsonKeys } from 'utils';

export function ItemStats() {
  const { attributes } = useItemsAttributeValuesContext();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All Attributes',
      children: <AttributesStatsTable type="all" />,
    },
    {
      key: '2',
      label: 'Default',
      children: <AttributesStatsTable type="default" />,
    },
    {
      key: '3',
      label: 'Custom',
      children: <AttributesStatsTable type="custom" />,
    },
    {
      key: '4',
      label: 'Limited',
      children: <AttributesStatsTable type="limited" />,
    },

    {
      key: '5',
      label: 'Specific',
      children: <AttributesStatsTable type="specific" />,
    },
    {
      key: '6',
      label: 'Opposite',
      children: <AttributesStatsTable type="opposite" />,
    },
  ];

  return (
    <div className="my-4">
      <Flex justify="space-between" align="center">
        <Typography.Title level={5}>Stats</Typography.Title>
        <DownloadButton data={() => prepareFileForDownload(attributes)} fileName="items-attributes.json">
          Download Attribute Json
        </DownloadButton>
      </Flex>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

const calculateAttributeStats = (attribute: ItemAttribute, itemsAttributes: ItemAttributesValues[]) => {
  let completionCount = 0;
  let tensCount = 0;
  let fivesCount = 0;
  let zerosCount = 0;
  let negativeOnesCount = 0;
  let negativeThreesCount = 0;
  let negativeTensCount = 0;
  let positiveCount = 0;

  itemsAttributes.forEach(({ attributes }) => {
    if (attributes[attribute.id]) {
      completionCount++;

      const value = attributes[attribute.id];
      if (value === 10) {
        tensCount++;
      } else if (value === 5) {
        fivesCount++;
      } else if (value === 0 || !value) {
        zerosCount++;
      } else if (value === -1) {
        negativeOnesCount++;
      } else if (value === -3) {
        negativeThreesCount++;
      } else if (value === -10) {
        negativeTensCount++;
      }

      if (value > 0) {
        positiveCount++;
      }
    }
  });

  const total = itemsAttributes.length;
  const completionPercentage = (completionCount / total) * 100;
  const tensPercentage = (tensCount / total) * 100;
  const fivesPercentage = (fivesCount / total) * 100;
  const zerosPercentage = (zerosCount / total) * 100;
  const negativeOnesPercentage = (negativeOnesCount / total) * 100;
  const negativeThreesPercentage = (negativeThreesCount / total) * 100;
  const negativeTensPercentage = (negativeTensCount / total) * 100;
  const positivePercentage = (positiveCount / total) * 100;

  return {
    completionPercentage: completionPercentage.toFixed(1),
    tensPercentage: tensPercentage.toFixed(1),
    fivesPercentage: fivesPercentage.toFixed(1),
    zerosPercentage: zerosPercentage.toFixed(1),
    negativeOnesPercentage: negativeOnesPercentage.toFixed(1),
    negativeThreesPercentage: negativeThreesPercentage.toFixed(1),
    negativeTensPercentage: negativeTensPercentage.toFixed(1),
    positivePercentage: positivePercentage.toFixed(1),
  };
};

type AttributesStatsTableProps = {
  type: 'all' | 'default' | 'custom' | 'limited' | 'specific' | 'opposite';
};

function AttributesStatsTable({ type }: AttributesStatsTableProps) {
  const { availableItemIds, getItemAttributeValues, attributesList } = useItemsAttributeValuesContext();
  const navigate = useNavigate();
  const { is } = useQueryParams();

  const unusedSpriteIds = useMemo(() => {
    const allSprites = new Array(65).fill(0).map((_, index) => index);
    const usedSprites = attributesList.map((attribute) => attribute.spriteId);
    return allSprites.filter((id) => !usedSprites.includes(`sign-${id}`));
  }, [attributesList]);

  const attributesPool = useMemo(() => {
    if (type === 'default') {
      return attributesList.filter((attribute) => attribute.default);
    }

    if (type === 'custom') {
      return attributesList.filter((attribute) => !attribute.default);
    }

    if (type === 'limited') {
      return attributesList.filter((attribute) => attribute.limited);
    }

    if (type === 'specific') {
      return attributesList.filter((attribute) => attribute.specific);
    }

    if (type === 'opposite') {
      return attributesList.filter((attribute) => attribute.oppositeId);
    }

    return attributesList;
  }, [attributesList, type]);

  const rows = useMemo(() => {
    const itemsAttributes = availableItemIds.map((id) => getItemAttributeValues(id));

    return attributesPool.map((attribute) => {
      return {
        ...attribute,
        ...calculateAttributeStats(attribute, itemsAttributes),
      };
    });
  }, [attributesPool, availableItemIds, getItemAttributeValues]);

  const columns: TableProps['columns'] = [
    {
      title: 'Attribute',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Flex align="center" gap={8}>
          {is('showGlyphs') && <AlienSign id={record.spriteId} width={30} />}
          {name.en}
          {record.default && <Tag className="ml-1">default</Tag>}
          {record.limited && <Tag className="ml-1">limited</Tag>}
          {(record.specific || record.parentId) && <Tag className="ml-1">specific</Tag>}
          {record.oppositeId && (
            <Tag className="ml-1">
              <SwapOutlined />
            </Tag>
          )}
          <PopoverInfo title={record.description.en} />
        </Flex>
      ),
      sorter: (a, b) => a.name.en.localeCompare(b.name.en),
    },
    {
      title: <SkinOutlined />,
      dataIndex: 'spriteId',
      key: 'spriteId',
      render: (spriteId) => <AlienSign id={spriteId} width={18} padding={0} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority,
    },

    {
      title: 'Positive',
      dataIndex: 'positivePercentage',
      key: 'positivePercentage',
      render: (positivePercentage: string) => `${positivePercentage}%`,
      sorter: (a, b) => Number.parseFloat(a.positivePercentage) - Number.parseFloat(b.positivePercentage),
    },
    {
      title: '10',
      dataIndex: 'tensPercentage',
      key: 'tensPercentage',
      render: (tensPercentage: string, record) => {
        if (record.limited) {
          return '-';
        }

        return `${tensPercentage}%`;
      },
      sorter: (a, b) => Number.parseFloat(a.tensPercentage) - Number.parseFloat(b.tensPercentage),
    },
    {
      title: '5',
      dataIndex: 'fivesPercentage',
      key: 'fivesPercentage',
      render: (fivesPercentage: string) => `${fivesPercentage}%`,
      sorter: (a, b) => Number.parseFloat(a.fivesPercentage) - Number.parseFloat(b.fivesPercentage),
    },
    {
      title: '-1',
      dataIndex: 'negativeOnesPercentage',
      key: 'negativeOnesPercentage',
      render: (negativeOnesPercentage: string) => `${negativeOnesPercentage}%`,
      sorter: (a, b) =>
        Number.parseFloat(a.negativeOnesPercentage) - Number.parseFloat(b.negativeOnesPercentage),
    },
    {
      title: '-3',
      dataIndex: 'negativeThreesPercentage',
      key: 'negativeThreesPercentage',
      render: (negativeThreesPercentage: string) => `${negativeThreesPercentage}%`,
      sorter: (a, b) =>
        Number.parseFloat(a.negativeThreesPercentage) - Number.parseFloat(b.negativeThreesPercentage),
    },
    {
      title: '-10',
      dataIndex: 'negativeTensPercentage',
      key: 'negativeTensPercentage',
      render: (negativeTensPercentage: string) => `${negativeTensPercentage}%`,
      sorter: (a, b) =>
        Number.parseFloat(a.negativeTensPercentage) - Number.parseFloat(b.negativeTensPercentage),
    },
    {
      title: 'Completion',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      render: (completionPercentage: string) => (
        <Progress percent={Number.parseFloat(completionPercentage)} size="small" />
      ),
      sorter: (a, b) => Number.parseFloat(a.completionPercentage) - Number.parseFloat(b.completionPercentage),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Rate count={4} value={level} disabled />,
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Space.Compact>
            <Button
              size="small"
              shape="round"
              onClick={() => navigate(`/items/attribution?display=grouping&attribute=${record.id}&page=1`)}
            >
              Grouping
            </Button>
            <Button
              size="small"
              shape="round"
              onClick={() => navigate(`/items/attribution?display=sampler&attribute=${record.id}&size=6`)}
            >
              Sample
            </Button>
          </Space.Compact>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Typography.Paragraph>Total: {rows.length}</Typography.Paragraph>

      <Table columns={columns} dataSource={rows} pagination={false} rowKey="id" size="small" />

      <Flex wrap="wrap" gap={8}>
        {unusedSpriteIds.map((id) => (
          <div key={id}>
            #{id}
            <AlienSign key={id} id={`sign-${id}`} />
          </div>
        ))}
      </Flex>
    </>
  );
}

function prepareFileForDownload(attributes: Dictionary<ItemAttribute>) {
  const copy = cloneDeep(attributes);

  // Object.values(copy).forEach((attribute) => {

  // });

  return sortJsonKeys(deepCleanObject(copy), [
    'description',
    'priority',
    'level',
    'spriteId',
    'oppositeId',
    'relatedId',
    'default',
    'limited',
    'specific',
    'keywords',
  ]);
}
