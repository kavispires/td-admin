import { CalendarOutlined, CloudUploadOutlined, ContainerOutlined } from '@ant-design/icons';
import { FilterSegments } from '@components/Common';
import { FirestoreConsoleLink } from '@components/Common/FirestoreConsoleLink';
import { SiderContent } from '@components/Layout';
import { useQueryParams } from '@hooks/useQueryParams';
import { Checkbox, Typography } from 'antd';
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
        <FirestoreConsoleLink
          label="History"
          path="/diario/history"
        />
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
        <Checkbox
          checked={debugState.alienado}
          onChange={() => toggleDebugMode('alienado')}
        >
          Alienado
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['aqui-o']}
          onChange={() => toggleDebugMode('aqui-o')}
        >
          Aqui o
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['arte-ruim']}
          onChange={() => toggleDebugMode('arte-ruim')}
        >
          Arte Ruim
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.conjuntos}
          onChange={() => toggleDebugMode('conjuntos')}
        >
          Conjuntos
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.filmaco}
          onChange={() => toggleDebugMode('filmaco')}
        >
          Filmaco
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.investigacao}
          onChange={() => toggleDebugMode('investigacao')}
        >
          Espionagem
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.mapeamento}
          onChange={() => toggleDebugMode('mapeamento')}
        >
          Mapeamento
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.organiku}
          onChange={() => toggleDebugMode('organiku')}
        >
          Organiku
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.palavreado}
          onChange={() => toggleDebugMode('palavreado')}
        >
          Palavreado
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.picaco}
          onChange={() => toggleDebugMode('picaco')}
        >
          Picaço
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.pirralhos}
          onChange={() => toggleDebugMode('pirralhos')}
        >
          Pirralhos
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.portais}
          onChange={() => toggleDebugMode('portais')}
        >
          Portais Mágicos
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.quartetos}
          onChange={() => toggleDebugMode('quartetos')}
        >
          Quartetos
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState['ta-na-cara']}
          onChange={() => toggleDebugMode('ta-na-cara')}
        >
          Tá na Cara
        </Checkbox>
      </div>
      <div>
        <Checkbox
          checked={debugState.vitral}
          onChange={() => toggleDebugMode('vitral')}
        >
          Vitral
        </Checkbox>
      </div>
    </SiderContent>
  );
}
