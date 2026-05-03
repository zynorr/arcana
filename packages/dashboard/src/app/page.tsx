"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Download,
  Gauge,
  MoreHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import { useWebSocket } from "@/hooks/useWebSocket";
import { fetchTransactions } from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import { EXPLORER_URLS, truncateAddress } from "@arcana/shared";

const rangeOptions = [
  { id: "24h", label: "24H", requestRange: "24h" as const },
  { id: "7d", label: "7D", requestRange: "7d" as const },
  { id: "30d", label: "30D", requestRange: "30d" as const },
  { id: "all", label: "ALL", requestRange: "30d" as const },
] as const;

type SelectedRange = (typeof rangeOptions)[number]["id"];

interface RecentTransaction {
  txHash: string;
  blockNumber: number;
  fromAddress: string;
  toAddress: string | null;
  gasUsed: string;
  gasPrice: string;
  status: number;
  isStylus: boolean;
  methodId: string | null;
  timestamp: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<SelectedRange>("24h");
  const activeRange =
    rangeOptions.find((option) => option.id === selectedRange) ??
    rangeOptions[0];
  const { metrics, latest, loading, error, refresh } = useMetrics(
    activeRange.requestRange,
  );

  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [txError, setTxError] = useState<string | null>(null);

  const loadRecentTransactions = useCallback(async () => {
    try {
      const res = await fetchTransactions({ limit: 4 });
      setRecentTransactions(res.data);
      setTxError(null);
    } catch (err) {
      setTxError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    }
  }, []);

  useEffect(() => {
    loadRecentTransactions();
    const interval = setInterval(loadRecentTransactions, 30000);
    return () => clearInterval(interval);
  }, [loadRecentTransactions]);

  const handleRealtimeRefresh = useCallback(() => {
    refresh();
    loadRecentTransactions();
  }, [loadRecentTransactions, refresh]);

  useWebSocket({
    onMetrics: refresh,
    onTransaction: handleRealtimeRefresh,
  });

  const chartData = useMemo(
    () =>
      metrics.map((point) => ({
        ...point,
        label: formatXAxisLabel(point.windowStart, selectedRange),
        avgGasGwei: point.gasPrice / 1e9,
        stylusRatio:
          point.txCount > 0 ? (point.stylusTxCount / point.txCount) * 100 : 0,
      })),
    [metrics, selectedRange],
  );

  const firstPoint = chartData[0];
  const latestPoint = chartData[chartData.length - 1];

  const stylusRatio = latest
    ? latest.txCount > 0
      ? (latest.stylusTxCount / latest.txCount) * 100
      : 0
    : 0;
  const stylusTrend = getPercentDelta(
    stylusRatio,
    firstPoint?.stylusRatio ?? stylusRatio,
  );

  const totalTransactionLoad = chartData.reduce(
    (sum, point) => sum + point.txCount,
    0,
  );
  const txLoadTrend = getPercentDelta(
    latestPoint?.txCount ?? 0,
    firstPoint?.txCount ?? latestPoint?.txCount ?? 0,
  );

  const activeCallers = latest?.uniqueAddresses ?? 0;
  const callerTrend = getPercentDelta(
    activeCallers,
    firstPoint?.uniqueAddresses ?? activeCallers,
  );

  const correlation = calculateCorrelation(
    chartData.map((point) => point.txCount),
    chartData.map((point) => point.avgGasGwei),
  );

  const lowestLatencyPoint = [...chartData]
    .filter((point) => Number.isFinite(point.avgTxSpeed) && point.avgTxSpeed > 0)
    .sort((a, b) => a.avgTxSpeed - b.avgTxSpeed)[0];

  const peakErrorRate = chartData.reduce(
    (max, point) => Math.max(max, point.errorRate),
    0,
  );

