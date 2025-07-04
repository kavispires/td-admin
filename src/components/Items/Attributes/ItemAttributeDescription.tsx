import { Flex } from 'antd';
import clsx from 'clsx';
import { FilterSwitch } from 'components/Common';
import { AlienSign } from 'components/Sprites';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import type { ItemAttribute, ItemAttributesValues } from 'types';
import { filterMessage, getItemAttributePriorityResponse, parseAttribute } from '../utils';

type ItemAttributeDescriptionProps = {
  itemAttributeValues: ItemAttributesValues;
  attributes: Dictionary<ItemAttribute>;
};

export function ItemAttributeDescription({ itemAttributeValues, attributes }: ItemAttributeDescriptionProps) {
  const { is, addParam } = useQueryParams();
  const showUnclear = is('showUnclear');
  const showUnrelated = is('showUnrelated');

  const filteredResponse = useMemo(
    () =>
      filterMessage(
        getItemAttributePriorityResponse(itemAttributeValues, attributes),
        showUnclear,
        showUnrelated,
      ),
    [itemAttributeValues, attributes, showUnclear, showUnrelated],
  );

  const Component = is('signs') ? AttributeSprite : AttributeText;

  return (
    <Flex gap={6} vertical>
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
      <FilterSwitch
        className="full-width m-0"
        label="Alien Signs"
        onChange={(v) => addParam('signs', v ? 'true' : '')}
        value={is('signs')}
      />
      <Flex className="item-attribute-value-statement" gap={6} wrap="wrap">
        {filteredResponse.map((keyVariant, index, arr) => (
          <Component
            attributes={attributes}
            firstElement={index === 0}
            key={keyVariant}
            keyVariant={keyVariant}
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
    <Flex align="center" vertical>
      <AlienSign
        className={clsx('item-attribute-alien-sign', `item-attribute-alien-sign--${className}`)}
        id={attributes[key].spriteId}
        width={50}
      />
      {withText && (
        <Flex
          align="center"
          justify="center"
          style={{ maxWidth: 50, textAlign: 'center', wordBreak: 'break-word' }}
          wrap="wrap"
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
