import { Button, Flex, Rate, Space, Typography } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { cloneDeep, intersection, orderBy, sample, sampleSize } from 'lodash';
import { useState } from 'react';
import { DailyQuartetSet } from 'types';

import { Item } from 'components/Sprites';

export function ItemsQuartetsSimulator({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyQuartetSet>) {
  const [simulation, setSimulation] = useState(simulateQuartetGame(data));

  const onNewSimulation = () => {
    setSimulation(simulateQuartetGame(data));
  };

  return (
    <Space direction="vertical">
      <Typography.Title level={5}>Simulator</Typography.Title>
      <Button onClick={onNewSimulation}>New Simulation</Button>

      <Flex gap={24} vertical>
        <QuartetRow quartet={simulation.perfectQuartet} />

        {simulation.nonPerfectQuartets.map((quartet) => (
          <QuartetRow key={quartet.id} quartet={quartet} />
        ))}
      </Flex>
    </Space>
  );
}

type QuartetRowProps = {
  quartet: DailyQuartetSet;
};

function QuartetRow({ quartet }: QuartetRowProps) {
  return (
    <Space direction="vertical">
      <Typography.Text strong>
        {quartet.title} <Rate count={3} value={quartet.level} disabled />
      </Typography.Text>
      <Flex gap={8}>
        {quartet.itemsIds.map((itemId) => (
          <Item key={itemId} id={itemId} width={60} />
        ))}
      </Flex>
    </Space>
  );
}

function simulateQuartetGame(allQuartets: UseResourceFirebaseDataReturnType<DailyQuartetSet>['data']) {
  const quartetsArray = Object.values(allQuartets);

  // Step 1: Find a random perfect quartet (has exactly 4 items and a type)
  const perfectQuartets = quartetsArray.filter((q) => q.itemsIds.length === 4 && q.type);

  if (perfectQuartets.length === 0) {
    throw new Error('No perfect quartets found.');
  }

  const perfectQuartet = cloneDeep(sample(perfectQuartets));

  if (!perfectQuartet) {
    throw new Error('No random perfect quartet found.');
  }

  const perfectItemIds = new Set(perfectQuartet.itemsIds);
  const usedItemIds = new Set(perfectQuartet.itemsIds);

  // Step 2: Find 3 non-perfect quartets that share exactly one itemId with the perfect quartet and have more than 4 items
  const otherQuartets = quartetsArray.filter((q) => q.itemsIds.length > 4);

  const getQuartetOptions = (index: number) =>
    otherQuartets.filter(
      (q) =>
        q.itemsIds.includes(perfectQuartet.itemsIds[index]) &&
        intersection(q.itemsIds, Array.from(perfectItemIds)).length === 1,
    );

  const matchZeroQuartets = getQuartetOptions(0);
  const matchOneQuartets = getQuartetOptions(1);
  const matchTwoQuartets = getQuartetOptions(2);
  const matchThreeQuartets = getQuartetOptions(3);

  const orderedMatches = orderBy(
    [matchZeroQuartets, matchOneQuartets, matchTwoQuartets, matchThreeQuartets],
    'length',
  ).filter((quartets) => quartets.length > 0);

  const nonPerfectQuartets = orderedMatches.map((quartets) => cloneDeep(sample(quartets)!));

  // Ensure we only have 3 non-perfect quartets
  const selectedNonPerfectQuartets = nonPerfectQuartets.slice(0, 3);

  selectedNonPerfectQuartets.forEach((quartet) => {
    quartet.itemsIds.forEach((id) => usedItemIds.add(id));

    const filteredItemIds = quartet.itemsIds.filter((id) => !perfectItemIds.has(id));
    const randomItemIds = sampleSize(filteredItemIds, 4);

    quartet.itemsIds = randomItemIds;
  });

  let tries = 0;

  // If there are less than 3 selected non-perfect quartets, fill the rest with random quartets
  while (selectedNonPerfectQuartets.length < 3 && tries < 100) {
    console.log('Trying to complete simulation...');
    const remainingQuartets = otherQuartets.filter(
      (q) => intersection(q.itemsIds, Array.from(usedItemIds)).length === 0,
    );

    if (remainingQuartets.length === 0) {
      throw new Error('Not enough quartets to complete the simulation.');
    }

    const randomQuartet = cloneDeep(sample(remainingQuartets)!);
    randomQuartet.itemsIds.forEach((id) => usedItemIds.add(id));

    const randomItemIds = sampleSize(randomQuartet.itemsIds, 4);
    randomQuartet.itemsIds = randomItemIds;

    selectedNonPerfectQuartets.push(randomQuartet);
    tries += 1;
  }

  if (tries === 100) {
    throw new Error('Failed to complete simulation.');
  }

  return {
    perfectQuartet: perfectQuartet,
    nonPerfectQuartets: selectedNonPerfectQuartets,
    usedItemIds: Array.from(usedItemIds),
  };
}
