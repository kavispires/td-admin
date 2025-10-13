import {
  BuildOutlined,
  CalendarOutlined,
  FileImageOutlined,
  FolderViewOutlined,
  GiftOutlined,
  HddOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu as AntMenu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
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
      {
        label: 'Single Words',
        key: '/resources/single-words',
      },
    ],
  },
  {
    label: 'Daily',
    key: 'daily',
    icon: <CalendarOutlined />,
    children: [
      {
        label: 'Daily Setup',
        key: '/daily',
      },
      {
        label: 'Diagram Sets',
        key: '/daily/diagrams',
      },
      {
        label: 'Disc Sets',
        key: '/daily/discs',
      },
      {
        label: 'Movies',
        key: '/daily/movies',
      },
      {
        label: 'Quartets',
        key: '/daily/quartets',
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
            key: '/game/arte-ruim/parser',
          },
          {
            label: 'Groups',
            key: '/game/arte-ruim/groups',
          },
          {
            label: 'Drawings',
            key: '/game/arte-ruim/drawings',
          },
        ],
      },
      {
        label: 'Crimes Hediondos',
        key: '/game/crimes-hediondos',
      },
      {
        label: 'Escape Room',
        key: '/game/escape-room',
      },
      {
        label: 'Fofoca Quente',
        key: '/game/fofoca-quente',
      },
    ],
  },
  {
    label: 'Libraries',
    key: 'libraries',
    icon: <HddOutlined />,
    children: [
      {
        label: 'Sprites',
        key: '/libraries/sprites',
      },
      {
        label: 'Suspects',
        key: '/libraries/suspects',
      },
      {
        label: 'Contenders',
        key: '/libraries/contenders',
      },
      {
        label: 'Testimonies',
        key: '/libraries/testimonies',
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
        label: 'Attribution',
        key: '/items/attribution',
      },
      {
        label: 'Crimes History',
        key: '/items/crimes-history',
      },
    ],
  },
  {
    label: 'Images',
    key: 'images',
    icon: <FileImageOutlined />,
    children: [
      {
        type: 'group',
        label: 'Image Cards',
        children: [
          {
            label: 'Decks',
            key: '/image/decks',
          },
          {
            label: 'Descriptor',
            key: '/image/descriptor',
          },
          {
            label: 'Passcode',
            key: '/image/passcode',
          },
          {
            label: 'Relationships',
            key: '/image/relationships',
          },
          {
            label: 'Comparator',
            key: '/image/comparator',
          },
          {
            label: 'Connections',
            key: '/image/connections',
          },
        ],
      },
    ],
  },
  {
    label: 'Fun',
    key: 'fun',
    icon: <SmileOutlined />,
    children: [
      {
        label: 'Playground',
        key: '/fun/playground',
      },
      {
        label: 'Movie Maker',
        key: '/fun/movie-maker',
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
      className="header__menu"
      disabled={pendingSave}
      items={items}
      mode="horizontal"
      onClick={onClick}
      selectedKeys={[pathname]}
      theme="dark"
    />
  );
}
