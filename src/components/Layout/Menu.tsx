import { Menu as AntMenu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  BuildOutlined,
  FileImageOutlined,
  FolderAddOutlined,
  FolderViewOutlined,
  HddOutlined,
} from '@ant-design/icons';

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
            key: '/game/arte-ruim-parser',
          },
          {
            label: 'Groups',
            key: '/game/arte-ruim-groups',
          },
        ],
      },
      {
        type: 'group',
        label: 'Crimes Hediondos',
        children: [
          {
            label: 'Categorizer',
            key: '/game/crimes-hediondos-categorizer',
          },
        ],
      },
      {
        type: 'group',
        label: 'Daily',
        children: [
          {
            label: 'Setup',
            key: '/game/daily-setup',
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
  {
    label: 'Images',
    key: 'images',
    icon: <FileImageOutlined />,
    children: [
      {
        label: 'Sprites',
        key: '/images/sprites',
      },
      {
        label: 'Image Cards',
        key: '/images/image-cards',
      },
      {
        label: 'Suspects',
        key: '/images/suspects',
      },
      {
        label: 'Alien Items',
        key: '/images/alien-items',
      },
      {
        type: 'group',
        label: 'Crimes',
        children: [
          {
            label: 'Weapons',
            key: '/images/weapons',
          },
          {
            label: 'Evidence',
            key: '/images/evidence',
          },
        ],
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