  const handleExport = () => {
    if (chartData.length === 0) return;

    const csv = [
      [
        "window_start",
        "label",
        "tx_count",
        "stylus_tx_count",
        "avg_gas_gwei",
        "avg_gas_used",
        "unique_addresses",
        "error_rate_percent",
        "avg_tx_speed",
      ].join(","),
      ...chartData.map((point) =>
        [
          point.windowStart,
          point.label,
          point.txCount,
          point.stylusTxCount,
          point.avgGasGwei.toFixed(6),
          point.gasUsed.toFixed(2),
          point.uniqueAddresses,
          point.errorRate.toFixed(2),
          point.avgTxSpeed.toFixed(2),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `arcana-historical-${selectedRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-16 animate-fade-in font-sans">
      <section className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-xl">
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-accent-indigo/15 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute left-24 top-0 w-20 h-20 bg-accent-violet/10 rounded-full blur-[40px] pointer-events-none" />
          <h1 className="text-5xl font-display font-semibold text-white mb-5 tracking-tight">System Overview</h1>
          <p className="text-lg leading-relaxed text-white/35">
            Multi-metric comparative analysis for Stylus protocols on Arbitrum One. Track performance, gas usage, and transaction patterns across all monitored contracts.
          </p>
          {selectedRange === "all" && (
            <p className="mt-6 text-sm text-white/25 font-medium">
              Using the longest history currently indexed in the system.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-2 shadow-inner backdrop-blur-xl">
          {rangeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedRange(option.id)}
              className={`rounded-xl px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                selectedRange === option.id
                  ? "bg-accent-indigo text-white shadow-glow-sm"
                  : "text-white/35 hover:text-white/80 hover:bg-white/[0.03]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {loading && chartData.length === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="glass-card h-40 animate-pulse rounded-[24px]" />
            ))}
          </div>
          <div className="glass-card h-[460px] animate-pulse rounded-[32px]" />
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="glass-card h-[400px] animate-pulse rounded-[32px]" />
            <div className="glass-card h-[400px] animate-pulse rounded-[32px]" />
          </div>
        </div>
      ) : (
        <>
          <section className="card-grid-3">
            <InsightCard
              title="Stylus Participation"
              value={`${stylusRatio.toFixed(1)}%`}
              accent="cyan"
              icon={<Sparkles className="h-5 w-5" />}
              trend={stylusTrend}
              helper="Share of Stylus transactions in the current window"
            />
            <InsightCard
              title="Transaction Load"
              value={formatCompactNumber(totalTransactionLoad)}
              accent="amber"
              icon={<Zap className="h-5 w-5" />}
              trend={txLoadTrend}
              helper={`Total transactions indexed across ${activeRange.label}`}
            />
            <InsightCard
              title="Active Callers"
              value={formatCompactNumber(activeCallers)}
              accent="indigo"
              icon={<Users className="h-5 w-5" />}
              trend={callerTrend}
              helper="Unique addresses interacting in the latest window"
            />
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-white/[0.005] backdrop-blur-xl group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent pointer-events-none" />
            
            <div className="flex flex-col gap-4 border-b border-white/[0.04] bg-white/[0.015] px-8 py-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
              <div className="flex flex-wrap items-center gap-4">
                <LegendPill color="#6366f1" label="Transactions" glow />
                <LegendPill color="#f59e0b" label="Avg Gas Price (Gwei)" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 hidden sm:block">
                  Export
                </span>
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 transition-all hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12] hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/explorer")}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 transition-all hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12] hover:scale-105"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative h-[460px] p-6 sm:p-10 z-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-white/30 font-medium">
                  No historical data available yet.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="historicalTxGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="rgba(255, 255, 255, 0.03)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke="rgba(255,255,255,0.25)"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickMargin={12}
                        fontWeight={500}
                      />
                      <YAxis
                        yAxisId="txs"
                        stroke="rgba(255,255,255,0.25)"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickFormatter={(value: number) =>
                          compactNumberFormatter.format(value)
                        }
                        tickMargin={12}
                        fontWeight={500}
                      />
                      <YAxis
                        yAxisId="gas"
                        orientation="right"
                        stroke="rgba(255,255,255,0.25)"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickFormatter={(value: number) => formatGwei(value)}
                        tickMargin={12}
                        fontWeight={500}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(5, 5, 8, 0.9)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "16px",
                          color: "#f9fafb",
                          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
                          padding: "16px 20px",
                        }}
                        itemStyle={{ fontWeight: 600, fontSize: "14px" }}
                        labelStyle={{ color: "rgba(255,255,255,0.4)", marginBottom: "10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.windowStart
                            ? formatTooltipLabel(payload[0].payload.windowStart)
                            : ""
                        }
                        formatter={(value, name) => {
                          if (name === "Transactions") {
                            return [
                              compactNumberFormatter.format(Number(value)),
                              "Transactions",
                            ];
                          }

                          return [formatGwei(Number(value)), "Avg Gas Price"];
                        }}
                      />
                      <Area
                        yAxisId="txs"
                        type="monotone"
                        dataKey="txCount"
                        stroke="#6366f1"
                        fill="url(#historicalTxGradient)"
                        strokeWidth={2.5}
                        name="Transactions"
                        activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                      />
                      <Line
                        yAxisId="gas"
                        type="monotone"
                        dataKey="avgGasGwei"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                        name="Avg Gas Price"
                        activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>

                  {latestPoint && (
                    <div className="absolute right-8 top-8 max-w-[240px] rounded-2xl border border-white/[0.08] bg-black/40 p-5 shadow-2xl backdrop-blur-xl z-20">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                        Latest Window
                      </p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-white/60 font-medium">Transactions</span>
                          <span className="font-display font-bold text-accent-indigo text-lg">
                            {compactNumberFormatter.format(latestPoint.txCount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-white/60 font-medium">Avg Gas</span>
                          <span className="font-display font-bold text-accent-amber text-lg">
                            {formatGwei(latestPoint.avgGasGwei)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-12 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/[0.04] bg-white/[0.008] backdrop-blur-xl p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-accent-indigo/5 rounded-full blur-[80px]" />
              <h3 className="mb-10 flex items-center gap-4 text-2xl font-display font-semibold text-white relative z-10">
                <div className="p-3 rounded-2xl bg-accent-indigo/10 text-accent-indigo">
                  <Zap className="h-6 w-6" />
                </div>
                Execution History
              </h3>

              {txError ? (
                <ErrorState message={txError} onRetry={loadRecentTransactions} />
              ) : recentTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] px-4 py-16 text-center text-sm font-medium text-white/30 relative z-10">
                  No recent executions indexed yet.
                </div>
              ) : (
                <div className="space-y-3 relative z-10">
                  {recentTransactions.map((tx) => (
                    <a
                      key={tx.txHash}
                      href={`${EXPLORER_URLS[42161]}/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.08] hover:scale-[1.01] hover:shadow-lg"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-white/[0.06] shadow-inner group-hover:border-accent-indigo/30 transition-colors">
                          <span
                            className={`text-base font-bold ${
                              tx.status === 1 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {tx.isStylus ? "◎" : "◇"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/80 group-hover:text-accent-indigo transition-colors">
                            {getTransactionLabel(tx)}
                          </p>
                          <p className="text-xs text-white/35 mt-0.5 font-medium">
                            {truncateAddress(tx.txHash, 6)} •{" "}
                            {formatExecutionTime(tx.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent-amber">
                          {formatGwei(Number(tx.gasPrice) / 1e9)}
                        </p>
                        <p className="text-[11px] font-mono font-medium text-white/30 mt-0.5">
                          #{tx.blockNumber}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-white/[0.008] backdrop-blur-xl p-10">
              <div className="absolute right-0 top-0 p-12 opacity-[0.02] mix-blend-screen pointer-events-none">
                <Gauge className="h-48 w-48 text-accent-indigo" />
              </div>
              <div className="relative z-10">
                <h3 className="mb-6 text-2xl font-display font-semibold tracking-tight text-white">
                  Correlation Insight
                </h3>
                <p className="mb-10 max-w-xl text-base leading-relaxed text-white/35 font-normal">
                  {buildInsightNarrative(correlation)}
                </p>

                <div className="space-y-5">
                  <InsightRow
                    color="#6366f1"
                    title="Optimal Window Detected"
                    description={
                      lowestLatencyPoint
                        ? `${formatTooltipLabel(lowestLatencyPoint.windowStart)} showed the lowest observed confirmation speed.`
                        : "More data is needed before a clear execution window emerges."
                    }
                  />
                  <InsightRow
                    color="#f59e0b"
                    title="Network Stability"
                    description={
                      peakErrorRate > 0
                        ? `Peak revert pressure reached ${peakErrorRate.toFixed(2)}% during the selected range.`
                        : "No revert spikes were detected across the selected history."
                    }
                  />
                </div>

                <Link
                  href="/explorer"
                  className="mt-12 inline-flex items-center gap-2 text-base font-medium text-accent-indigo transition-all hover:text-accent-indigo/80 hover:gap-3"
                >
                  View Detailed Report
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function InsightCard({
  title,
  value,
  accent,
  icon,
  trend,
  helper,
}: {
  title: string;
  value: string;
  accent: "cyan" | "amber" | "indigo";
  icon: React.ReactNode;
  trend: number | null;
  helper: string;
}) {
  const accentColors = {
    cyan: "from-accent-blue/10 to-transparent border-accent-blue/20 text-accent-blue",
    amber: "from-accent-amber/10 to-transparent border-accent-amber/20 text-accent-amber",
    indigo: "from-accent-indigo/10 to-transparent border-accent-indigo/20 text-accent-indigo",
  };

  const bgGradient = accentColors[accent];
  const trendUp = trend !== null && trend >= 0;

  return (
    <div className={`relative flex flex-col justify-between p-8 rounded-3xl border border-t-2 overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${bgGradient.split(' ').slice(2).join(' ')}`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient.split(' ').slice(0,2).join(' ')} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`} />
      
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/25">
          {title}
        </p>
        <div className={`rounded-xl bg-white/[0.03] p-3 backdrop-blur-md ${accentColors[accent].split(' ').pop()}`}>
          {icon}
        </div>
      </div>

      <div className="relative z-10 mt-4">
        <div className="flex items-end gap-4 mb-2">
          <span className="text-5xl font-display font-semibold tracking-tight text-white">
            {value}
          </span>
          {trend !== null && (
            <span
              className={`mb-2 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
                trendUp ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/15" : "text-red-400 bg-red-500/10 border border-red-500/15"
              }`}
            >
              {trendUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatSignedPercent(trend)}
            </span>
          )}
        </div>
        <p className="text-sm text-white/35 font-normal leading-relaxed">{helper}</p>
      </div>
    </div>
  );
}

function LegendPill({
  color,
  label,
  glow = false,
}: {
  color: string;
  label: string;
  glow?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
      <div
        className={`h-2.5 w-2.5 rounded-full ${glow ? "animate-pulse" : ""}`}
        style={{ backgroundColor: color, boxShadow: glow ? `0 0 10px ${color}` : "none" }}
      />
      <span className="text-xs font-bold text-gray-200">{label}</span>
    </div>
  );
}

function InsightRow({
  color,
  title,
  description,
}: {
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-5 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <div className="h-12 w-1.5 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}50` }} />
      <div>
        <p className="text-base font-medium text-white/70 mb-2">{title}</p>
        <p className="text-sm text-white/35 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function getPercentDelta(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function calculateCorrelation(xValues: number[], yValues: number[]) {
  if (xValues.length < 2 || xValues.length !== yValues.length) {
    return null;
  }

  const xMean = xValues.reduce((sum, value) => sum + value, 0) / xValues.length;
  const yMean = yValues.reduce((sum, value) => sum + value, 0) / yValues.length;

  let numerator = 0;
  let xVariance = 0;
  let yVariance = 0;

  for (let index = 0; index < xValues.length; index += 1) {
    const xDiff = xValues[index] - xMean;
    const yDiff = yValues[index] - yMean;
    numerator += xDiff * yDiff;
    xVariance += xDiff ** 2;
    yVariance += yDiff ** 2;
  }

  if (xVariance === 0 || yVariance === 0) {
    return null;
  }

  return numerator / Math.sqrt(xVariance * yVariance);
}

function buildInsightNarrative(correlation: number | null) {
  if (correlation === null) {
    return "Arcana is still collecting enough history to produce a reliable relationship between throughput and gas price movement for this window.";
  }

  const direction =
    correlation < 0 ? "negative" : correlation > 0 ? "positive" : "neutral";
  const strength =
    Math.abs(correlation) >= 0.6
      ? "strong"
      : Math.abs(correlation) >= 0.3
        ? "moderate"
        : "light";

  return `Across the selected range, ARCANA observes a ${strength} ${direction} correlation (${correlation.toFixed(2)}) between transaction volume and gas pricing. This helps separate healthy throughput expansion from pricing stress before it turns into a user-facing regression.`;
}

function formatXAxisLabel(windowStart: string, range: SelectedRange) {
  if (range === "24h") {
    return utcTimeFormatter.format(new Date(windowStart));
  }

  if (range === "7d") {
    return utcDateFormatter.format(new Date(windowStart));
  }

  return utcDateFormatter.format(new Date(windowStart));
}

function formatTooltipLabel(windowStart: string) {
  return utcDateTimeFormatter.format(new Date(windowStart));
}

function formatGwei(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1) return `${value.toFixed(2)} Gwei`;
  if (value >= 0.01) return `${value.toFixed(3)} Gwei`;
  return `${value.toFixed(4)} Gwei`;
}

function formatSignedPercent(value: number) {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value);
}

function formatExecutionTime(timestamp: string) {
  return `${utcDateTimeFormatter.format(new Date(timestamp))} UTC`;
}

function getTransactionLabel(tx: RecentTransaction) {
  if (tx.isStylus && tx.methodId) {
    return `Stylus ${tx.methodId}`;
  }

  if (tx.isStylus) {
    return "Stylus Execution";
  }

  if (tx.methodId) {
    return `EVM ${tx.methodId}`;
  }

  return "Contract Interaction";
}

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const utcTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const utcDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const utcDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});
