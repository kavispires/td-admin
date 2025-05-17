import ReactJsonView from '@microlink/react-json-view';
import { useMutation, useQueries } from '@tanstack/react-query';
import { Button, Flex, Input, InputNumber, Select, Space, Tag, Typography } from 'antd';
import type { DailyEntry } from 'components/Daily/hooks';
import { deleteDoc, doc } from 'firebase/firestore';
import { getDocQueryFunction } from 'hooks/useGetFirestoreDoc';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { firestore } from 'services/firebase';
import { sortJsonKeys } from 'utils';

export function DailyDataArchive() {
  const [startDate, setStartDate] = useState('');
  const [range, setRange] = useState(7);
  const [isValidDate, setIsValidDate] = useState(false);
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');

  const { isLoading, isError, data } = useRangedDailyDataCheck(startDate, range, isQueryEnabled);

  const onUpdateDate = (value: string) => {
    setIsValidDate(false);
    setIsQueryEnabled(false);
    setStartDate(value.trim());
  };

  const onUpdateRange = (value: number) => {
    setIsQueryEnabled(false);
    setRange(value);
  };

  const onValidateDate = () => {
    const valid = moment(startDate, 'YYYY-MM-DD', true).isValid();
    setIsValidDate(valid);
    setIsQueryEnabled(valid);
  };

  const selectedData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return {};

    // If no game is selected, show all data
    if (!selectedGame) return data;

    const selectedGameKey = selectedGame as keyof DailyEntry;
    if (!Object.values(data).every((dailyEntry) => dailyEntry?.[selectedGameKey])) {
      return data;
    }

    const filteredData: Record<number, any> = {};
    Object.values(data).forEach((dailyEntry) => {
      const entry = dailyEntry?.[selectedGameKey];
      const number = (entry as any)?.number;
      if (filteredData[number]) {
        console.error(`Duplicate entry for game ${selectedGameKey} with number ${number}`);
      }
      filteredData[number] = sortJsonKeys(entry, ['number', 'language', 'text']);
    });

    return filteredData;
  }, [data, selectedGame]);

  return (
    <div>
      <Typography.Title level={2}>Data Archive</Typography.Title>

      <Flex justify="space-between" align="center" className="mb-6">
        <Flex gap={12} align="center">
          <Space.Compact>
            <Input
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(e) => onUpdateDate(e.target.value)}
            />
            <InputNumber min={1} max={100} value={range} onChange={(value) => onUpdateRange(value ?? 1)} />
            <Button
              type="primary"
              onClick={onValidateDate}
              disabled={!startDate || !moment(startDate, 'YYYY-MM-DD', true).isValid()}
            >
              Load
            </Button>
          </Space.Compact>

          {startDate && (
            <span>
              <Tag>{startDate}</Tag>
              {range > 1 && (
                <>
                  to{' '}
                  <Tag>
                    {moment(startDate)
                      .add(range - 1, 'days')
                      .format('YYYY-MM-DD')}
                  </Tag>
                </>
              )}
            </span>
          )}

          <span>
            <Tag color={isLoading ? 'blue' : isError ? 'red' : isValidDate ? 'green' : 'gray'}>
              {isLoading ? 'Loading...' : isError ? 'Error' : isValidDate ? 'Valid' : 'Ready'}
            </Tag>
          </span>
        </Flex>

        <Flex gap={12} align="center">
          <DeleteSecuredDocuments />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by game"
            allowClear
            onChange={(value) => setSelectedGame(value)}
            options={[
              { value: '', label: 'All games' },
              { value: 'aqui-o', label: 'Aqui Ó' },
              { value: 'arte-ruim', label: 'Arte Ruim' },
              { value: 'artista', label: 'Artista' },
              { value: 'comunicacao-alienigena', label: 'Comunicação Alienígena' },
              { value: 'controle-de-estoque', label: 'Controle de Estoque' },
              { value: 'filmaco', label: 'Filmaço' },
              { value: 'palavreado', label: 'Palavreado' },
              { value: 'portais-magicos', label: 'Portais Mágicos' },
              { value: 'quartetos', label: 'Quartetos' },
              { value: 'ta-na-cara', label: 'Tá na Cara' },
              { value: 'teoria-de-conjuntos', label: 'Teoria de Conjuntos' },
            ]}
          />
        </Flex>
      </Flex>

      <ReactJsonView src={selectedData} theme="twilight" collapsed={1} />
    </div>
  );
}

/**
 * Hook to fetch multiple daily documents within a specified date range
 * @param startDate - The starting date in YYYY-MM-DD format
 * @param range - Number of days to fetch (including the start date)
 * @param enabled - Whether the queries should be enabled
 * @returns An object with isLoading status and the fetched data
 */
const useRangedDailyDataCheck = (startDate: string, range: number, enabled: boolean) => {
  const queryOptions = useMemo(() => {
    if (!enabled || !moment(startDate, 'YYYY-MM-DD', true).isValid()) {
      return [];
    }

    const options = [];
    const start = moment(startDate);

    for (let i = 0; i < range; i++) {
      const currentDate = start.clone().add(i, 'days').format('YYYY-MM-DD');
      options.push({
        queryKey: ['firebase', 'diario', currentDate],
        queryFn: getDocQueryFunction<DailyEntry>('diario', currentDate),
        enabled: true,
      });
    }

    return options;
  }, [startDate, range, enabled]);

  const results = useQueries({
    queries: queryOptions,
  });

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const data = useMemo(() => {
    if (isLoading || isError) return {};

    return results.reduce(
      (acc, result, index) => {
        if (result.data && Object.keys(result.data).length > 0) {
          const currentDate = moment(startDate).add(index, 'days').format('YYYY-MM-DD');
          acc[currentDate] = result.data;
        }
        return acc;
      },
      {} as Record<string, DailyEntry>,
    );
  }, [results, startDate, isLoading, isError]);

  return {
    isLoading,
    isError,
    data,
    results,
  };
};

function DeleteSecuredDocuments() {
  const mutation = useMutation({
    mutationFn: async () => {
      const startDocId = '2024-01-01';
      const endDocId = '2024-04-30';
      try {
        const startDate = moment(startDocId);
        const endDate = moment(endDocId);

        for (let i = 0; i <= endDate.diff(startDate, 'days'); i++) {
          const currentDate = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
          const docRef = doc(firestore, 'diario', currentDate);
          await deleteDoc(docRef);
        }
      } catch (error) {
        throw new Error(error as string);
      }
    },
    onError: (error) => {
      console.error('Error deleting documents:', error);
    },
    onSuccess: () => {
      console.log(' Documents deleted successfully');
    },
  });

  return (
    <Button danger onClick={() => mutation.mutate()} loading={mutation.isPending} disabled>
      Delete secured documents
    </Button>
  );
}
