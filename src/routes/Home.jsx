import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Space } from 'antd';
import logo from '../logo.svg';
import { DoubleRightOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

function Home() {
  const history = useHistory();
  const [count, setCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const increaseCount = () => {
    setCount(count + 1);
  };

  const handleClick = ({ key }) => {
    history.push(`/${key}`);
  };

  useEffect(() => {
    if (count === 6) {
      setShowMenu(true);
    }
  }, [count]);

  const styles = showMenu
    ? {
        minHeight: '94vh',
      }
    : {};

  return (
    <div className="home">
      <header className="home-header" style={styles} onClick={increaseCount}>
        <img src={logo} className="home-logo" alt="logo" />
      </header>
      {showMenu && (
        <Space className="home-menu">
          <Link to="/parser" className="home-link">
            <DoubleRightOutlined /> Arte Ruim: Parser
          </Link>
          <Link to="/level4" className="home-link">
            <DoubleRightOutlined /> Arte Ruim: Level 4
          </Link>
        </Space>
        // <Menu mode="horizontal" onClick={handleClick}>
        //   <Menu.Item key="parser" icon={<DoubleRightOutlined />}>
        //     Arte Ruim: Parser
        //   </Menu.Item>
        //   <Menu.Item key="level4" icon={<DoubleRightOutlined />}>
        //     Arte Ruim: Level 4
        //   </Menu.Item>
        // </Menu>
      )}
    </div>
  );
}

export default Home;
