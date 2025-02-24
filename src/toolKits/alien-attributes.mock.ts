import type { AlienAttribute, AlienItem } from './alien-attributes';

export const MOCK_ALIEN_ATTRIBUTES: AlienAttribute[] = [
  {
    id: 'foo',
    name: {
      en: 'Food',
      pt: 'Comida',
    },
    description: {
      en: 'edible, sustenance, used for eating or cooking',
      pt: 'comestível, sustento, usado para comer ou cozinhar',
    },
    spriteId: 'sign-11',
    priority: 1,
    known: true,
  },
  {
    id: 'val',
    name: {
      en: 'Valuable',
      pt: 'Valioso',
    },
    description: {
      en: 'precious, rare, money, sentimental value',
      pt: 'precioso, raro, dinheiro, valor sentimental',
    },
    spriteId: 'sign-35',
    priority: 4,
  },
  {
    id: 'bea',
    name: {
      en: 'Beautiful',
      pt: 'Bonito',
    },
    description: {
      en: 'attractiveness, charming, colorful, festive, decoration',
      pt: 'atraente, charmoso, colorido, festivo, decorativo',
    },
    spriteId: 'sign-1',
    priority: 7,
    known: false,
  },
  {
    id: 'kno',
    name: {
      en: 'Knowledge',
      pt: 'Conhecimento',
    },
    description: {
      en: 'wisdom, smarts, idea, gives information',
      pt: 'sabedoria, inteligência, ideia, dá informação',
    },
    spriteId: 'sign-16',
    priority: 14,
  },
  {
    id: 'pow',
    name: {
      en: 'Power',
      pt: 'Força',
    },
    description: {
      en: 'strength, energy, force, electricity',
      pt: 'poder, energia, eletricidade',
    },
    spriteId: 'sign-26',
    priority: 15,
    known: true,
  },
  {
    id: 'sou',
    name: {
      en: 'Sound',
      pt: 'Som',
    },
    description: {
      en: 'makes sound naturally or by design or interaction',
      pt: 'faz som naturalmente ou por design ou interação',
    },
    spriteId: 'sign-31',
    priority: 17,
  },
  {
    id: 'mac',
    name: {
      en: 'Machine',
      pt: 'Máquina',
    },
    description: {
      en: 'has gears, uses powers, works',
      pt: 'tem engrenagens, usa energia, funciona',
    },
    spriteId: 'sign-19',
    priority: 17,
    known: false,
  },
  {
    id: 'rou',
    name: {
      en: 'Round',
      pt: 'Redondo',
    },
    description: {
      en: 'circular, sphere, oval',
      pt: 'circular, esfera, oval',
    },
    spriteId: 'sign-27',
    priority: 19,
  },
  {
    id: 'con',
    name: {
      en: 'Container',
      pt: 'Recipiente',
    },
    description: {
      en: 'holds, stores, or encloses items or substances',
      pt: 'contém, armazena ou envolve itens ou substâncias',
    },
    spriteId: 'sign-17',
    priority: 20,
    known: true,
  },
  {
    id: 'dan',
    name: {
      en: 'Danger',
      pt: 'Perigo',
    },
    description: {
      en: 'hazard, risk, threat',
      pt: 'risco, ameaça',
    },
    spriteId: 'sign-6',
    priority: 21,
  },
  {
    id: 'bui',
    name: {
      en: 'Construction',
      pt: 'Construção',
    },
    description: {
      en: 'building, structure, architecture, housing',
      pt: 'prédios, estrutura, arquitetura, habitação',
    },
    spriteId: 'sign-42',
    priority: 22,
    known: true,
  },
  {
    id: 'def',
    name: {
      en: 'Defense',
      pt: 'Defesa',
    },
    description: {
      en: 'shield, protection, covering',
      pt: 'proteção, cobertura, escudo',
    },
    spriteId: 'sign-7',
    priority: 23,
  },
  {
    id: 'pls',
    name: {
      en: 'Plastic',
      pt: 'Plástico',
    },
    description: {
      en: 'rubber, synthetic material,',
      pt: 'borracha, material sintético',
    },
    spriteId: 'sign-44',
    priority: 25,
  },
  {
    id: 'toy',
    name: {
      en: 'Toy',
      pt: 'Brinquedo',
    },
    description: {
      en: 'plaything, amusement, for children',
      pt: 'laser, prazer, diversão, para crianças',
    },
    spriteId: 'sign-34',
    priority: 26,
    known: false,
  },
  {
    id: 'ins',
    name: {
      en: 'Instrument',
      pt: 'Instrumento',
    },
    description: {
      en: 'utensil, support',
      pt: 'utensílio, suporte',
    },
    spriteId: 'sign-46',
    priority: 28,
  },
  {
    id: 'acc',
    name: {
      en: 'Accessory',
      pt: 'Acessório',
    },
    description: {
      en: 'ornament, attachment, additional piece',
      pt: 'ornamento, anexo, peça adicional',
    },
    spriteId: 'sign-45',
    priority: 29,
    known: false,
  },
  {
    id: 'lon',
    name: {
      en: 'Long',
      pt: 'Longo',
    },
    description: {
      en: 'tall, lengthy',
      pt: 'alto, comprido',
    },
    spriteId: 'sign-18',
    priority: 31,
  },
  {
    id: 'met',
    name: {
      en: 'Metal',
      pt: 'Metal',
    },
    description: {
      en: 'has metallic shiny parts, made of metal',
      pt: 'tem partes metálicas brilhantes, feito de metal',
    },
    spriteId: 'sign-20',
    priority: 32,
  },
  {
    id: 'old',
    name: {
      en: 'Old',
      pt: 'Velho',
    },
    description: {
      en: 'elderly, aged, dated, ancient',
      pt: 'idoso, envelhecido, fora de moda, antigo, ultrapassado',
    },
    spriteId: 'sign-23',
    priority: 34,
    known: true,
  },
  {
    id: 'wri',
    name: {
      en: 'Writing',
      pt: 'Escrita',
    },
    description: {
      en: 'text, letters, or symbols used for communication',
      pt: 'texto, letras ou símbolos usados para comunicação',
    },
    spriteId: 'sign-38',
    priority: 35,
  },
  {
    id: 'big',
    name: {
      en: 'Big',
      pt: 'Grande',
    },
    description: {
      en: 'size, magnitude',
      pt: 'tamanho, magnitude',
    },
    spriteId: 'sign-2',
    priority: 36,
    known: true,
  },
  {
    id: 'sma',
    name: {
      en: 'Small',
      pt: 'Pequeno',
    },
    description: {
      en: 'tiny, miniature, compact',
      pt: 'pequeno, compacto',
    },
    spriteId: 'sign-47',
    priority: 38,
  },
  {
    id: 'gra',
    name: {
      en: 'Grabbable',
      pt: 'Segurável',
    },
    description: {
      en: 'holdable, you normally hold or has a handle or mainly holds something',
      pt: 'com alças, apoio, você normalmente segura, seu trabalho é segurar algo',
    },
    spriteId: 'sign-14',
    priority: 40,
    limited: true,
    known: false,
  },
  {
    id: 'hol',
    name: {
      en: 'Holes',
      pt: 'Buracos',
    },
    description: {
      en: 'has gaps, perforations, or openings',
      pt: 'possui lacunas, perfurações ou aberturas',
    },
    spriteId: 'sign-5',
    priority: 42,
  },
  {
    id: 'hea',
    name: {
      en: 'Heavy',
      pt: 'Pesado',
    },
    description: {
      en: 'weight, mass',
      pt: 'peso, massa',
    },
    spriteId: 'sign-13',
    priority: 43,
    known: false,
  },
];

