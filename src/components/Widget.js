import React from "react";

export default function Widget({ title, value }) {
  return (
    <div className="widget">
      <div className="widget-title">{title}</div>
      <div className="widget-value">{value}</div>
    </div>
  );
}
