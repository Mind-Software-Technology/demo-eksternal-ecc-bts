'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { formatIDR } from '../../data/format'

const fmtMonth = (key) =>
  new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(`${key}-01`))

const fmtCompact = (n) =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(n)

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { revenue, orders } = payload[0].payload
  return (
    <div className="admin-chart-tooltip">
      <div className="admin-chart-tooltip__title">{fmtMonth(label)}</div>
      <div className="admin-chart-tooltip__row">
        <span>Pendapatan</span>
        <b>{formatIDR(revenue)}</b>
      </div>
      <div className="admin-chart-tooltip__row">
        <span>Pesanan</span>
        <b>{orders}</b>
      </div>
    </div>
  )
}

export default function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue-500)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--blue-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="month"
          tickFormatter={fmtMonth}
          tick={{ fontSize: 12, fill: 'var(--muted)' }}
          axisLine={{ stroke: 'var(--line)' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtCompact}
          tick={{ fontSize: 12, fill: 'var(--muted)' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--blue-600)"
          strokeWidth={2}
          fill="url(#revenueFill)"
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
