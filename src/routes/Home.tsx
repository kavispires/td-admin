import { useEffect, useState } from 'react';

import logo from 'assets/images/logo.svg';

import { Menu } from '../components/Menu';
import { Image } from 'antd';

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
        <Image src={logo} className="home-logo" alt="logo" preview={false} />
        {showMenu && <Menu />}
      </header>
    </div>
  );
}

export default Home;
