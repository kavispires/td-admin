import { Alert, Button, Divider, Flex, Space, Typography } from 'antd';
import { AlienSign, Item } from 'components/Sprites';
import { useTDResource } from 'hooks/useTDResource';
import { keys, sample, sampleSize, shuffle, values } from 'lodash';
import { useState } from 'react';
import type { ItemAttributesValues, ItemAttribute } from 'types';
import { makeArray } from 'utils';
import { ATTRIBUTE_VALUE } from 'utils/constants';

export function DailyAliemSimulator() {
  const tdrAttributesQuery = useTDResource<ItemAttribute>('items-attributes');
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAttributesValues>('items-attribute-values');

  const [simulation, setSimulation] = useState<DailyAlienGame | null>(null);

  // Choose 3 random attributes that are not limited
  // Get examples for each attribute of items that have value 10 in that attribute but are -3 in the other two

  const onSimulate = () => {
    setSimulation(generateDailyAlienGame(tdrAttributesQuery.data, tdrItemsAttributesValuesQuery.data));
  };

  const onSimulateMany = () => {
    const simulations: Dictionary<DailyAlienGame> = {};
    let tries = 0;
    while (tries < 300 || keys(simulations).length === 15) {
      const simulation = generateDailyAlienGame(tdrAttributesQuery.data, tdrItemsAttributesValuesQuery.data);
      if (simulation.valid && !simulations[simulation.setId]) {
        simulations[simulation.setId] = simulation;
      }
      if (keys(simulations).length >= 15) {
        break;
      }
      tries += 1;
    }
    console.log('TRIES', tries);
    console.log(Object.values(simulations).map((e, i) => ({ ...e, number: e.number - i })));
  };

  return (
    <div className="my-4">
      <Typography.Title level={3}>Daily Simulator</Typography.Title>

      <Typography.Paragraph>Generates a daily game for Alien Communication</Typography.Paragraph>

      <Space>
        <Button type="primary" onClick={onSimulate}>
          Generate
        </Button>
        <Button onClick={onSimulateMany}>Generate List</Button>
      </Space>

      <div>
        {Boolean(simulation) && (
          <Space direction="vertical" key={simulation?.setId}>
            <Typography.Title level={5}>{simulation?.setId}</Typography.Title>
            {!simulation?.valid && <Alert type="error" message="Invalid game" />}
            <Space direction="vertical">
              {simulation?.attributes.map((attr) => (
                <Flex key={attr.id} gap={8}>
                  <AlienSign id={attr.spriteId} width={50} />
                  {attr.itemsIds.map((itemId) => (
                    <Item key={itemId} id={itemId || '0'} width={50} />
                  ))}
                </Flex>
              ))}
            </Space>
            <Divider className="my-1" />
            <Space direction="horizontal">
              {simulation?.requests.map((req) => (
                <Flex key={req.itemId} vertical>
                  <AlienSign id={req.spritesIds[2]} width={50} />
                  <AlienSign id={req.spritesIds[1]} width={50} />
                  <AlienSign id={req.spritesIds[0]} width={50} />
                </Flex>
              ))}
            </Space>

            <Divider className="my-1" />
            <Space direction="horizontal">
              {simulation?.itemsIds.map((itemId) => (
                <Item key={itemId} id={itemId || '0'} width={50} />
              ))}
            </Space>
          </Space>
        )}
      </div>
    </div>
  );
}

type DailyAlienGameAttribute = {
  id: string;
  name: string;
  description: string;
  spriteId: string;
  itemsIds: string[];
};

type DailyAlienGameRequest = {
  spritesIds: string[];
  itemId: string;
};

type DailyAlienGame = {
  id: string;
  setId: string;
  number: number;
  type: 'comunicação-alienígena';
  attributes: DailyAlienGameAttribute[];
  requests: DailyAlienGameRequest[];
  solution: string;
  itemsIds: string[];
  valid: boolean;
};

