import { Flex } from 'antd';
import clsx from 'clsx';
import { FilterSwitch } from 'components/Common';
import { AlienSign } from 'components/Sprites';
import { useItemQueryParams } from 'hooks/useItemQueryParams';
import { useMemo } from 'react';
import type { ItemAttributesValues, ItemAttribute } from 'types';
import { filterMessage, getItemAttributePriorityResponse, parseAttribute } from '../utils';

type ItemAttributeDescriptionProps = {
  itemAttributeValues: ItemAttributesValues;
  attributes: Dictionary<ItemAttribute>;
};

export function ItemAttributeDescription({ itemAttributeValues, attributes }: ItemAttributeDescriptionProps) {
  const { searchParams, addQueryParam } = useItemQueryParams();
  const showUnclear = searchParams.get('showUnclear') === 'true';
  const showUnrelated = searchParams.get('showUnrelated') === 'true';

  const filteredResponse = useMemo(
    () =>
      filterMessage(
        getItemAttributePriorityResponse(itemAttributeValues, attributes),
        showUnclear,
        showUnrelated,
      ),
    [itemAttributeValues, attributes, showUnclear, showUnrelated],
  );

  const Component = searchParams.get('signs') === 'true' ? AttributeSprite : AttributeText;

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

export function AttributeSprite({
  keyVariant,
  attributes,
  withText,
}: AttributeSpriteProps & { withText?: boolean }) {
  const { key, className, text } = parseAttribute(keyVariant);

  return (
    <Flex vertical align="center">
      <AlienSign
        width={50}
        id={attributes[key].spriteId}
        className={clsx('item-attribute-alien-sign', `item-attribute-alien-sign--${className}`)}
      />
      {withText && (
        <Flex
          wrap="wrap"
          justify="center"
          align="center"
          style={{ maxWidth: 50, textAlign: 'center', wordBreak: 'break-word' }}
        >
          {text} {attributes[key].name.en.toLowerCase()}
        </Flex>
      )}
    </Flex>
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
