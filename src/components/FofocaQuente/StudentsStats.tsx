import type { useTDResource } from '@hooks/useTDResource';
import { Card, Col, Row, Statistic, Typography, theme } from 'antd';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TeenageStudentData } from 'types/tdr';

const { Title } = Typography;
const { useToken } = theme;

// 🎨 Dark Mode Friendly Palette
const COLORS = [
  '#2a7aa8', // Muted Blue
  '#4dbd9c', // Teal
  '#e3a024', // Mustard
  '#d9694c', // Terracotta
  '#9d5bc2', // Purple
  '#637585', // Slate Gray
  '#8c9e5e', // Olive
  '#c74a68', // Rose
  '#5a8db8', // Sky Blue
  '#ba6f3a', // Rust
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1f1f1f',
  border: '1px solid #444',
  borderRadius: '4px',
};

/**
 * Add colors to data for charts
 */
const addColorsToData = (data: { name: string; value: number }[], offset = 0) => {
  return data.map((entry, index) => ({
    ...entry,
    fill: COLORS[(index + offset) % COLORS.length],
  }));
};

/**
 * Format social group ID to display name
 */
const formatSocialGroup = (socialGroupId: string): string => {
  return _.startCase(socialGroupId);
};

export function StudentsStats({ data }: ReturnType<typeof useTDResource<TeenageStudentData>>) {
  const { token } = useToken();

  // Convert dictionary to array
  const studentsArray = useMemo(() => Object.values(data ?? {}), [data]);

  // Calculate KPIs
  const stats = useMemo(() => {
    const uniqueSocialGroups = new Set(studentsArray.map((s) => s.socialGroupId)).size;
    const maleCount = studentsArray.filter((s) => s.gender === 'male').length;
    const femaleCount = studentsArray.filter((s) => s.gender === 'female').length;
    const genderBalance =
      studentsArray.length > 0
        ? Math.round((Math.min(maleCount, femaleCount) / studentsArray.length) * 100)
        : 0;

    return {
      total: studentsArray.length,
      uniqueSocialGroups,
      genderBalance,
      maleCount,
      femaleCount,
    };
  }, [studentsArray]);

  // Prepare Chart Data
  const charts = useMemo(
    () => ({
      socialGroup: getDistribution(studentsArray, 'socialGroupId').map((item) => ({
        ...item,
        name: formatSocialGroup(item.name),
      })),
      gender: getDistribution(studentsArray, 'gender'),
      ethnicity: getDistribution(studentsArray, 'ethnicity'),
      age: getDistribution(studentsArray, 'age').sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      ),
      build: getDistribution(studentsArray, 'build'),
      height: getDistribution(studentsArray, 'height'),
      nameInitials: getNameInitialStats(studentsArray),
    }),
    [studentsArray],
  );

  // Common Card Props
  const cardStyle = { background: '#141414', border: '1px solid #303030' };

  return (
    <div style={{ minHeight: '100vh', color: token.colorTextLightSolid }}>
      <Title level={3}>Student Database Analytics</Title>

      {/* --- SECTION 1: HIGH LEVEL KPI --- */}
      <Row
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col span={6}>
          <Card
            style={cardStyle}
            variant="borderless"
          >
            <Statistic
              styles={{ content: { color: '#fff' } }}
              title={<span style={{ color: '#888' }}>Total Students</span>}
              value={stats.total}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={cardStyle}
            variant="borderless"
          >
            <Statistic
              styles={{ content: { color: '#4dbd9c' } }}
              title={<span style={{ color: '#888' }}>Social Groups</span>}
              value={stats.uniqueSocialGroups}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={cardStyle}
            variant="borderless"
          >
            <Statistic
              styles={{ content: { color: '#c74a68' } }}
              suffix="%"
              title={<span style={{ color: '#888' }}>Gender Balance</span>}
              value={stats.genderBalance}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={cardStyle}
            variant="borderless"
          >
            <Statistic
              styles={{ content: { color: '#e3a024' } }}
              title={<span style={{ color: '#888' }}>M / F Ratio</span>}
              value={`${stats.maleCount} / ${stats.femaleCount}`}
            />
          </Card>
        </Col>
      </Row>

      {/* --- SECTION 2: DEMOGRAPHICS --- */}
      <Title
        level={4}
        style={{ color: '#888', marginTop: 20 }}
      >
        Demographics
      </Title>
      <Row gutter={[24, 24]}>
        {/* Gender Distribution */}
        <Col
          lg={6}
          xs={24}
        >
          <Card
            style={cardStyle}
            title="Gender Distribution"
            variant="borderless"
          >
            <ResponsiveContainer
              height={250}
              width="100%"
            >
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={addColorsToData(charts.gender)}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  height={36}
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Ethnicity Distribution */}
        <Col
          lg={6}
          xs={24}
        >
          <Card
            style={cardStyle}
            title="Ethnicity Distribution"
            variant="borderless"
          >
            <ResponsiveContainer
              height={250}
              width="100%"
            >
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={addColorsToData(charts.ethnicity, 2)}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  height={36}
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Age/Grade Distribution */}
        <Col
          lg={12}
          xs={24}
        >
          <Card
            style={cardStyle}
            title="Grade Level Distribution"
            variant="borderless"
          >
            <ResponsiveContainer
              height={250}
              width="100%"
            >
              <BarChart data={charts.age}>
                <CartesianGrid
                  stroke="#303030"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  stroke="#888"
                />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: '#303030' }}
                />
                <Bar
                  dataKey="value"
                  fill="#2a7aa8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* --- SECTION 3: SOCIAL DYNAMICS --- */}
      <Title
        level={4}
        style={{ color: '#888', marginTop: 20 }}
      >
        Social Dynamics
      </Title>
      <Row gutter={[24, 24]}>
        {/* Social Groups */}
        <Col
          lg={8}
          xs={24}
        >
          <Card
            style={cardStyle}
            title="Social Groups"
            variant="borderless"
          >
            <ResponsiveContainer
              height={300}
              width="100%"
            >
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={addColorsToData(charts.socialGroup)}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  height={100}
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Name Initials */}
        <Col
          lg={16}
          xs={24}
        >
          <Card
            style={cardStyle}
            title="Name Initials (A-Z)"
            variant="borderless"
          >
            <ResponsiveContainer
              height={300}
              width="100%"
            >
              <BarChart data={charts.nameInitials}>
                <CartesianGrid
                  stroke="#303030"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  stroke="#888"
                />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: '#303030' }}
                />
                <Legend />
                <Bar
                  dataKey="en"
                  fill="#2a7aa8"
                  name="English Name"
                  radius={[0, 0, 4, 4]}
                  stackId="a"
                />
                <Bar
                  dataKey="pt"
                  fill="#8c9e5e"
                  name="Portuguese Name"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* --- SECTION 4: PHYSICAL ATTRIBUTES --- */}
      <Title
        level={4}
        style={{ color: '#888', marginTop: 20 }}
      >
        Physical Attributes
      </Title>
      <Row gutter={[24, 24]}>
        {/* Build & Height Donuts */}
        <Col
          lg={12}
          xs={24}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                style={cardStyle}
                title="Body Build"
                variant="borderless"
              >
                <ResponsiveContainer
                  height={220}
                  width="100%"
                >
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={addColorsToData(charts.build)}
                      dataKey="value"
                      outerRadius={70}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend
                      height={36}
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                style={cardStyle}
                title="Height"
                variant="borderless"
              >
                <ResponsiveContainer
                  height={220}
                  width="100%"
                >
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={addColorsToData(charts.height, 2)}
                      dataKey="value"
                      outerRadius={70}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend
                      height={36}
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

// --- HELPER FUNCTIONS ---

/**
 * Generic distribution grouper for single-value fields
 */
const getDistribution = (data: TeenageStudentData[], field: keyof TeenageStudentData) => {
  return _.chain(data)
    .filter((item) => item[field] !== undefined && item[field] !== null && item[field] !== '')
    .countBy(field)
    .map((count, key) => ({ name: _.startCase(key), value: count }))
    .orderBy(['value'], ['desc'])
    .value();
};

/**
 * Count name initials for both EN and PT
 */
const getNameInitialStats = (data: TeenageStudentData[]) => {
  const counts: Record<string, { pt: number; en: number }> = {};

  data.forEach((student) => {
    const ptLetter = student.name?.pt?.charAt(0).toUpperCase();
    const enLetter = student.name?.en?.charAt(0).toUpperCase();

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
