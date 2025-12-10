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
