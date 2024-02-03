import { cloneDeep, uniq } from 'lodash';
import { SUGGESTED_COLORS, SUGGESTED_MOODS } from './constants';
import { FirebaseImageCardLibrary, ImageCardData } from './types';

export const hasCardAchievedMinimumRequirements = (card: ImageCardData) => {
  return (
    card.colors &&
    card.colors.length > 0 &&
    card.mood &&
    card.mood.length > 0 &&
    card.focus &&
    card.focus.length > 0 &&
    card.actions &&
    card.actions.length > 0
  );
};

export const buildDictionaries = (data: FirebaseImageCardLibrary) => {
  const colorsDict: string[] = SUGGESTED_COLORS;
  const moodDict: string[] = SUGGESTED_MOODS;
  const elementsDict: string[] = [];
  const actionsDict: string[] = [];

  Object.values(data).forEach((card) => {
    elementsDict.push(...(card?.focus ?? []));
    colorsDict.push(...(card?.colors ?? []));
    moodDict.push(...(card?.mood ?? []));
    elementsDict.push(...(card.elements ?? []));
    actionsDict.push(...(card?.actions ?? []));
  });

  return {
    colors: uniq(colorsDict)
      .sort()
      .map((v) => ({ value: v, label: v })),
    mood: uniq(moodDict)
      .sort()
      .map((v) => ({ value: v, label: v })),
    elements: uniq(elementsDict)
      .sort()
      .map((v) => ({ value: v, label: v })),
    actions: uniq(actionsDict)
      .sort()
      .map((v) => ({ value: v, label: v })),
  };
};

export const cleanupData = (data: FirebaseImageCardLibrary): FirebaseImageCardLibrary => {
  const copy = cloneDeep(data);

  Object.values(copy).forEach((card) => {
    if (card.focus && card.focus.length === 0) {
      delete card.focus;
    }
    if (card.colors && card.colors.length === 0) {
      delete card.colors;
    }
    if (card.mood && card.mood.length === 0) {
      delete card.mood;
    }
    if (card.elements && card.elements.length === 0) {
      delete card.elements;
    }
    if (card.actions && card.actions.length === 0) {
      delete card.actions;
    }
    if (card.highlight === false) {
      delete card.highlight;
    }
  });

  Object.keys(copy).forEach((key) => {
    if (Object.keys(copy[key]).length === 0) {
      delete copy[key];
    }
  });

  return copy;
};
