import { CalendarOutlined, CloudUploadOutlined, ContainerOutlined } from '@ant-design/icons';
import { Checkbox, Typography } from 'antd';
import { FilterSegments } from 'components/Common';
import { FirestoreConsoleLink } from 'components/Common/FirestoreConsoleLink';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { toggleDebugMode, useDebugDailyState } from './utils/games/debug-daily';

export function DailyFilters() {
  const { queryParams, addParams } = useQueryParams();
  return (
    <>
      <SiderContent>
        <FilterSegments
          label="Display"
          onChange={(mode) => addParams({ display: mode })}
          options={[
            {
              title: 'Population',
              icon: <CloudUploadOutlined />,
              value: 'population',
            },
            {
              title: 'Check',
              icon: <CalendarOutlined />,
              value: 'check',
            },
            {
              title: 'Archive',
              icon: <ContainerOutlined />,
              value: 'archive',
            },
          ]}
          value={queryParams.get('display') ?? 'population'}
        />
      </SiderContent>
      <SiderContent>
        <FirestoreConsoleLink label="History" path="/diario/history" />
      </SiderContent>
      <DebugDailyFilters />
    </>
  );
}

function DebugDailyFilters() {
  const debugState = useDebugDailyState();
  return (
    <SiderContent>
      <Typography.Title level={5}>Debuggers</Typography.Title>
      <div>
        <Checkbox checked={debugState['aqui-o']} disabled onChange={() => toggleDebugMode('aqui-o')}>
          Aqui o
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState['arte-ruim']} disabled onChange={() => toggleDebugMode('arte-ruim')}>
          Arte Ruim
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState.artista} disabled onChange={() => toggleDebugMode('artista')}>
          Artista
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['comunicacao-alienigena']}
          disabled
          onChange={() => toggleDebugMode('comunicacao-alienigena')}
        >
          Com. Alienígena
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['controle-de-estoque']}
          disabled
          onChange={() => toggleDebugMode('controle-de-estoque')}
        >
          Controle de Estoque
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState.espionagem} disabled onChange={() => toggleDebugMode('espionagem')}>
          Espionagem
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState.filmaco} disabled onChange={() => toggleDebugMode('filmaco')}>
          Filmaco
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState.organiku} disabled onChange={() => toggleDebugMode('organiku')}>
          Organiku
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState.palavreado} disabled onChange={() => toggleDebugMode('palavreado')}>
          Palavreado
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['portais-magicos']}
          disabled
          onChange={() => toggleDebugMode('portais-magicos')}
        >
          Portais Mágicos
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState.quartetos} disabled onChange={() => toggleDebugMode('quartetos')}>
          Quartetos
        </Checkbox>
      </div>
      <div>
        <Checkbox checked={debugState['ta-na-cara']} disabled onChange={() => toggleDebugMode('ta-na-cara')}>
          Tá na Cara
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['teoria-de-conjuntos']}
          disabled
          onChange={() => toggleDebugMode('teoria-de-conjuntos')}
        >
          Teoria de Conjuntos
        </Checkbox>
      </div>
    </SiderContent>
  );
}
