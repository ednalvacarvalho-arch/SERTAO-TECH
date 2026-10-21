import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { buscarPrevisaoVarios, riscoClimatico } from "@/lib/clima";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa do risco no Piauí — SertãoTech" },
      { name: "description", content: "Indicador de risco climático para municípios do Piauí, baseado na previsão do tempo." },
      { property: "og:title", content: "Mapa do risco no Piauí — SertãoTech" },
      { property: "og:description", content: "Veja quais regiões do Piauí exigem mais atenção nos próximos dias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mapa,
});

const MUNICIPIOS = [
  { nome: "Parnaíba", lat: -2.9, lon: -41.78 },
  { nome: "Piripiri", lat: -4.27, lon: -41.78 },
  { nome: "Campo Maior", lat: -4.83, lon: -42.17 },
  { nome: "Teresina", lat: -5.09, lon: -42.8 },
  { nome: "Valença do Piauí", lat: -6.4, lon: -41.75 },
  { nome: "Floriano", lat: -6.77, lon: -43.02 },
  { nome: "Oeiras", lat: -7.02, lon: -42.13 },
  { nome: "Picos", lat: -7.08, lon: -41.47 },
  { nome: "Uruçuí", lat: -7.23, lon: -44.55 },
  { nome: "Paulistana", lat: -8.13, lon: -41.14 },
  { nome: "São João do Piauí", lat: -8.36, lon: -42.25 },
  { nome: "São Raimundo Nonato", lat: -9.01, lon: -42.7 },
  { nome: "Bom Jesus", lat: -9.07, lon: -44.36 },
  { nome: "Corrente", lat: -10.44, lon: -45.16 },
];

// Limites aproximados do Piauí
const LON = [-46.1, -40.3];
const LAT = [-2.6, -11.0];
const W = 300;
const H = 440;
const px = (lon: number) => ((lon - LON[0]!) / (LON[1]! - LON[0]!)) * W;
const py = (lat: number) => ((lat - LAT[0]!) / (LAT[1]! - LAT[0]!)) * H;

const COR = { adequada: "var(--success)", atencao: "var(--warning)", critica: "var(--destructive)" } as const;
const NOME = { adequada: "Adequada", atencao: "Atenção", critica: "Crítica" } as const;

type Res = (typeof MUNICIPIOS)[number] & ReturnType<typeof riscoClimatico>;

function Mapa() {
  const [res, setRes] = useState<Res[]>([]);
  const [erro, setErro] = useState("");
  const [sel, setSel] = useState<Res | null>(null);

  useEffect(() => {
    buscarPrevisaoVarios(MUNICIPIOS)
      .then((todos) => setRes(MUNICIPIOS.map((m, i) => ({ ...m, ...riscoClimatico(todos[i] ?? []) }))))
      .catch(() => setErro("Não foi possível carregar os dados agora. Verifique a internet."));
  }, []);

  const ordenados = [...res].sort((a, b) => b.risco - a.risco);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">🗺️ Mapa do risco no Piauí</h1>
        <p className="mt-1 text-muted-foreground">
          Indicador de risco climático para os próximos 7 dias em cidades de referência de cada região.
        </p>
      </div>
      {erro && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}
      {!erro && res.length === 0 && <p className="text-muted-foreground">Carregando dados…</p>}

      {res.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4">
            <svg viewBox={`-20 -10 ${W + 40} ${H + 20}`} className="mx-auto w-full max-w-sm">
              <rect x={0} y={0} width={W} height={H} rx={16} fill="var(--sand)" opacity={0.4} />
              <text x={W - 8} y={18} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">N ↑</text>
              {res.map((m) => (
                <g key={m.nome} onClick={() => setSel(m)} className="cursor-pointer">
                  <circle cx={px(m.lon)} cy={py(m.lat)} r={sel?.nome === m.nome ? 14 : 10} fill={COR[m.nivel]} stroke="var(--card)" strokeWidth={2} />
                  <text x={px(m.lon) + 14} y={py(m.lat) + 4} fontSize={10} fontWeight={700} fill="var(--foreground)">{m.nome}</text>
                </g>
              ))}
            </svg>
            <div className="mt-2 flex justify-center gap-3 text-xs text-muted-foreground">
              {(Object.keys(COR) as (keyof typeof COR)[]).map((k) => (
                <span key={k} className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full" style={{ background: COR[k] }} /> {NOME[k]}
                </span>
              ))}
            </div>
            {sel && (
              <div className="mt-3 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                <strong>{sel.nome}</strong>: risco {sel.risco}/100 · máx. média {sel.tmax.toFixed(1)}°C · chuva {sel.chuva.toFixed(1)} mm
                {sel.motivos.length ? ` — ${sel.motivos.join(", ")}.` : "."}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-bold text-card-foreground">Ranking de atenção</h2>
            <ul className="mt-2 divide-y divide-border">
              {ordenados.map((m) => (
                <li key={m.nome} className="flex items-center justify-between py-2 text-sm">
                  <button onClick={() => setSel(m)} className="flex items-center gap-2 font-semibold text-card-foreground">
                    <span className="h-3 w-3 rounded-full" style={{ background: COR[m.nivel] }} />
                    {m.nome}
                  </button>
                  <span className="text-muted-foreground">{m.risco}/100 · {m.chuva.toFixed(0)} mm</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        <strong>Importante:</strong> este indicador usa apenas a previsão do tempo (Open-Meteo) para uma cidade de
        referência e <strong>não representa todo o município</strong>. As condições de cada propriedade (cisterna,
        solo, cultura) podem ser bem diferentes — use o Assistente para a sua análise local. Posições no mapa são aproximadas.
      </p>
    </main>
  );
}
