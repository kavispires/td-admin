import { capitalize } from 'lodash';

export const AGE_OPTIONS = ['18-21', '21-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90'].map(
  (v) => ({
    label: v,
    value: v,
  }),
);

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Other', value: 'other' },
];

export const RACE_OPTIONS = [
  { label: 'White', value: 'white' },
  { label: 'Black', value: 'black' },
  { label: 'Asian', value: 'asian' },
  { label: 'Brown', value: 'brown' },
  { label: 'Indigenous', value: 'indigenous' },
  { label: 'Mixed', value: 'mixed' },
  { label: 'Other', value: 'other' },
];

export const BUILD_OPTIONS = ['thin', 'average', 'muscular', 'large'].map((v) => ({
  label: v,
  value: v,
}));

export const HEIGHT_OPTIONS = ['short', 'medium', 'tall'].map((v) => ({
  label: v,
  value: v,
}));

export const MBTI_OPTIONS = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
];

export const ZODIAC_SIGN_OPTIONS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
].map((v) => ({
  label: capitalize(v),
  value: v,
}));

export const ALIGNMENT_OPTIONS = [
  'lawful-good',
  'neutral-good',
  'chaotic-good',
  'lawful-neutral',
  'true-neutral',
  'chaotic-neutral',
  'lawful-evil',
  'neutral-evil',
  'chaotic-evil',
].map((v) => ({
  label: capitalize(v.replace('-', ' ')),
  value: v,
}));

export const SEXUAL_ORIENTATION_OPTIONS = [
  { label: 'Straight', value: 'straight' },
  { label: 'Gay', value: 'gay' },
  { label: 'Bisexual', value: 'bisexual' },
  { label: 'Other', value: 'other' },
];

export const EDUCATION_LEVEL_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Basic', value: 'basic' },
  { label: 'College', value: 'college' },
  { label: 'High Education', value: 'high' },
];

export const ECONOMIC_CLASS_OPTIONS = [
  { label: 'Lower', value: 'lower' },
  { label: 'Middle', value: 'middle' },
  { label: 'Upper', value: 'upper' },
];

export const FEATURES_BY_GROUP = [
  {
    title: 'Hair Length',
    features: [
      { id: 'shortHair', label: 'Short Hair' },
      { id: 'longHair', label: 'Long Hair' },
      { id: 'mediumHair', label: 'Medium Hair' },
      { id: 'bald', label: 'Bald' },
    ],
  },
  {
    title: 'Hair Color',
    features: [
      { id: 'blackHair', label: 'Black Hair' },
      { id: 'brownHair', label: 'Brown Hair' },
      { id: 'blondeHair', label: 'Blonde Hair' },
      { id: 'redHair', label: 'Red Hair' },
      { id: 'greyHair', label: 'Grey Hair' },
      { id: 'coloredHair', label: 'Colored Hair' },
    ],
  },
  {
    title: 'Face',
    features: [
      { id: 'beard', label: 'Beard' },
      { id: 'mustache', label: 'Mustache' },
      { id: 'goatee', label: 'Goatee' },
      { id: 'lipstick', label: 'Lipstick' },
    ],
  },
  {
    title: 'Specific',
    features: [
      { id: 'showTeeth', label: 'Showing Teeth' },
      { id: 'avoidingCamera', label: 'Avoiding Camera' },
      { id: 'hairyChest', label: 'Exposed Hairy Chest' },
      { id: 'shirtless', label: 'Shirtless' },
      { id: 'noHairInfo', label: 'No Hair Info' },
    ],
  },
  {
    title: 'Accessories',
    features: [
      { id: 'noAccessories', label: 'No Accessories' },
      { id: 'glasses', label: 'Glasses' },
      { id: 'piercings', label: 'Piercings' },
      { id: 'earrings', label: 'Earrings' },
      { id: 'necklace', label: 'Necklace' },
      { id: 'hat', label: 'Hat' },
      { id: 'scarf', label: 'Scarf' },
      { id: 'hoodie', label: 'Hoodie' },
      { id: 'tie', label: 'Tie' },
      { id: 'headscarf', label: 'Headscarf/Bandana' },
      { id: 'bow', label: 'Bow' },
      { id: 'wearingFlowers', label: 'Wearing Flowers' },
      { id: 'hairTie', label: 'Hair Tie' },
    ],
  },
  {
    title: 'Clothing',
    features: [
      { id: 'whiteShirt', label: 'White Shirt' },
      { id: 'blackClothes', label: 'Black Clothes' },
      { id: 'blueClothes', label: 'Blue Clothes' },
      { id: 'redClothes', label: 'Red Clothes' },
      { id: 'greenClothes', label: 'Green Clothes' },
      { id: 'yellowClothes', label: 'Yellow Clothes' },
      { id: 'purpleClothes', label: 'Purple Clothes' },
      { id: 'pinkClothes', label: 'Pink Clothes' },
      { id: 'orangeClothes', label: 'Orange Clothes' },
      { id: 'brownClothes', label: 'Brown Clothes' },
      { id: 'patternedShirt', label: 'Patterned Shirt' },
      { id: 'wearingStripes', label: 'Wearing Stripes' },
      { id: 'buttonShirt', label: 'Button Shirt' },
    ],
  },
];
