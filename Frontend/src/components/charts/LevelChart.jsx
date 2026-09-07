import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box } from '@chakra-ui/react';

export default function LevelChart({ data }) {
  return (
    <Box w="full" h="260px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#EEF2F8"
          />

          <XAxis
            dataKey="level"
            tick={{
              fontSize: 11,
              fill: '#64748B',
              fontFamily: 'Inter, sans-serif',
            }}
            axisLine={{ stroke: '#E4E9F2' }}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fill: '#64748B',
              fontFamily: 'Inter, sans-serif',
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{ fill: '#EAF1FB' }}
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #E4E9F2',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            }}
            formatter={(value) => [`${value} تلاميد`, 'عدد']}
          />

          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
          >
            {data.map((entry) => (
              <Cell
                key={entry.level}
                fill="#2C6FD1"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}