const generateDailyAlienGame = (
  attributes: Dictionary<ItemAttribute>,
  itemsAttributesValues: Dictionary<ItemAttributesValues>,
): DailyAlienGame => {
  const allAttributes = values(attributes).filter((attr) => !attr.limited || attr.id === 'sol');
  const allItems = shuffle(values(itemsAttributesValues).filter((i) => i.complete));

  const spriteIDs = shuffle(makeArray(38, 0));

  // Select 3 attributes and reassign random sprites
  const selectedAttributes = sampleSize(allAttributes, 3).map((attr) => ({
    ...attr,
    spriteId: `${spriteIDs.pop()}`,
  }));
  const attributeA: string[] = [];
  const attributeB: string[] = [];
  const attributeC: string[] = [];
  const attributeAB: string[] = [];
  const attributeAC: string[] = [];
  const attributeBC: string[] = [];
  const attributeABC: string[] = [];
  const none: string[] = [];

  allItems.forEach((item) => {
    const POSITIVE = [ATTRIBUTE_VALUE.DETERMINISTIC, ATTRIBUTE_VALUE.RELATED];
    const isVeryValueA = item.attributes[selectedAttributes[0].id] === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueA = POSITIVE.includes(item.attributes[selectedAttributes[0].id]);
    const isNotValueA = item.attributes[selectedAttributes[0].id] === ATTRIBUTE_VALUE.UNRELATED;
    const isVeryValueB = item.attributes[selectedAttributes[1].id] === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueB = POSITIVE.includes(item.attributes[selectedAttributes[1].id]);
    const isNotValueB = item.attributes[selectedAttributes[1].id] === ATTRIBUTE_VALUE.UNRELATED;
    const isVeryValueC = item.attributes[selectedAttributes[2].id] === ATTRIBUTE_VALUE.DETERMINISTIC;
    const isValueC = POSITIVE.includes(item.attributes[selectedAttributes[2].id]);
    const isNotValueC = item.attributes[selectedAttributes[2].id] === ATTRIBUTE_VALUE.UNRELATED;

    if (isNotValueA && isNotValueB && isNotValueC) {
      return none.push(item.id);
    }
    if (isVeryValueA && isNotValueB && isNotValueC) {
      attributeA.push(item.id);
    }
    if (isNotValueA && isVeryValueB && isNotValueC) {
      attributeB.push(item.id);
    }
    if (isNotValueA && isNotValueB && isVeryValueC) {
      attributeC.push(item.id);
    }
    if (isValueA && isValueB && isNotValueC) {
      attributeAB.push(item.id);
    }
    if (isValueA && isNotValueB && isValueC) {
      attributeAC.push(item.id);
    }
    if (isNotValueA && isValueB && isValueC) {
      attributeBC.push(item.id);
    }
    if (isValueA && isValueB && isValueC) {
      attributeABC.push(item.id);
    }
  });

  const gameAttributes: DailyAlienGameAttribute[] = selectedAttributes.map((attr) => ({
    id: attr.id,
    name: attr.name.pt,
    description: attr.description.pt,
    spriteId: attr.spriteId,
    itemsIds: [],
  }));
  gameAttributes[0].itemsIds = sampleSize(
    attributeA,
    attributeA.length > 3 ? 3 : Math.max(attributeA.length - 1, 1),
  );
  gameAttributes[1].itemsIds = sampleSize(
    attributeB,
    attributeB.length > 3 ? 3 : Math.max(attributeA.length - 1, 1),
  );
  gameAttributes[2].itemsIds = sampleSize(
    attributeC,
    attributeC.length > 3 ? 3 : Math.max(attributeA.length - 1, 1),
  );

  const usedItemsIds: string[] = [];
  gameAttributes.forEach((attr) => {
    usedItemsIds.push(...attr.itemsIds);
  });

  const complexRequests: DailyAlienGameRequest[] = [];
  // AB request
  if (attributeAB.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[0].spriteId, selectedAttributes[1].spriteId],
      itemId: sample(attributeAB) ?? '',
    });
  }
  // AC request
  if (attributeAC.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[0].spriteId, selectedAttributes[2].spriteId],
      itemId: sample(attributeAC) ?? '',
    });
  }
  // BC request
  if (attributeBC.length > 0) {
    complexRequests.push({
      spritesIds: [selectedAttributes[1].spriteId, selectedAttributes[2].spriteId],
      itemId: sample(attributeBC) ?? '',
    });
  }
  // ABC request
  if (attributeABC.length > 0) {
    complexRequests.push({
      spritesIds: selectedAttributes.map((attr) => attr.spriteId),
      itemId: sample(attributeABC) ?? '',
    });
  }
  const simpleRequests: DailyAlienGameRequest[] = [];
  // Additional request A
  if (attributeA.length > 0) {
    simpleRequests.push({
      spritesIds: [selectedAttributes[0].spriteId],
      itemId: attributeA.filter((id) => !usedItemsIds.includes(id))[0],
    });
  }
  // Additional request B
  if (attributeB.length > 0) {
    simpleRequests.push({
      spritesIds: [selectedAttributes[1].spriteId],

      itemId: attributeB.filter((id) => !usedItemsIds.includes(id))[0],
    });
  }
  // Additional request C
  if (attributeC.length > 0) {
    simpleRequests.push({
      spritesIds: [selectedAttributes[2].spriteId],
      itemId: attributeC.filter((id) => !usedItemsIds.includes(id))[0],
    });
  }

  console.log({
    attributeA,
    attributeB,
    attributeC,
    attributeAB,
    attributeAC,
    attributeBC,
    attributeABC,
  });

  console.log('COMPLEX REQUEST SIZE', complexRequests.length);
  console.log('SIMPLE REQUEST SIZE', simpleRequests.length);
  let requests = sampleSize(complexRequests, 4);
  console.log('REQUEST SIZE', requests.length);

  if (requests.length < 3) {
    requests.push(...sampleSize(simpleRequests, 4 - requests.length));
  }

  if (requests.length < 4) {
    console.warn('Not enough requests');
  }

  requests = shuffle(requests);

  const requestItemsIds: string[] = requests.map((req) => req.itemId);

  const result: DailyAlienGame = {
    id: '2024-00-00',
    setId: gameAttributes
      .map((attr) => attr.id)
      .sort()
      .join('-'),
    number: 0,
    type: 'comunicação-alienígena',
    attributes: gameAttributes,
    requests,
    solution: requestItemsIds.join('-'),
    itemsIds: shuffle([...requestItemsIds, none[0], none[1], none[2], none[3]]).filter(Boolean),
    valid: false,
  };

  // Validate game
  result.valid = [
    result.attributes.length === 3,
    result.requests.length === 4,
    // TODO: verify if it should be 6
    result.itemsIds.length > 5,
    result.attributes.every((attr) => attr.itemsIds.length > 0),
    result.requests.every((req) => req.itemId),
  ].every(Boolean);

  console.log(result);

  return result;
};
