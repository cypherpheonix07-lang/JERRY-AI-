import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Snowflake, CloudLightning, CloudFog, Wind } from "lucide-react";

const codeIcon = (c: number) => {
  if ([0, 1].includes(c)) return Sun;
  if ([2, 3].includes(c)) return Cloud;
  if ([45, 48].includes(c)) return CloudFog;
  if (c >= 51 && c <= 67) return CloudRain;
  if (c >= 71 && c <= 77) return Snowflake;
  if (c >= 80 && c <= 82) return CloudRain;
  if (c >= 95) return CloudLightning;
  return Wind;
};

export const WeatherIntel = () => {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = (lat: number, lon: number) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`)
        .then(r => r.json()).then(setData).catch(e => setErr(String(e)));
    };
    if (!navigator.geolocation) { load(40.7128, -74.006); return; }
    navigator.geolocation.getCurrentPosition(
      p => load(p.coords.latitude, p.coords.longitude),
      () => load(40.7128, -74.006),
      { timeout: 5000 }
    );
  }, []);

  if (err) return <div className="text-destructive text-xs">Telemetry unavailable</div>;
  if (!data) return <div className="text-muted-foreground text-xs animate-pulse">Acquiring weather telemetry...</div>;

  const cur = data.current;
  const Icon = codeIcon(cur.weather_code);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3">
        <Icon className="w-12 h-12 text-primary glow-text" />
        <div>
          <div className="text-3xl font-bold text-primary glow-text">{Math.round(cur.temperature_2m)}°C</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            HUM {cur.relative_humidity_2m}% · UV {cur.uv_index ?? "—"}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1 text-center">
        {data.daily.time.slice(0, 5).map((t: string, i: number) => {
          const I = codeIcon(data.daily.weather_code[i]);
          return (
            <div key={t} className="border border-primary/30 rounded p-1 bg-primary/5">
              <div className="text-[9px] text-muted-foreground">{new Date(t).toLocaleDateString(undefined, { weekday: "short" })}</div>
              <I className="w-4 h-4 mx-auto my-1 text-primary" />
              <div className="text-[10px] text-primary">{Math.round(data.daily.temperature_2m_max[i])}°</div>
              <div className="text-[9px] text-muted-foreground">{Math.round(data.daily.temperature_2m_min[i])}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
