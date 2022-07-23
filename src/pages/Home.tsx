import { useState } from 'react';

import logo from 'assets/images/logo.svg';

import { Menu } from '../components/Menu';
import { Image } from 'antd';

export function Home() {
  const [count, setCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const onShowMenu = () => {
    setShowMenu(true);
  };

  const styles = showMenu
    ? {
        minHeight: '94vh',
      }
    : {};

  return (
    <div className="home">
      <header className="home-header" style={styles} onClick={onShowMenu}>
        <Image src={logo} className="home-logo" alt="logo" preview={false} />
        {showMenu && <Menu />}
      </header>
    </div>
  );
}
