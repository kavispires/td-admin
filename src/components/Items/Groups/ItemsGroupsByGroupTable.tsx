import {
  Button,
  Checkbox,
  Drawer,
  Flex,
  Popconfirm,
  Table,
  type TableProps,
  Tooltip,
  Typography,
} from 'antd';
import { TransparentButton } from 'components/Common';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { IdTag } from 'components/Common/IdTag';
import { VirtualizationWrapper } from 'components/Common/VirtualizationWrapper';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { useTDResource } from 'hooks/useTDResource';
import { useRef, useState } from 'react';
import type { ItemGroup, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { CopyIdsButton } from '../CopyIdsButton';
import { AddItemFlow } from './AddItemFlow';
import { ItemGroupsCard } from './ItemGroupsCard';

type ItemsGroupsTablesProps = {
  rows: ItemGroup[];
  items: Dictionary<ItemT>;
  grousByItem: Record<string, string[]>;
  groupsTypeahead: { value: string; label: string }[];
  onUpdateItemGroups: (itemId: string, groupIds: string[]) => void;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
  onUpdateName: (name: string, language: 'en' | 'pt', groupId: string) => void;
};

export function ItemsGroupsByGroupTable({
  rows,
  items,
  grousByItem,
  groupsTypeahead,
  onUpdateItemGroups,
  onUpdateGroupItems,
  onUpdateName,
}: ItemsGroupsTablesProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const [selectedItemId, setSelectedItemId] = useState<null | string>(null);
  // Track selected items per group for batch operations
  const [selectedItemsByGroup, setSelectedItemsByGroup] = useState<Dictionary<string[]>>({});
  // Track drag selection state
  const [dragState, setDragState] = useState<{
    groupId: string | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
    hasMoved: boolean;
  }>({ groupId: null, startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false, hasMoved: false });
  const itemRefsMap = useRef<Dictionary<Dictionary<HTMLElement | null>>>({});

  const paginationProps = useTablePagination({
    showQuickJumper: true,
    total: rows.length,
  });

  const columns: TableProps<ItemGroup>['columns'] = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <div>
          <IdTag>{id}</IdTag>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: DualLanguageValue, record) => (
        <Flex gap={4} vertical>
          <DualLanguageTextField
            language="en"
            onChange={(e) => onUpdateName(e.target.value, 'en', record.id)}
            style={{ minWidth: 150 }}
            value={name}
          />
          <DualLanguageTextField
            language="pt"
            onChange={(e) => onUpdateName(e.target.value, 'pt', record.id)}
            style={{ minWidth: 150 }}
            value={name}
          />
        </Flex>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => {
        const groupId = record.id;
        const selectedItems = selectedItemsByGroup[groupId] || [];
        const hasSelections = selectedItems.length > 0;

        const handleCheckboxChange = (itemId: string, checked: boolean) => {
          setSelectedItemsByGroup((prev) => {
            const current = prev[groupId] || [];
            if (checked) {
              return { ...prev, [groupId]: [...current, itemId] };
            }
            return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
          });
        };

        const handleBatchRemove = () => {
          const updatedItemsIds = itemsIds.filter((id) => !selectedItems.includes(id));
          onUpdateGroupItems(groupId, updatedItemsIds);
          // Clear selections after removal
          setSelectedItemsByGroup((prev) => ({ ...prev, [groupId]: [] }));
        };

        return (
          <Flex gap={6} vertical>
            {hasSelections && (
              <Flex align="center" gap={8}>
                <Typography.Text>
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </Typography.Text>
                <Popconfirm
                  cancelText="No"
                  okText="Yes"
                  onConfirm={handleBatchRemove}
                  title={`Remove ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} from this group?`}
                >
                  <Button danger size="small" type="primary">
                    Batch Remove
                  </Button>
                </Popconfirm>
                <Button
                  onClick={() => setSelectedItemsByGroup((prev) => ({ ...prev, [groupId]: [] }))}
                  size="small"
                >
                  Clear Selection
                </Button>
              </Flex>
            )}
            <Flex
              gap={6}
              key={`items-${record.id}`}
              onMouseDown={(e) => {
                // Only start drag on left click and not on checkbox
                const target = e.target as HTMLElement;
                const isCheckbox =
                  target.closest('.ant-checkbox') || target.closest('input[type="checkbox"]');

                if (e.button === 0 && !isCheckbox) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDragState({
                    groupId,
                    startX: e.clientX - rect.left,
                    startY: e.clientY - rect.top,
                    currentX: e.clientX - rect.left,
                    currentY: e.clientY - rect.top,
                    isDragging: true,
                    hasMoved: false,
                  });
                }
              }}
              onMouseLeave={() => {
                if (dragState.isDragging) {
                  setDragState({
                    groupId: null,
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    isDragging: false,
                    hasMoved: false,
                  });
                }
              }}
              onMouseMove={(e) => {
                if (dragState.isDragging && dragState.groupId === groupId) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const currentX = e.clientX - rect.left;
                  const currentY = e.clientY - rect.top;

                  // Check if mouse actually moved (threshold of 5 pixels)
                  const distance = Math.sqrt(
                    (currentX - dragState.startX) ** 2 + (currentY - dragState.startY) ** 2,
                  );
                  const hasMoved = distance > 5;

                  setDragState((prev) => ({ ...prev, currentX, currentY, hasMoved }));

                  // Only update selection if mouse has actually moved
                  if (hasMoved) {
                    // Calculate which items are in selection
                    const selectionRect = {
                      left: Math.min(dragState.startX, currentX),
                      top: Math.min(dragState.startY, currentY),
                      right: Math.max(dragState.startX, currentX),
                      bottom: Math.max(dragState.startY, currentY),
                    };

                    const containerRect = e.currentTarget.getBoundingClientRect();
                    const newSelection: string[] = [];

                    itemsIds.forEach((itemId) => {
                      const itemRef = itemRefsMap.current[groupId]?.[itemId];
                      if (itemRef) {
                        const itemRect = itemRef.getBoundingClientRect();
                        const relativeRect = {
                          left: itemRect.left - containerRect.left,
                          top: itemRect.top - containerRect.top,
                          right: itemRect.right - containerRect.left,
                          bottom: itemRect.bottom - containerRect.top,
                        };

                        // Check if rectangles overlap
                        if (
                          relativeRect.left < selectionRect.right &&
                          relativeRect.right > selectionRect.left &&
                          relativeRect.top < selectionRect.bottom &&
                          relativeRect.bottom > selectionRect.top
                        ) {
                          newSelection.push(itemId);
                        }
                      }
                    });

                    setSelectedItemsByGroup((prev) => ({ ...prev, [groupId]: newSelection }));
                  }
                }
              }}
              onMouseUp={() => {
                if (dragState.isDragging) {
                  setDragState({
                    groupId: null,
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    isDragging: false,
                    hasMoved: false,
                  });
                }
              }}
              style={{ position: 'relative', userSelect: 'none' }}
              wrap="wrap"
            >
              {dragState.isDragging && dragState.hasMoved && dragState.groupId === groupId && (
                <div
                  style={{
                    position: 'absolute',
                    left: Math.min(dragState.startX, dragState.currentX),
                    top: Math.min(dragState.startY, dragState.currentY),
                    width: Math.abs(dragState.currentX - dragState.startX),
                    height: Math.abs(dragState.currentY - dragState.startY),
                    border: '2px dashed #1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                  }}
                />
              )}
              {itemsIds.map((itemId) => (
                <Flex
                  className="item-container"
                  gap={2}
                  key={`${record.id}-${itemId}`}
                  ref={(el) => {
                    if (!itemRefsMap.current[groupId]) {
                      itemRefsMap.current[groupId] = {};
                    }
                    itemRefsMap.current[groupId][itemId] = el;
                  }}
                  vertical
                >
                  <Flex align="center" gap={4}>
                    <Checkbox
                      checked={selectedItems.includes(itemId)}
                      onChange={(e) => handleCheckboxChange(itemId, e.target.checked)}
                    />
                    <TransparentButton
                      onClick={() => {
                        // Don't open drawer if we just finished dragging or have selections
                        if (!hasSelections && !dragState.hasMoved) {
                          setSelectedItemId(itemId);
                        }
                      }}
                    >
                      <VirtualizationWrapper width={60}>
                        <Tooltip
                          arrow
                          title={
                            items[itemId] ? `${items[itemId].name.en} | ${items[itemId].name.pt}` : itemId
                          }
                        >
                          <Item itemId={itemId} width={60} />
                        </Tooltip>
                      </VirtualizationWrapper>
                    </TransparentButton>
                  </Flex>
                  <Flex justify="center">
                    <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
        );
      },
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
    {
      title: 'Actions',
      dataIndex: 'itemsIds',
      key: 'actions',
      render: (itemsIds: string[]) => <CopyIdsButton ids={itemsIds} />,
    },
  ];

  const selectedItem = selectedItemId ? items[selectedItemId] : null;

  const expandableProps = useTableExpandableRows<ItemGroup>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <AddItemFlow group={record} onUpdateGroupItems={onUpdateGroupItems} />,
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <>
      <Table
        className="my-4"
        columns={columns}
        dataSource={rows}
        expandable={expandableProps}
        pagination={paginationProps}
        rowKey="id"
      />
      <Drawer onClose={() => setSelectedItemId(null)} open={!!selectedItem} title="Edit Item Group">
        {selectedItem && (
          <ItemGroupsCard
            groupsTypeahead={groupsTypeahead}
            item={selectedItem}
            itemGroups={grousByItem[selectedItem.id]}
            onUpdateItemGroups={onUpdateItemGroups}
          />
        )}
      </Drawer>
    </>
  );
}
