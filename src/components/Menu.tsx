import { Button, Space } from 'antd';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function Menu({ ghost = false }) {
  const location = useLocation();

  return (
    <Space>
      <Link to="/arte-ruim-parser">
        <Button disabled={location.pathname === '/arte-ruim-parser'} type="link" ghost={ghost}>
          ARPD Parser
        </Button>
      </Link>
      <Link to="/arte-ruim-groups">
        <Button disabled={location.pathname === '/arte-ruim-groups'} type="link" ghost={ghost}>
          ARPD Groups
        </Button>
      </Link>
      <Link to="/crimes-hediondos-categorizer">
        <Button disabled={location.pathname === '/crimes-hediondos-categorizer'} type="link" ghost={ghost}>
          CH Categorizer
        </Button>
      </Link>
      <Link to="/resource">
        <Button disabled={location.pathname === '/resource'} type="link" ghost={ghost}>
          Resource
        </Button>
      </Link>
      <Link to="/other">
        <Button disabled={location.pathname === '/other'} type="link" ghost={ghost}>
          Other
        </Button>
      </Link>
    </Space>
  );
}
