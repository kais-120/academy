import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Box } from '@chakra-ui/react';

export default function PaymentsChart({ data }) {
  return (
    <Box w="full" h="260px">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="paymentsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2C6FD1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2C6FD1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#EEF2F8" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, sans-serif' }}
            axisLine={{ stroke: '#E4E9F2' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #E4E9F2',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            }}
            formatter={(value) => [`${value.toLocaleString('fr-FR')} DT`, 'Encaissé']}
          />
          <Area
            type="monotone"
            dataKey="montant"
            stroke="#1B4B8F"
            strokeWidth={2.5}
            fill="url(#paymentsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
