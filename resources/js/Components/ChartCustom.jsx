import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';

const chartConfig = {
    views: {
        label: 'Pembayaran Bulan Ini',
    },
    paid: {
        label: 'Sudah Bayar',
        color: 'hsl(var(--chart-2))',
    },
    unpaid: {
        label: 'Belum Bayar',
        color: 'hsl(var(--chart-1))',
    },
};

export default function ChartCustom({ chartData }) {
    const [activeChart, setActiveChart] = useState('paid');

    const total = useMemo(
        () => ({
            paid: chartData.reduce((acc, curr) => acc + curr.paid, 0),
            unpaid: chartData.reduce((acc, curr) => acc + curr.unpaid, 0),
        }),
        [chartData],
    );

    // Tooltip text dinamis
    const tooltipLabel = {
        paid: 'Sudah bayar (pembayaran bulan ini)',
        unpaid: 'Belum bayar (belum bayar bulan ini)',
    };

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
                    <CardTitle>Grafik Pembayaran</CardTitle>
                    <CardDescription>Menampilkan grafik pembayaran dalam 1 bulan terakhir</CardDescription>
                </div>
                <div className="flex">
                    {['paid', 'unpaid'].map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="even:border-1 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(key)}
                        >
                            <span className="text-xs text-muted-foreground">{chartConfig[key].label}</span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {total[key].toLocaleString()}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('id-ID', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />

                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[180px]"
                                    nameKey={activeChart}
                                    labelFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('id-ID', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });
                                    }}
                                    valueFormatter={(val) => `${val} siswa — ${tooltipLabel[activeChart]}`}
                                />
                            }
                        />

                        <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
