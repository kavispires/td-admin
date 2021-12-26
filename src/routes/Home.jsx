import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Space } from 'antd';
import logo from '../logo.svg';
import { DoubleRightOutlined } from '@ant-design/icons';

function Home() {
  const [count, setCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const increaseCount = () => {
    setCount(count + 1);
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
          <Link to="/other" className="home-link">
            <DoubleRightOutlined /> Other
          </Link>
        </Space>
      )}
    </div>
  );
}

export default Home;
