import { Avatar, Layout, Typography } from 'antd';
import logo from 'assets/images/logo.svg?url';
import { type LegacyRef, type ReactNode, useEffect } from 'react';
import { useMeasure, useTitle } from 'react-use';
import { updateHeaderHeight } from 'store/headerHeight';
import { Menu } from './Menu';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
};

export function Header({ title, subtitle, extra }: HeaderProps) {
  useTitle(`${title}${subtitle ? ` — ${subtitle}` : ''}`);
  const [ref, { height }] = useMeasure();

  // Update the header height in the global state
  useEffect(() => {
    updateHeaderHeight(height);
  }, [height]);

  return (
    <div ref={ref as LegacyRef<HTMLDivElement>}>
      <Layout.Header className="header">
        <Typography.Title level={1} className="header__h1">
          <Avatar src={logo} size="large" /> <span className="header__title">{title}</span>
          {Boolean(subtitle) && <span className="header__subtitle"> — {subtitle}</span>}
        </Typography.Title>
        <div>{extra}</div>
      </Layout.Header>
      <Menu />
    </div>
  );
}
