#!/usr/bin/env python3
import os
import json
import base64
import io
from datetime import datetime, timedelta

try:
    import mysql.connector
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import pandas as pd
except Exception as e:
    # If imports fail, we'll output an error JSON
    err = {"error": "python deps missing", "detail": str(e)}
    print(json.dumps(err))
    raise SystemExit(1)

def fetch_data():
    # Query example: count rows per day for last 7 days from a generic `events` table.
    cfg = {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': int(os.environ.get('DB_PORT', '3306')),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', ''),
        'database': os.environ.get('DB_NAME', 'climatologia_diaria')
    }
    try:
        cnx = mysql.connector.connect(**cfg)
        cursor = cnx.cursor()
        # Try a common pattern: events table with created_at
        try:
            cursor.execute("""
                SELECT 
fecha,tmax,tmin,precipitacion_mm,nombre_mun,nombre_org,nombre_estacion,latitud,longitud,altitud_msnm,emision_fecha,nombre_estado
FROM Datos_Climatologicos
LEFT JOIN Estacion_climatologica
ON Datos_Climatologicos.estacion_id = Estacion_climatologica.id_estacion
LEFT JOIN Municipio 
ON Estacion_climatologica.municipio_id = Municipio.id_municipio
LEFT JOIN Organismo
ON Estacion_climatologica.organismo_id = Organismo.id_organismo
LEFT JOIN Estados_Republica_Mex
ON Municipio.estado_id = Estados_Republica_Mex.id_estado where Datos_Climatologicos.estacion_id=2;
            """)
            rows = cursor.fetchall()
            df = pd.DataFrame(rows, columns=['fecha','precipitacion_mm'])
        except Exception:
            # fallback: try users created_at
            cursor.execute("""
                SELECT DATE(created_at) as d, COUNT(*) as cnt
                FROM users
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at)
            """)
            rows = cursor.fetchall()
            df = pd.DataFrame(rows, columns=['date','count'])
        cursor.close()
        cnx.close()
        return df
    except Exception as e:
        # Return empty df on error
        return pd.DataFrame()

def make_defaults_df():
    today = datetime.utcnow().date()
    dates = [today - timedelta(days=i) for i in range(6, -1, -1)]
    df = pd.DataFrame({'date': dates, 'count': [0]*7})
    return df

def ensure_full(df):
    df2 = make_defaults_df()
    if df.empty:
        return df2
    # normalize types
    df['date'] = pd.to_datetime(df['date']).dt.date
    merged = df2.merge(df, how='left', left_on='date', right_on='date')
    merged['count'] = merged['count_y'].fillna(0).astype(int)
    merged = merged[['date','count']]
    return merged

def plot_and_output(df):
    plt.figure(figsize=(8,4))
    plt.plot(df['date'].astype(str), df['count'], marker='o')
    plt.title('Visitas / registros últimos 7 días')
    plt.xlabel('Fecha')
    plt.ylabel('Conteo')
    plt.grid(alpha=0.3)
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('ascii')
    print(json.dumps({'image_base64': b64}))

if __name__ == '__main__':
    df = fetch_data()
    df = ensure_full(df)
    plot_and_output(df)
