import { Menu as AntMenu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { BuildOutlined, FolderAddOutlined, FolderViewOutlined, HddOutlined } from '@ant-design/icons';

import type { MenuProps } from 'antd';
const items: MenuProps['items'] = [
  {
    label: 'Resource',
    key: '/resource',
    icon: <FolderViewOutlined />,
  },
  {
    label: 'Generator',
    key: '/resource-generator',
    icon: <FolderAddOutlined />,
  },
  {
    label: 'Game Specific',
    key: 'game-specific',
    icon: <BuildOutlined />,
    children: [
      {
        type: 'group',
        label: 'Arte Ruim',
        children: [
          {
            label: 'Parser',
            key: '/arte-ruim-parser',
          },
          {
            label: 'Groups',
            key: '/arte-ruim-groups',
          },
        ],
      },
      {
        type: 'group',
        label: 'Crimes Hediondos',
        children: [
          {
            label: 'Categorizer',
            key: '/crimes-hediondos-categorizer',
          },
        ],
      },
    ],
  },
  {
    label: 'General',
    key: 'general',
    icon: <HddOutlined />,
    children: [
      {
        label: 'Single Word Expander',
        key: '/single-words',
      },
      {
        label: 'Other',
        key: '/other',
      },
    ],
  },
];

export function Menu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  return (
    <AntMenu
      onClick={onClick}
      selectedKeys={[pathname]}
      mode="horizontal"
      items={items}
      className="header__menu"
      theme="dark"
    />
  );
}
