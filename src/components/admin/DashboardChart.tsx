"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
