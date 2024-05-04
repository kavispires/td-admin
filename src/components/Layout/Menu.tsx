import { Menu as AntMenu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  BuildOutlined,
  FileImageOutlined,
  FolderViewOutlined,
  GiftOutlined,
  HddOutlined,
} from '@ant-design/icons';

import type { MenuProps } from 'antd';

const items: MenuProps['items'] = [
  {
    label: 'Resources',
    key: 'resources',
    icon: <FolderViewOutlined />,
    children: [
      {
        label: 'Listing',
        key: '/resources/listing',
      },
      {
        label: 'Generator',
        key: '/resources/generator',
      },
    ],
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
        type: 'group',
        label: 'Image Cards',
        children: [
          {
            label: 'Decks',
            key: '/image-cards/decks',
          },
          {
            label: 'Classifier',
            key: '/image-cards/classifier',
            disabled: true,
          },
          {
            label: 'Relationships',
            key: '/image-cards/relationships',
          },
          {
            label: 'Connections Visualizer',
            key: '/image-cards/connections',
          },
        ],
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
      {
        label: 'Suspects',
        key: '/images/suspects',
      },
    ],
  },
  {
    label: 'Items',
    key: 'items',
    icon: <GiftOutlined />,
    children: [
      {
        label: 'Listing',
        key: '/items',
      },
      {
        label: 'Attributes',
        key: '/items/attribution',
      },
      {
        label: 'Sets',
        key: '/items/sets',
      },
      {
        label: 'Crimes History',
        key: '/items/crimes-history',
        disabled: true,
      },
      {
        label: 'Movies',
        key: '/items/movies',
        disabled: true,
      },
      {
        label: 'Quartets',
        key: '/items/quartets',
        disabled: true,
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
