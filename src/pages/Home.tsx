import { Image } from 'antd';
import logo from 'assets/images/logo.svg';
import { Header } from 'components/Layout/Header';
import { useState } from 'react';

export function Home() {
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
      {showMenu && <Header title="TDR" subtitle="Home" />}
      <header className="home-header" style={styles} onClick={onShowMenu}>
        <Image src={logo} className="home-logo" alt="logo" preview={false} />
      </header>
    </div>
  );
}
