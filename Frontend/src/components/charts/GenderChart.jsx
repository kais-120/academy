import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@chakra-ui/react";

export default function GenderChart({ data }) {
  const chartData = data.map((item, index) => ({
    name: item.gender,
    value: item.count,
    color: index === 0 ? "#3182CE" : "#E53E3E",
  }));

  console.log(chartData);

  return (
    <Box w="full" h="220px">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #E4E9F2",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
            }}
            formatter={(value, name) => [
              `${value} تلاميذ`,
              name,
            ]}
          />

          <Legend
            iconType="circle"
            iconSize={9}
            formatter={(value) => (
              <span
                style={{
                  fontSize: 13,
                  color: "#334463",
                }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}