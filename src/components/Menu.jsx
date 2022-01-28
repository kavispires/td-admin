import { Button, Space } from 'antd';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function Menu({ ghost = false }) {
  const { location } = useHistory();

  return (
    <Space>
      <Link to="/arte-ruim/parser">
        <Button disabled={location.pathname === '/arte-ruim/parser'} ghost={ghost}>
          ARPD Parser
        </Button>
      </Link>
      <Link to="/arte-ruim/level4">
        <Button disabled={location.pathname === '/arte-ruim/level4'} ghost={ghost}>
          ARPD Level 4
        </Button>
      </Link>
      <Link to="/resource">
        <Button disabled={location.pathname === '/resource'} ghost={ghost}>
          Resource
        </Button>
      </Link>
      <Link to="/other">
        <Button disabled={location.pathname === '/other'} ghost={ghost}>
          Other
        </Button>
      </Link>
    </Space>
  );
}
