import { Carousel } from 'antd';

const BACKGROUNDS = [
  'default',
  'defaultBlack',
  'cityMap',
  'darkSpiral',
  'digitalFrame',
  'fantasyFrame',
  'laboratory',
  'landline',
  'metal',
  'mysticFrame',
  'notebook',
  'number',
  'phone',
  'postit',
  'redSpiral',
  'spacePanel',
  'trash',
  'ultrasound',
  'woodenFrame',
];

export function ImageBackgroundSelector() {
  return <Carousel arrows autoplay={false} infinite={false}></Carousel>;
}