export const MOCK_ALIEN_ITEMS: AlienItem[] = [
  {
    id: '444',
    name: {
      en: 'bear trap',
      pt: 'armadilha',
    },
    attributes: {
      met: 10,
      pls: -3,
      lon: -3,
      con: -3,
      hol: -1,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: -1,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: 5,
      kno: -3,
      rou: 5,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'CURSE',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '2273',
    name: {
      en: 'beads',
      pt: 'miçangas',
    },
    attributes: {
      met: -3,
      pls: 10,
      lon: -3,
      con: -3,
      hol: 10,
      sou: -3,
      bea: 5,
      pow: -3,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: 5,
      val: -3,
      toy: -3,
      sma: 5,
      def: -3,
      foo: -3,
      big: -10,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'CURSE',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '240',
    name: {
      en: 'broom',
      pt: 'vassoura',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: 10,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: 5,
      hea: -3,
      mac: -3,
      acc: -1,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: 5,
    },
    type: 'CURSE',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '74',
    name: {
      en: 'barrel',
      pt: 'barril',
    },
    attributes: {
      met: -1,
      pls: -3,
      lon: -3,
      con: 10,
      hol: 5,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: -1,
      hea: 5,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: 5,
      val: -3,
      toy: -3,
      sma: -3,
      def: 5,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -1,
    },
    type: 'BLANK',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '205',
    name: {
      en: 'cassete tape',
      pt: 'fita cassete',
    },
    attributes: {
      met: -3,
      pls: 10,
      lon: -3,
      con: -3,
      hol: 10,
      sou: 5,
      bea: -3,
      pow: -3,
      ins: -1,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'BLANK',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '143',
    name: {
      en: 'microphone',
      pt: 'microfone',
    },
    attributes: {
      met: 5,
      pls: 5,
      lon: 5,
      con: -3,
      hol: -3,
      sou: 10,
      bea: -3,
      pow: 5,
      ins: 5,
      hea: -3,
      mac: -1,
      acc: -1,
      dan: -3,
      kno: -3,
      rou: -1,
      val: -3,
      toy: -1,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '403',
    name: {
      en: 'mona lisa',
      pt: 'mona lisa',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -3,
      bea: 10,
      pow: -3,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'BLANK',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '397',
    name: {
      en: 'cash register',
      pt: 'caixa registradora',
    },
    attributes: {
      met: 5,
      pls: -1,
      lon: -3,
      con: 10,
      hol: 5,
      sou: 5,
      bea: -3,
      pow: 10,
      ins: -3,
      hea: -1,
      mac: 10,
      acc: -3,
      dan: -3,
      kno: 5,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: 5,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '448',
    name: {
      en: 'chopsticks',
      pt: 'hashi',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: 5,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: 10,
      hea: -10,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -1,
      def: -3,
      foo: 5,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: 5,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '746',
    name: {
      en: 'punching bag',
      pt: 'saco de pancadas',
    },
    attributes: {
      met: -3,
      pls: -1,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: 5,
      hea: 10,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'BLANK',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '12',
    name: {
      en: 'robot',
      pt: 'robô',
    },
    attributes: {
      met: 5,
      pls: -3,
      lon: -3,
      con: -3,
      hol: -1,
      sou: 5,
      bea: -3,
      pow: -3,
      ins: -3,
      hea: -1,
      mac: 10,
      acc: -3,
      dan: 5,
      kno: 10,
      rou: -3,
      val: 10,
      toy: -1,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '8',
    name: {
      en: 'birthday hat',
      pt: 'chapéu de festa',
    },
    attributes: {
      met: -3,
      pls: -1,
      lon: -3,
      con: -3,
      hol: -1,
      sou: -3,
      bea: 5,
      pow: -3,
      ins: -1,
      hea: -3,
      mac: -3,
      acc: 10,
      dan: -3,
      kno: -3,
      rou: -1,
      val: -3,
      toy: 5,
      sma: -3,
      def: -3,
      foo: -1,
      big: -3,
      old: 5,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '144',
    name: {
      en: 'nuclear plant',
      pt: 'usina nuclear',
    },
    attributes: {
      met: 10,
      pls: -3,
      lon: 5,
      con: -3,
      hol: -1,
      sou: -3,
      bea: -3,
      pow: 10,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: 10,
      kno: -3,
      rou: -1,
      val: -1,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: 5,
      old: -3,
      bui: 10,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '317',
    name: {
      en: 'abacus',
      pt: 'ábaco',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -1,
      bea: -3,
      pow: -3,
      ins: 5,
      hea: -3,
      mac: -3,
      acc: -1,
      dan: -3,
      kno: 10,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: 10,
      bui: -3,
      wri: -1,
      gra: -3,
    },
    type: 'BLANK',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '294',
    name: {
      en: 'snow globe',
      pt: 'globo de neve',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: -3,
      con: 10,
      hol: -3,
      sou: -3,
      bea: 10,
      pow: -3,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: 10,
      val: -3,
      toy: 5,
      sma: -3,
      def: -3,
      foo: -3,
      big: -10,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '120',
    name: {
      en: 'gold bars',
      pt: 'barras de ouro',
    },
    attributes: {
      met: 10,
      pls: -3,
      lon: -1,
      con: -3,
      hol: -3,
      sou: -3,
      bea: 5,
      pow: -3,
      ins: -3,
      hea: 5,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: 10,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: 5,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '270',
    name: {
      en: 'Legos',
      pt: 'Legos',
    },
    attributes: {
      met: -3,
      pls: 10,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -3,
      bea: 5,
      pow: -3,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: 10,
      sma: 5,
      def: -3,
      foo: -3,
      big: -10,
      old: -3,
      bui: 5,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '378',
    name: {
      en: 'confetti',
      pt: 'confete',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -1,
      bea: 10,
      pow: -3,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: 5,
      sma: 10,
      def: -3,
      foo: -3,
      big: -10,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '316',
    name: {
      en: 'hard hat',
      pt: 'capacete de obra',
    },
    attributes: {
      met: -3,
      pls: 5,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: -1,
      hea: -1,
      mac: -3,
      acc: 10,
      dan: -1,
      kno: -3,
      rou: 5,
      val: -3,
      toy: -3,
      sma: -3,
      def: 10,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '338',
    name: {
      en: 'hotdog',
      pt: 'cachorro-quente',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: 5,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: -3,
      hea: -3,
      mac: -3,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: 10,
      big: -3,
      old: -3,
      bui: -3,
      wri: -3,
      gra: 5,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '23',
    name: {
      en: 'piano',
      pt: 'piano',
    },
    attributes: {
      met: -3,
      pls: -1,
      lon: 5,
      con: -3,
      hol: -1,
      sou: 10,
      bea: -1,
      pow: -3,
      ins: 10,
      hea: 5,
      mac: -1,
      acc: -1,
      dan: -3,
      kno: -3,
      rou: -3,
      val: 5,
      toy: -3,
      sma: -10,
      def: -3,
      foo: -3,
      big: 10,
      old: -3,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '9',
    name: {
      en: 'denture',
      pt: 'dentadura',
    },
    attributes: {
      met: -3,
      pls: -3,
      lon: -3,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: -1,
      hea: -3,
      mac: -3,
      acc: 5,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: 5,
      big: -3,
      old: 10,
      bui: -3,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '370',
    name: {
      en: 'windmill',
      pt: 'moinho de vento',
    },
    attributes: {
      met: -1,
      pls: -3,
      lon: 5,
      con: -3,
      hol: -1,
      sou: -3,
      bea: -3,
      pow: -1,
      ins: -3,
      hea: -3,
      mac: -1,
      acc: -3,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -10,
      def: -3,
      foo: -3,
      big: 10,
      old: -1,
      bui: 10,
      wri: -3,
      gra: -3,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '50',
    name: {
      en: 'pen',
      pt: 'caneta',
    },
    attributes: {
      met: -1,
      pls: 5,
      lon: 5,
      con: -3,
      hol: -3,
      sou: -3,
      bea: -3,
      pow: -3,
      ins: 5,
      hea: -3,
      mac: -3,
      acc: -1,
      dan: -3,
      kno: -1,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: -3,
      bui: -3,
      wri: 10,
      gra: 5,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
  {
    id: '264',
    name: {
      en: 'crucifix',
      pt: 'crucifixo',
    },
    attributes: {
      met: -1,
      pls: 5,
      lon: 5,
      con: -3,
      hol: -1,
      sou: -3,
      bea: -1,
      pow: -3,
      ins: 5,
      hea: -3,
      mac: -3,
      acc: 5,
      dan: -3,
      kno: -3,
      rou: -3,
      val: -3,
      toy: -3,
      sma: -3,
      def: -3,
      foo: -3,
      big: -3,
      old: 5,
      bui: -3,
      wri: -3,
      gra: 5,
    },
    type: 'ITEM',
    inquiries: 0,
    offerings: [],
  },
];
