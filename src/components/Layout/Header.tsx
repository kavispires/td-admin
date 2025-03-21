import { useTitle } from 'react-use';

import { Avatar, Layout, Typography } from 'antd';
import logo from 'assets/images/logo.svg?url';
import type { ReactNode } from 'react';
import { Menu } from './Menu';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
};

export function Header({ title, subtitle, extra }: HeaderProps) {
  useTitle(`${title}${subtitle ? ` — ${subtitle}` : ''}`);

  return (
    <>
      <Layout.Header className="header">
        <Typography.Title level={1} className="header__h1">
          <Avatar src={logo} size="large" /> <span className="header__title">{title}</span>
          {Boolean(subtitle) && <span className="header__subtitle"> — {subtitle}</span>}
        </Typography.Title>
        <div>{extra}</div>
      </Layout.Header>
      <Menu />
    </>
  );
}
