import React from "react";

export default function ChartPlaceholder({ title }) {
  return (
    <div className="chart-placeholder">
      <div className="chart-title">{title}</div>
      <div className="chart-box">Gráfico (placeholder)</div>
    </div>
  );
}
