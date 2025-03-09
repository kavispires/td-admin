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
import { useGlobalSaveState } from 'store/globalSave';

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
          {
            label: 'Drawings',
            key: '/game/arte-ruim-drawings',
          },
        ],
      },
      {
        label: 'Contenders',
        key: '/game/contenders',
      },
      {
        label: 'Crimes Hediondos',
        key: '/game/crimes-hediondos',
      },
      {
        label: 'Daily Setup',
        key: '/game/daily-setup',
      },
      {
        label: 'Fofoca Quente',
        key: '/game/fofoca-quente',
      },
      {
        label: 'Testimonies',
        key: '/game/testimonies',
        disabled: true,
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
        label: 'Movie Maker',
        key: '/movie-maker',
      },
      {
        label: 'Playground',
        key: '/playground',
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
        label: 'Suspects',
        key: '/images/suspects',
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
            label: 'Descriptor',
            key: '/image-cards/descriptor',
          },
          {
            label: 'Comparator',
            key: '/image-cards/comparator',
          },
          {
            label: 'Image Passcode',
            key: '/image-cards/passcode',
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
        label: 'Groups',
        key: '/items/groups',
      },
      {
        label: 'Attributes',
        key: '/items/attribution',
      },
      {
        label: 'Crimes History',
        key: '/items/crimes-history',
      },
      {
        type: 'group',
        label: 'Daily',
        children: [
          {
            label: 'Disc Sets',
            key: '/items/discs',
          },
          {
            label: 'Movies',
            key: '/items/movies',
          },
          {
            label: 'Quartets',
            key: '/items/quartets',
          },
          {
            label: 'Diagram Sets',
            key: '/items/diagrams',
          },
        ],
      },
    ],
  },
];

export function Menu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { pendingSave } = useGlobalSaveState();

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
      disabled={pendingSave}
    />
  );
}
