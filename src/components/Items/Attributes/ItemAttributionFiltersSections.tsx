import { Button, Divider, Flex, Typography } from 'antd';
import { FilterNumber, FilterSelect, FilterSwitch } from 'components/Common';
import { Stat } from 'components/Common/Stat';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { ATTRIBUTE_GROUP_VALUES } from 'utils/constants';

export function ItemAttributionStats() {
  const { getItemAttributeValues, availableItemIds, attributesList } = useItemsAttributeValuesContext();

  const {
    total,
    complete,
    completionPercentage,
    hasDataCount,
    initiatedPercentage,
    progress,
    progressTotal,
    currentProgress,
  } = useMemo(() => {
    const total = availableItemIds.length;
    let someData = 0;
    let complete = 0;
    let currentProgress = 0;
    const itemsAttributes = availableItemIds.map((id) => getItemAttributeValues(id));
    itemsAttributes.forEach(({ attributes }) => {
      if (!isEmpty(attributes)) {
        someData += 1;
      }
      if (Object.values(attributes).length === attributesList.length) {
        complete += 1;
      }

      currentProgress += Object.values(attributes).length;
    });

    const progressTotal = Object.values(attributesList).length * availableItemIds.length;

    return {
      total,
      complete,
      completionPercentage: total > 0 ? ((complete / total) * 100).toFixed(1) : 0,
      hasDataCount: someData,
      initiatedPercentage: total > 0 ? Math.floor((someData / total) * 100) : 0,
      progress: ((currentProgress / progressTotal) * 100).toFixed(1),
      currentProgress,
      progressTotal,
    };
  }, [attributesList, availableItemIds, getItemAttributeValues]);

  return (
    <>
      <Flex vertical>
        <Typography.Text strong className="mb-2">
          Items Stats
        </Typography.Text>
        <Stat label="Total">{total}</Stat>
        <Stat label="Complete">
          {complete} ({completionPercentage}%)
        </Stat>
        <Stat label="Initiated">
          {hasDataCount} ({initiatedPercentage}%)
        </Stat>
        <Typography.Text strong className="mt-4 mb-2">
          Attributes Stats
        </Typography.Text>
        <Stat label="Total">{progressTotal}</Stat>
        <Stat label="Set">{currentProgress}</Stat>
        <Stat label="Progress">{progress}%</Stat>
      </Flex>
      <Divider />
    </>
  );
}

export function ItemAttributionClassifierFilters() {
  const { jumpToItem } = useItemsAttributeValuesContext();
  const { searchParams, addQueryParam } = useItemQueryParams();

  return (
    <>
      <Button block onClick={() => jumpToItem('random')} type="primary">
        Random Item
      </Button>
      <FilterSwitch
        label="Unset Only"
        value={searchParams.get('scope') === 'unset'}
        onChange={(value) => addQueryParam('scope', value ? 'unset' : '')}
        className="mt-4"
      />
    </>
  );
}

export function ItemAttributionSamplerFilters() {
  const { searchParams, addQueryParam } = useItemQueryParams();
  const { attributesList } = useItemsAttributeValuesContext();

  const options = useMemo(() => {
    return [
      { label: 'Random Attribute', value: 'random' },
      ...attributesList.map(({ id, name }) => ({ label: name.en, value: id })),
    ];
  }, [attributesList]);

  return (
    <>
      <FilterSelect
        label="Sampler Attribute"
        value={searchParams.get('attribute') || 'random'}
        onChange={(v) => addQueryParam('attribute', v)}
        options={options}
      />
      <FilterNumber
        label="Sample Size"
        value={Number(searchParams.get('size') || 9)}
        onChange={(v) => addQueryParam('size', String(v))}
        min={3}
        max={21}
        step={3}
      />
    </>
  );
}

export function ItemAttributionGroupingFilters() {
  const { searchParams, addQueryParam } = useItemQueryParams();
  const { attributesList } = useItemsAttributeValuesContext();

  const options = useMemo(() => {
    return attributesList.map(({ id, name, ...rest }) => ({
      label: `${name.en}${rest.default ? '*' : ''}`,
      value: id,
    }));
  }, [attributesList]);

  return (
    <>
      <FilterSelect
        label="Attribute"
        value={searchParams.get('attribute') || 'ali'}
        onChange={(v) => addQueryParam('attribute', v)}
        options={options}
      />

      <FilterSelect
        label="Scope"
        value={searchParams.get('scope') || 'unset'}
        onChange={(v) => addQueryParam('scope', v)}
        options={[{ value: 'unset', label: 'Unset' }, ...ATTRIBUTE_GROUP_VALUES]}
      />

      <FilterSelect
        label="Results per page"
        value={searchParams.get('pageSize') || 12}
        onChange={(v) => addQueryParam('pageSize', v)}
        options={[12, 24, 48, 96]}
      />
    </>
  );
}

export function ItemAttributionComparatorFilters() {
  const { searchParams, addQueryParam } = useItemQueryParams();
  return (
    <>
      <FilterSwitch
        label="Only Complete"
        value={searchParams.get('showComplete') === 'true'}
        onChange={(v) => addQueryParam('showComplete', v ? 'true' : '')}
        className="full-width m-0"
      />
      <FilterSwitch
        label="Show Unrelated"
        value={searchParams.get('showUnrelated') === 'true'}
        onChange={(v) => addQueryParam('showUnrelated', v ? 'true' : '')}
        className="full-width m-0"
      />
      <FilterSwitch
        label="Show Unclear"
        value={searchParams.get('showUnclear') === 'true'}
        onChange={(v) => addQueryParam('showUnclear', v ? 'true' : '')}
        className="full-width m-0"
      />
    </>
  );
}

export function ItemAttributionStatsFilters() {
  const { searchParams, addQueryParam } = useItemQueryParams();
  return (
    <>
      <FilterSwitch
        label="Show Glyphs"
        value={searchParams.get('showGlyphs') === 'true'}
        onChange={(v) => addQueryParam('showGlyphs', v ? 'true' : '')}
        className="full-width m-0"
      />
    </>
  );
}
