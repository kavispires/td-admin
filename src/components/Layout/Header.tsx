import { useTitle } from 'react-use';

import { Menu } from './Menu';
import { ReactNode } from 'react';

type HeaderProps = {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
};

export function Header({ title, subtitle, extra }: HeaderProps) {
  useTitle(`${title}${subtitle ? ` — ${subtitle}` : ''}`);

  return (
    <header className="header">
      <div className="header__main">
        <h1>
          <span className="header__title">{title}</span>
          {Boolean(subtitle) && <span className="header__subtitle"> — {subtitle}</span>}
        </h1>
        {extra}
      </div>

      <Menu />
    </header>
  );
}
