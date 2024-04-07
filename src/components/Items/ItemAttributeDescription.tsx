import { Flex } from 'antd';
import clsx from 'clsx';
import { FilterSwitch } from 'components/Common';
import { AlienSign } from 'components/Sprites';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { useMemo } from 'react';
import { ItemAtributesValues, ItemAttribute } from 'types';
import { getItemAttributePriorityResponse, parseAttribute } from 'utils';
import { ATTRIBUTE_VALUE_PREFIX } from 'utils/constants';

type ItemAttributeDescriptionProps = {
  itemAttributeValues: ItemAtributesValues;
  attributes: Dictionary<ItemAttribute>;
};

export function ItemAttributeDescription({ itemAttributeValues, attributes }: ItemAttributeDescriptionProps) {
  const response = useMemo(
    () => getItemAttributePriorityResponse(itemAttributeValues, attributes),
    [itemAttributeValues, attributes]
  );
  const { searchParams, addQueryParam } = useItemQueryParams();

  const Component = searchParams.get('signs') === 'true' ? AttributeSprite : AttributeText;

  const filteredResponse = response.filter((keyVariant) => {
    if (searchParams.get('showUnclear') !== 'true' && keyVariant.includes(ATTRIBUTE_VALUE_PREFIX.UNCLEAR)) {
      return false;
    }

    if (
      searchParams.get('showUnrelated') !== 'true' &&
      keyVariant.includes(ATTRIBUTE_VALUE_PREFIX.UNRELATED)
    ) {
      return false;
    }

    return true;
  });

  return (
    <Flex gap={6} vertical>
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
      <FilterSwitch
        label="Alien Sings"
        value={searchParams.get('signs') === 'true'}
        onChange={(v) => addQueryParam('signs', v ? 'true' : '')}
        className="full-width m-0"
      />
      <Flex gap={6} wrap="wrap" className="item-attribute-value-statement">
        {filteredResponse.map((keyVariant, index, arr) => (
          <Component
            key={keyVariant}
            keyVariant={keyVariant}
            attributes={attributes}
            firstElement={index === 0}
            lastElement={index === arr.length - 1}
          />
        ))}
      </Flex>
    </Flex>
  );
}

type AttributeSpriteProps = {
  keyVariant: string;
  attributes: Dictionary<ItemAttribute>;
  firstElement: boolean;
  lastElement: boolean;
};

function AttributeSprite({ keyVariant, attributes }: AttributeSpriteProps) {
  const { key, className } = parseAttribute(keyVariant);

  return (
    <>
      <AlienSign
        width={50}
        id={attributes[key].spriteId}
        className={clsx('item-attribute-alien-sign', `item-attribute-alien-sign--${className}`)}
      />
    </>
  );
}

function AttributeText({ keyVariant, attributes, firstElement, lastElement }: AttributeSpriteProps) {
  const { key, text } = parseAttribute(keyVariant);

  const prefix = firstElement ? "It's " : '';
  const suffix = lastElement ? '.' : ', ';

  return (
    <>
      {prefix}
      {text} {attributes[key].name.en.toLowerCase()}
      {suffix}
    </>
  );
}
