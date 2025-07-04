import { Button, Divider, Flex, Typography } from 'antd';
import { FilterNumber, FilterSelect, FilterSwitch } from 'components/Common';
import { Stat } from 'components/Common/Stat';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useQueryParams } from 'hooks/useQueryParams';
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
        <Typography.Text className="mb-2" strong>
          Items Stats
        </Typography.Text>
        <Stat label="Total">{total}</Stat>
        <Stat label="Complete">
          {complete} ({completionPercentage}%)
        </Stat>
        <Stat label="Initiated">
          {hasDataCount} ({initiatedPercentage}%)
        </Stat>
        <Typography.Text className="mt-4 mb-2" strong>
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
  const { addParam, is } = useQueryParams();

  return (
    <>
      <Button block onClick={() => jumpToItem('random')} type="primary">
        Random Item
      </Button>
      <FilterSwitch
        className="mt-4"
        label="Unset Only"
        onChange={(value) => addParam('scope', value ? 'unset' : '')}
        value={is('scope', 'unset')}
      />
    </>
  );
}

export function ItemAttributionSamplerFilters() {
  const { queryParams, addParam } = useQueryParams();
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
        onChange={(v) => addParam('attribute', v)}
        options={options}
        value={queryParams.get('attribute') || 'random'}
      />
      <FilterNumber
        label="Sample Size"
        max={21}
        min={3}
        onChange={(v) => addParam('size', String(v))}
        step={3}
        value={Number(queryParams.get('size') || 9)}
      />
    </>
  );
}

export function ItemAttributionGroupingFilters() {
  const { queryParams, addParam } = useQueryParams();
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
        onChange={(v) => addParam('attribute', v)}
        options={options}
        value={queryParams.get('attribute') || 'ali'}
      />

      <FilterSelect
        label="Scope"
        onChange={(v) => addParam('scope', v)}
        options={[{ value: 'unset', label: 'Unset' }, ...ATTRIBUTE_GROUP_VALUES]}
        value={queryParams.get('scope') || 'unset'}
      />

      <FilterSelect
        label="Results per page"
        onChange={(v) => addParam('pageSize', v)}
        options={[12, 24, 48, 96]}
        value={queryParams.get('pageSize') || 12}
      />
    </>
  );
}

export function ItemAttributionComparatorFilters() {
  const { addParam, is } = useQueryParams();
  return (
    <>
      <FilterSwitch
        className="full-width m-0"
        label="Only Complete"
        onChange={(v) => addParam('showComplete', v ? 'true' : '')}
        value={is('showComplete')}
      />
      <FilterSwitch
        className="full-width m-0"
        label="Show Unrelated"
        onChange={(v) => addParam('showUnrelated', v ? 'true' : '')}
        value={is('showUnrelated')}
      />
      <FilterSwitch
        className="full-width m-0"
        label="Show Unclear"
        onChange={(v) => addParam('showUnclear', v ? 'true' : '')}
        value={is('showUnclear')}
      />
    </>
  );
}

export function ItemAttributionStatsFilters() {
  const { addParam, is } = useQueryParams();
  return (
    <FilterSwitch
      className="full-width m-0"
      label="Show Glyphs"
      onChange={(v) => addParam('showGlyphs', v ? 'true' : '')}
      value={is('showGlyphs')}
    />
  );
}
