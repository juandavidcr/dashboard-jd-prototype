import React, { useEffect, useState } from "react";

export default function Analytics() {
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/analytics`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.image_base64) {
          setImg(`data:image/png;base64,${data.image_base64}`);
        } else {
          setError('No image returned');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2>Analytics</h2>
      {loading && <p>Cargando gráfica...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {img && <img src={img} alt="Analytics chart" style={{ maxWidth: '100%' }} />}
    </div>
  );
}
