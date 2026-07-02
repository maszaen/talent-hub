"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ChartData = {
  name: string;
  total: number;
};

export function DashboardChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Overview Submission</CardTitle>
        <CardDescription>
          Jumlah submission portofolio, sertifikat, dan skill per bulan.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorZero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(156, 163, 175, 0.2)' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: '1px solid rgba(156, 163, 175, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: '#000'
                }}
              />
              <Bar 
                dataKey="total" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              >
                {data.map((entry, index) => {
                  const maxVal = Math.max(...data.map(d => d.total));
                  let color = "url(#colorMid)";
                  
                  if (entry.total === 0) {
                    color = "url(#colorZero)";
                  } else if (maxVal > 0 && entry.total >= maxVal * 0.75) {
                    color = "url(#colorHigh)";
                  } else if (maxVal > 0 && entry.total <= maxVal * 0.25) {
                    color = "url(#colorLow)";
                  }

                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
