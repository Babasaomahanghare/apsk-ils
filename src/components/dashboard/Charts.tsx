import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

const baseOptions: ChartOptions<"pie" | "bar" | "line"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: "easeOutQuart" },
  plugins: {
    legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
  },
};

export interface PieDatum {
  label: string;
  value: number;
  color: string;
}

export const PieChartCard = ({ data, height = 240 }: { data: PieDatum[]; height?: number }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ height }} className="relative">
      {total === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-gray-400">
          No data yet
        </div>
      ) : (
        <Pie
          data={{
            labels: data.map((d) => d.label),
            datasets: [
              {
                data: data.map((d) => d.value),
                backgroundColor: data.map((d) => d.color),
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          }}
          options={baseOptions as ChartOptions<"pie">}
        />
      )}
    </div>
  );
};

export const BarChartCard = ({
  labels,
  values,
  color = "#38bdf8",
  height = 240,
  label = "Count",
}: {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
  label?: string;
}) => {
  const empty = values.every((v) => v === 0);
  return (
    <div style={{ height }} className="relative">
      {empty ? (
        <div className="h-full flex items-center justify-center text-sm text-gray-400">
          No data yet
        </div>
      ) : (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label,
                data: values,
                backgroundColor: color,
                borderRadius: 6,
                maxBarThickness: 40,
              },
            ],
          }}
          options={{
            ...(baseOptions as ChartOptions<"bar">),
            plugins: { ...(baseOptions.plugins as object), legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0, font: { size: 10 } } },
              x: { ticks: { font: { size: 10 } } },
            },
          }}
        />
      )}
    </div>
  );
};

export const LineChartCard = ({
  labels,
  values,
  color = "#38bdf8",
  height = 240,
  label = "Complaints",
}: {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
  label?: string;
}) => {
  const empty = values.every((v) => v === 0);
  const ref = useRef(null);
  useEffect(() => {}, [ref]);
  return (
    <div style={{ height }} className="relative">
      {empty ? (
        <div className="h-full flex items-center justify-center text-sm text-gray-400">
          No data yet
        </div>
      ) : (
        <Line
          data={{
            labels,
            datasets: [
              {
                label,
                data: values,
                borderColor: color,
                backgroundColor: color + "33",
                fill: true,
                tension: 0.35,
                pointRadius: 3,
              },
            ],
          }}
          options={{
            ...(baseOptions as ChartOptions<"line">),
            plugins: { ...(baseOptions.plugins as object), legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0, font: { size: 10 } } },
              x: { ticks: { font: { size: 10 } } },
            },
          }}
        />
      )}
    </div>
  );
};

// Build last-7-days labels + counts from createdAt timestamps
export const buildLast7Days = (timestamps: number[]) => {
  const labels: string[] = [];
  const buckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString(undefined, { weekday: "short" }));
    buckets[key] = 0;
  }
  for (const t of timestamps) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  }
  return { labels, values: Object.values(buckets) };
};
