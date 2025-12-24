import { Card, Col, Row, Statistic, Tag, Typography, theme } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SuspectCard, SuspectExtendedInfo } from 'types/tdr';
import { FEATURES_BY_GROUP } from './options';

const { Title } = Typography;
const { useToken } = theme;

// 🎨 Dark Mode Friendly Palette
const COLORS = [
  '#2a7aa8', // Muted Blue
  '#4dbd9c', // Teal
  '#e3a024', // Mustard
  '#d9694c', // Terracotta
  '#9d5bc2', // Purple
  '#c74a68', // Red-Pink
  '#637585', // Grey Blue
  '#8c9e5e', // Olive
];

// Recharts Custom Tooltip Style for Dark Mode
const TOOLTIP_STYLE = {
  backgroundColor: '#1f1f1f',
  border: '1px solid #303030',
  color: '#fff',
  borderRadius: '4px',
};

export function SuspectsStats({
  suspectsQuery,
  suspectsExtendedInfoQuery,
}: {
  suspectsQuery: UseResourceFirestoreDataReturnType<SuspectCard>;
  suspectsExtendedInfoQuery: UseResourceFirestoreDataReturnType<SuspectExtendedInfo>;
}) {
  const { token } = useToken();

  // 1. Merge Data
  const mergedData = useMemo(() => {
    const physical = suspectsQuery.data || {};
    const extended = suspectsExtendedInfoQuery.data || {};
    return mergeSuspectsData(physical, extended);
  }, [suspectsQuery.data, suspectsExtendedInfoQuery.data]);

  const { totalFeatures, totalTraits } = useMemo(() => {
    return {
      totalFeatures: new Set(mergedData.flatMap((suspect) => suspect.features || [])).size,
      totalTraits: new Set(mergedData.flatMap((suspect) => suspect.traits || [])).size,
    };
  }, [mergedData]);

  // 2. Prepare Chart Data
  const charts = useMemo(
    () => ({
      mbti: getRadarStats(mergedData, 'mbti'),
      mbtiPairs: getMBTIPairs(mergedData),
      zodiac: getZodiacStats(mergedData),
      econEdu: getEconomicEducationStats(mergedData),
      orientation: getDistribution(mergedData, 'sexualOrientation'),
      alignment: getDistribution(mergedData, 'alignment'),
      race: getDistribution(mergedData, 'race'),
      age: getDistribution(mergedData, 'age').sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      ),
      gender: getDistribution(mergedData, 'gender'),
      build: getDistribution(mergedData, 'build'),
      height: getDistribution(mergedData, 'height'),
      traits: getTopArrayItems(mergedData, 'traits'),
      decks: getTopArrayItems(mergedData, 'decks'),
      animals: getDistribution(mergedData, 'animal').slice(0, 5),
      nameInitials: getNameInitialStats(mergedData),
      featureGroups: getFeatureStatsByGroup(mergedData),
    }),
    [mergedData],
  );

  // Common Card Props
  const cardStyle = { background: '#141414', border: '1px solid #303030' };

  return (
    <div style={{ minHeight: '100vh', color: token.colorTextLightSolid }}>
      <Title level={3}>Suspect Database Analytics</Title>

      {/* --- SECTION 1: HIGH LEVEL KPI --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={cardStyle} variant="borderless">
            <Statistic
              styles={{ content: { color: '#fff' } }}
              title={<span style={{ color: '#888' }}>Total Profiles</span>}
              value={mergedData.length}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle} variant="borderless">
            <Statistic
              styles={{ content: { color: '#4dbd9c' } }}
              title={<span style={{ color: '#888' }}>Total Features</span>}
              value={totalFeatures}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle} variant="borderless">
            <Statistic
              styles={{ content: { color: '#c74a68' } }}
              title={<span style={{ color: '#888' }}>Total Traits</span>}
              value={totalTraits}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle} variant="borderless"></Card>
        </Col>
      </Row>

      {/* --- SECTION 2: DEMOGRAPHICS --- */}
      <Title level={4} style={{ color: '#888', marginTop: 20 }}>
        Demographics
      </Title>
      <Row gutter={[24, 24]}>
        {/* Race / Ethnicity */}
        <Col lg={6} xs={24}>
          <Card style={cardStyle} title="Race Distribution" variant="borderless">
            <ResponsiveContainer height={250} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={charts.race}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {charts.race.map((_, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend height={36} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Gender Distribution */}
        <Col lg={6} xs={24}>
          <Card style={cardStyle} title="Gender Distribution" variant="borderless">
            <ResponsiveContainer height={250} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={charts.gender}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {charts.gender.map((_, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend height={36} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Age Groups */}
        <Col lg={12} xs={24}>
          <Card style={cardStyle} title="Age Groups" variant="borderless">
            <ResponsiveContainer height={250} width="100%">
              <BarChart data={charts.age}>
                <CartesianGrid stroke="#303030" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#303030' }} />
                <Bar dataKey="value" fill="#2a7aa8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Sexual Orientation */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="Sexual Orientation" variant="borderless">
            <ResponsiveContainer height={250} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={charts.orientation}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={70}
                >
                  {charts.orientation.map((_, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend height={36} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        {/* Name Initials */}
        <Col lg={16} xs={24}>
          <Card style={cardStyle} title="Name Initials (A-Z)" variant="borderless">
            <ResponsiveContainer height={250} width="100%">
              <BarChart data={charts.nameInitials}>
                <CartesianGrid stroke="#303030" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#303030' }} />
                <Legend />
                <Bar dataKey="en" fill="#2a7aa8" name="English Name" radius={[0, 0, 4, 4]} stackId="a" />
                <Bar dataKey="pt" fill="#8c9e5e" name="Portuguese Name" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* --- SECTION 3: PHYSICAL ATTRIBUTES --- */}
      <Title level={4} style={{ color: '#888', marginTop: 20 }}>
        Physical Attributes
      </Title>
      <Row gutter={[24, 24]}>
        {/* Height & Build Donuts */}
        <Col lg={10} xs={24}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card style={cardStyle} title="Body Build" variant="borderless">
                <ResponsiveContainer height={180} width="100%">
                  <PieChart>
                    <Pie cx="50%" cy="50%" data={charts.build} dataKey="value" outerRadius={60}>
                      {charts.build.map((_, index) => (
                        <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend height={36} verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={cardStyle} title="Height" variant="borderless">
                <ResponsiveContainer height={180} width="100%">
                  <PieChart>
                    <Pie cx="50%" cy="50%" data={charts.height} dataKey="value" outerRadius={60}>
                      {charts.height.map((_, index) => (
                        <Cell fill={COLORS[(index + 2) % COLORS.length]} key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend height={36} verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* --- DETAILED FEATURES GRID (PIE CHARTS) --- */}
        <Col lg={24} style={{ marginTop: 20 }} xs={24}>
          <Title level={5} style={{ color: '#888' }}>
            Detailed Feature Analysis
          </Title>
          <Row gutter={[16, 16]}>
            {charts.featureGroups.map((group) => (
              <Col key={group.title} lg={8} md={12} xs={24}>
                <Card style={cardStyle} title={group.title} variant="borderless">
                  <ResponsiveContainer height={250} width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={group.data}
                        dataKey="value"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {group.data.map((_, index) => (
                          <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend
                        align="right"
                        height={100}
                        layout="vertical"
                        verticalAlign="middle"
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* --- SECTION 4: PSYCHOLOGY & BACKGROUND --- */}
      <Title level={4} style={{ color: '#888', marginTop: 20 }}>
        Psychological Profile
      </Title>
      <Row gutter={[24, 24]}>
        {/* Zodiac Radar */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="Zodiac Signs" variant="borderless">
            <ResponsiveContainer height={300} width="100%">
              <RadarChart cx="50%" cy="50%" data={charts.zodiac} outerRadius="70%">
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="subject" fontSize={10} stroke="#888" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#444" />
                <Radar dataKey="A" fill="#9d5bc2" fillOpacity={0.5} name="Count" stroke="#9d5bc2" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* MBTI Dichotomies */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="MBTI Dichotomies" variant="borderless">
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={charts.mbtiPairs} layout="horizontal">
                <CartesianGrid stroke="#303030" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#303030' }} />
                <Legend />
                <Bar dataKey="left" fill="#2a7aa8" name="Left (E, S, T, J)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="right" fill="#d9694c" name="Right (I, N, F, P)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* MBTI Types (Radar) */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="MBTI Types Radar" variant="borderless">
            <ResponsiveContainer height={300} width="100%">
              <RadarChart cx="50%" cy="50%" data={charts.mbti} outerRadius="70%">
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="subject" fontSize={10} stroke="#888" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#444" />
                <Radar dataKey="A" fill="#637585" fillOpacity={0.5} name="Count" stroke="#637585" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Socio-Economic Stacked Bar */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="Education by Class" variant="borderless">
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={charts.econEdu}>
                <CartesianGrid stroke="#303030" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="Basic" fill="#2a7aa8" stackId="a" />
                <Bar dataKey="High" fill="#4dbd9c" stackId="a" />
                <Bar dataKey="College" fill="#e3a024" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Personality Traits Bar */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="Dominant Personality Traits" variant="borderless">
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={charts.traits} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} stroke="#303030" strokeDasharray="3 3" />
                <XAxis hide stroke="#888" type="number" />
                <YAxis dataKey="name" fontSize={12} stroke="#888" type="category" width={100} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#303030' }} />
                <Bar barSize={15} dataKey="value" fill="#e3a024" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Decks */}
        <Col lg={8} xs={24}>
          <Card style={cardStyle} title="Deck Distribution" variant="borderless">
            <ResponsiveContainer height={300} width="100%">
              <PieChart>
                <Pie cx="50%" cy="50%" data={charts.decks} dataKey="value" outerRadius={60}>
                  {charts.decks.map((_, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend height={36} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Alignment & Spirit Animals */}
        <Col lg={6} xs={24}>
          <Card style={cardStyle} title="Top Alignments" variant="borderless">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {charts.alignment.slice(0, 7).map((item) => (
                <div
                  key={item.name}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Tag color="geekblue" style={{ margin: 0 }}>
                    {item.name}
                  </Tag>
                  <strong style={{ color: '#fff' }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col lg={6} xs={24}>
          <Card style={cardStyle} title="Top Spirit Animals" variant="borderless">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {charts.animals.map((item) => (
                <div
                  key={item.name}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ color: '#ccc', textTransform: 'capitalize' }}>{item.name}</span>
                  <Tag color="gold" style={{ margin: 0 }}>
                    {item.value}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// --- HELPER FUNCTIONS ---

type MergedSuspect = SuspectCard & SuspectExtendedInfo;

// 1. Data Merger
export const mergeSuspectsData = (
  physicalData: Record<string, SuspectCard>,
  extendedData: Record<string, SuspectExtendedInfo>,
): MergedSuspect[] => {
  return Object.keys(physicalData).map((key) => {
    const physical = physicalData[key];
    const extended = extendedData[key] || {};
    return { ...physical, ...extended };
  });
};

// 2. Generic Distribution Grouper
export const getDistribution = (data: MergedSuspect[], field: keyof MergedSuspect) => {
  return _.chain(data)
    .filter((item) => item[field] !== undefined && item[field] !== null && item[field] !== '')
    .countBy(field)
    .map((count, key) => ({ name: _.startCase(key), value: count }))
    .orderBy(['value'], ['desc'])
    .value();
};

// 3. Array Item Counter
export const getTopArrayItems = (data: MergedSuspect[], field: keyof MergedSuspect) => {
  return _.chain(data)
    .flatMap(field)
    .filter((item) => !!item)
    .countBy()
    .map((count, key) => ({ name: _.startCase(key), value: count }))
    .orderBy(['value'], ['desc'])
    .take(10)
    .value();
};

// 4. Zodiac Stats
export const getZodiacStats = (data: MergedSuspect[]) => {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const counts = _.countBy(data, 'zodiacSign');
  const max = _.max(Object.values(counts)) || 10;

  return signs.map((sign) => ({
    subject: sign,
    A: counts[sign] || 0,
    fullMark: max,
  }));
};

// 5. Socio-Economic vs Education
export const getEconomicEducationStats = (data: MergedSuspect[]) => {
  const grouped = _.groupBy(data, 'economicClass');
  return Object.keys(grouped)
    .map((econClass) => {
      if (!econClass || econClass === 'undefined' || econClass === 'null') return null;
      const peopleInClass = grouped[econClass];
      const eduCounts = _.countBy(peopleInClass, 'educationLevel');

      return {
        name: _.capitalize(econClass),
        Basic: eduCounts['basic'] || 0,
        College: eduCounts['college'] || 0,
        High: eduCounts['high'] || 0,
        amt: peopleInClass.length,
      };
    })
    .filter(Boolean);
};

// 6. MBTI Pairs Analysis
export const getMBTIPairs = (data: MergedSuspect[]) => {
  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  data.forEach((s) => {
    const mbti = s.mbti?.toUpperCase();
    if (mbti && mbti.length >= 4) {
      if (mbti.includes('E')) counts.E++;
      if (mbti.includes('I')) counts.I++;
      if (mbti.includes('S')) counts.S++;
      if (mbti.includes('N')) counts.N++;
      if (mbti.includes('T')) counts.T++;
      if (mbti.includes('F')) counts.F++;
      if (mbti.includes('J')) counts.J++;
      if (mbti.includes('P')) counts.P++;
    }
  });

  return [
    { name: 'Energy', left: counts.E, right: counts.I },
    { name: 'Info', left: counts.S, right: counts.N },
    { name: 'Decisions', left: counts.T, right: counts.F },
    { name: 'Structure', left: counts.J, right: counts.P },
  ];
};

// 7. Radar Stats for MBTI
export const getRadarStats = (data: MergedSuspect[], field: keyof MergedSuspect) => {
  const counts = _.countBy(data, field);
  const max = _.max(Object.values(counts)) || 10;
  // Ensure we sort keys (e.g., MBTI types) consistently
  return Object.keys(counts)
    .sort()
    .filter((k) => k && k !== 'undefined')
    .map((key) => ({
      subject: key,
      A: counts[key],
      fullMark: max,
    }));
};

// 8. Name Initial Stats (Stacked Bar)
export const getNameInitialStats = (data: MergedSuspect[]) => {
  const counts: Record<string, { pt: number; en: number }> = {};

  data.forEach((suspect) => {
    const ptLetter = suspect.name?.pt?.charAt(0).toUpperCase();
    const enLetter = suspect.name?.en?.charAt(0).toUpperCase();

    // Check PT name
    if (ptLetter && /^[A-Z]$/.test(ptLetter)) {
      if (!counts[ptLetter]) counts[ptLetter] = { pt: 0, en: 0 };
      counts[ptLetter].pt++;
    }

    // Check EN name
    if (enLetter && /^[A-Z]$/.test(enLetter)) {
      if (!counts[enLetter]) counts[enLetter] = { pt: 0, en: 0 };
      counts[enLetter].en++;
    }
  });

  return Object.keys(counts)
    .sort()
    .map((letter) => ({
      name: letter,
      pt: counts[letter].pt,
      en: counts[letter].en,
    }));
};

// 9. Feature Stats by Group
export const getFeatureStatsByGroup = (data: MergedSuspect[]) => {
  // Flatten all features once for easy counting
  const allFeatures = _.flatMap(data, 'features');
  const featureCounts = _.countBy(allFeatures);

  return FEATURES_BY_GROUP.map((group) => {
    const chartData = group.features
      .map((f) => ({
        name: f.label,
        value: featureCounts[f.id] || 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort features descending by count

    return {
      title: group.title,
      data: chartData,
    };
  });
};
