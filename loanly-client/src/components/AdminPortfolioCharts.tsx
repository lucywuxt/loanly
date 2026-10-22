import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { PortfolioAnalytics } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PIE_COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#a78bfa', '#f472b6'];

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  fontSize: '12px',
};

export const AdminPortfolioCharts: React.FC<{ analytics: PortfolioAnalytics }> = ({ analytics }) => {
  const sectorData = analytics.bySector.map((s) => ({
    name: s.label,
    Committed: Math.round(s.committedAmount / 1_000_000),
    Disbursed: Math.round(s.disbursedAmount / 1_000_000),
  }));

  const regionData = analytics.byRegion.map((r) => ({
    name: r.label,
    Committed: Math.round(r.committedAmount / 1_000_000),
    Disbursed: Math.round(r.disbursedAmount / 1_000_000),
  }));

  const instrumentData = analytics.byInstrument.map((inst) => ({
    name: inst.label,
    value: Math.round(inst.committedAmount / 1_000_000),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Committed vs. Disbursed by Sector ($M)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Committed" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Disbursed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio by World Bank Region ($M)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#71717a" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Committed" fill="#a78bfa" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Disbursed" fill="#38bdf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Commitments by Financing Instrument ($M)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={instrumentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {instrumentData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value}M`} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
                formatter={(value) => <span style={{ color: '#d4d4d8' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
