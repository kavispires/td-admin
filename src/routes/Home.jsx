import { useEffect, useState } from 'react';

import logo from '../logo.svg';

import { Menu } from '../components/Menu';

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
        {showMenu && <Menu ghost />}
      </header>
    </div>
  );
}

export default Home;
