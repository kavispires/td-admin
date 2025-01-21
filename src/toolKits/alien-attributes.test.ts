import { alienAttributesUtils } from './alien-attributes';
import { MOCK_ALIEN_ATTRIBUTES, MOCK_ALIEN_ITEMS } from './alien-attributes.mock';

const { getAlienItemSignature, getBestAttributes, getNonClashingItem } = alienAttributesUtils;

describe('alienItems', () => {
  describe('createAlienItem', () => {});

  describe('createAlienAttribute', () => {});

  describe('getBestAttribute', () => {
    it('sample 1', () => {
      const sample = ['144', '23', '370'];
      const expected = 'big';
      expect(getBestAttributes(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, sample)[0].id).toBe(expected);
    });

    it('sample 2', () => {
      const sample = ['205', '143', '12', '23'];
      const expected = 'sou';
      expect(getBestAttributes(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, sample)[0].id).toBe(expected);
    });

    it('sample 3', () => {
      const sample = ['294', '378'];
      const expected = 'bea';
      expect(getBestAttributes(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, sample)[0].id).toBe(expected);
    });

    it('sample 4', () => {
      const sample = ['338', '9', '448'];
      const expected = 'foo';
      expect(getBestAttributes(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, sample)[0].id).toBe(expected);
    });
  });

  describe('getAlienItemSignature', () => {
    it('should generate correct signature for a item', () => {
      const itemId = '338';
      const expectedSignature =
        '*foo+lon+gra!val!bea!kno!pow!sou!mac!rou!con!dan!bui!def!pls!toy!ins!acc!met!old!wri!big!sma!hol!hea';
      expect(getAlienItemSignature(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, itemId)).toBe(expectedSignature);
    });

    it('should generate correct signature for a item with only known attributes', () => {
      const itemId = '338';
      const expectedSignature = '*foo!pow!con!bui!old!big';
      expect(
        getAlienItemSignature(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, itemId, {
          useOnlyKnownAttributes: true,
        }),
      ).toBe(expectedSignature);
    });

    it('should generate correct signature for a item but limited to 5', () => {
      const itemId = '338';
      const expectedSignature = '*foo+lon+gra!val!bea';
      expect(
        getAlienItemSignature(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, itemId, {
          length: 5,
        }),
      ).toBe(expectedSignature);
    });

    it('should generate correct signature for a item with only known attributes and limited to 5', () => {
      const itemId = '338';
      const expectedSignature = '*foo!pow!con!bui!old';
      expect(
        getAlienItemSignature(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES, itemId, {
          useOnlyKnownAttributes: true,
          length: 5,
        }),
      ).toBe(expectedSignature);
    });
  });

  describe('getNonClashingItem', () => {
    it('should return an item that does not clash with the given items', () => {
      const expected = '143';
      expect(getNonClashingItem(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES)[0].item.id).toBe(expected);
    });

    // it('should return an item that does not clash with the given items', () => {
    //   const items = ['144', '23', '370', '294'];
    //   const expected = '378';
    //   expect(getNonClashingItem(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES)).toBe(expected);
    // });

    // it('should return an item that does not clash with the given items', () => {
    //   const items = ['144', '23', '370', '294', '378'];
    //   const expected = '338';
    //   expect(getNonClashingItem(MOCK_ALIEN_ITEMS, MOCK_ALIEN_ATTRIBUTES)).toBe(expected);
    // });
  });
});
