import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.6rem",
    fontSize: 12,
    color: "var(--color-card-foreground)",
  },
} as const;

export function CollectionsAreaChart({
  data,
}: {
  data: { month: string; collected: number; invoiced: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="gInvoiced" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey="invoiced"
          stroke="var(--color-primary)"
          fill="url(#gInvoiced)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="collected"
          stroke="var(--color-teal)"
          fill="url(#gCollected)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({
  data,
  xKey,
  yKey,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} domain={["dataMin - 6", "dataMax + 2"]} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="var(--color-teal)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-teal)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ComparisonBarChart({
  data,
  xKey,
  bars,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} />
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} fill={bar.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

export function MixDonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
