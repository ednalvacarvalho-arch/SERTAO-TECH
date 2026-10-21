// Open-Meteo: API meteorológica gratuita, sem chave.
export interface DiaPrevisao {
  data: string;
  tmax: number;
  tmin: number;
  chuvaProb: number;
  chuvaMm: number;
  uv: number;
}

export interface Local {
  nome: string;
  estado?: string;
  lat: number;
  lon: number;
}

export async function buscarLocal(nome: string): Promise<Local | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nome)}&count=1&language=pt&countryCode=BR`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Falha ao buscar local");
  const j = await r.json();
  const l = j.results?.[0];
  return l ? { nome: l.name, estado: l.admin1, lat: l.latitude, lon: l.longitude } : null;
}

const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max";

type Diario = { time: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; precipitation_probability_max?: number[]; precipitation_sum?: number[]; uv_index_max?: number[] };
function montar(d: Diario): DiaPrevisao[] {
  return d.time.map((t, i) => ({
    data: t,
    tmax: Number(d.temperature_2m_max?.[i] ?? 0),
    tmin: Number(d.temperature_2m_min?.[i] ?? 0),
    chuvaProb: Number(d.precipitation_probability_max?.[i] ?? 0),
    chuvaMm: Number(d.precipitation_sum?.[i] ?? 0),
    uv: Number(d.uv_index_max?.[i] ?? 0),
  }));
}

export async function buscarPrevisao(lat: number, lon: number): Promise<DiaPrevisao[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${DAILY}&timezone=America%2FFortaleza&forecast_days=7`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Falha ao buscar previsão");
  return montar((await r.json()).daily);
}

export async function buscarPrevisaoVarios(locais: { lat: number; lon: number }[]): Promise<DiaPrevisao[][]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${locais.map((l) => l.lat).join(",")}&longitude=${locais.map((l) => l.lon).join(",")}&daily=${DAILY}&timezone=America%2FFortaleza&forecast_days=7`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Falha ao buscar previsão");
  const j = await r.json();
  return (Array.isArray(j) ? j : [j]).map((x) => montar(x.daily));
}

/** Risco climático (0–100) para os próximos 7 dias, a partir da previsão. */
export function riscoClimatico(dias: DiaPrevisao[]) {
  const tmax = dias.reduce((a, d) => a + d.tmax, 0) / dias.length;
  const chuva = dias.reduce((a, d) => a + d.chuvaMm, 0);
  const uv = Math.max(...dias.map((d) => d.uv));
  let risco = 0;
  const motivos: string[] = [];
  if (tmax >= 36) { risco += 35; motivos.push(`máximas médias de ${tmax.toFixed(1)}°C`); }
  else if (tmax >= 33) { risco += 20; motivos.push(`máximas médias de ${tmax.toFixed(1)}°C`); }
  if (chuva < 2) { risco += 40; motivos.push("praticamente sem chuva prevista"); }
  else if (chuva < 15) { risco += 20; motivos.push(`pouca chuva prevista (${chuva.toFixed(1)} mm)`); }
  if (uv >= 11) { risco += 15; motivos.push("radiação solar extrema"); }
  else if (uv >= 8) { risco += 8; motivos.push("radiação solar muito alta"); }
  risco = Math.min(100, risco);
  const nivel = risco >= 55 ? "critica" : risco >= 25 ? "atencao" : "adequada";
  return { risco, nivel, tmax, chuva, motivos } as const;
}
