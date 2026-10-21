import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analisar, type Registro } from "@/lib/analysis";
import { carregarRegistros } from "@/lib/storage";

export const Route = createFileRoute("/graficos")({
  head: () => ({
    meta: [
      { title: "Gráficos e histórico — SertãoTech" },
      { name: "description", content: "Evolução do risco, temperatura e nível da cisterna nos seus registros." },
      { property: "og:title", content: "Gráficos e histórico — SertãoTech" },
      { property: "og:description", content: "Acompanhe se a situação da sua propriedade está melhorando ou piorando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Graficos,
});

const media = (n: number[]) => (n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 10) / 10 : 0);

function Graficos() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  useEffect(() => setRegistros(carregarRegistros()), []);

  const dados = useMemo(
    () =>
      [...registros].reverse().map((r) => ({
        quando: new Date(r.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        risco: analisar(r).pontuacao,
        temperatura: r.temperatura,
        cisterna: r.cisterna,
      })),
    [registros],
  );

  const porDia = useMemo(() => {
    const m = new Map<string, Registro[]>();
    for (const r of registros) {
      const d = new Date(r.data).toLocaleDateString("pt-BR");
      m.set(d, [...(m.get(d) ?? []), r]);
    }
    return [...m.entries()].map(([dia, rs]) => ({
      dia,
      n: rs.length,
      risco: media(rs.map((r) => analisar(r).pontuacao)),
      temp: media(rs.map((r) => r.temperatura)),
      cist: media(rs.map((r) => r.cisterna)),
    }));
  }, [registros]);

  const riscos = dados.map((d) => d.risco);
  const ultimo = riscos.at(-1);
  const anterior = riscos.at(-2);
  const tendencia =
    ultimo === undefined || anterior === undefined
      ? "Faça pelo menos 2 registros para ver a tendência."
      : ultimo < anterior
        ? "📉 A situação está melhorando em relação ao registro anterior."
        : ultimo > anterior
          ? "📈 A situação piorou em relação ao registro anterior."
          : "➖ A situação se manteve igual ao registro anterior.";

  const stats = [
    { label: "Registros", valor: String(registros.length) },
    { label: "Risco médio", valor: `${media(riscos)}/100` },
    { label: "Temp. média", valor: `${media(registros.map((r) => r.temperatura))}°C` },
    { label: "Cisterna média", valor: `${media(registros.map((r) => r.cisterna))}%` },
    { label: "Maior temp.", valor: registros.length ? `${Math.max(...registros.map((r) => r.temperatura))}°C` : "—" },
    { label: "Menor cisterna", valor: registros.length ? `${Math.min(...registros.map((r) => r.cisterna))}%` : "—" },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">📊 Gráficos e histórico</h1>
        <p className="mt-1 text-muted-foreground">Veja como as condições da sua propriedade mudam ao longo do tempo.</p>
      </div>

      {registros.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
          Ainda não há registros. Vá ao <strong>Assistente</strong> e faça seu primeiro registro.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-black text-card-foreground">{s.valor}</p>
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-secondary p-4 font-semibold text-secondary-foreground">{tendencia}</p>

          <Grafico titulo="Evolução do risco" dados={dados} linhas={[{ k: "risco", nome: "Risco (0–100)", cor: "var(--destructive)" }]} />
          <Grafico
            titulo="Temperatura e cisterna"
            dados={dados}
            linhas={[
              { k: "temperatura", nome: "Temperatura (°C)", cor: "var(--warning)" },
              { k: "cisterna", nome: "Cisterna (%)", cor: "var(--water)" },
            ]}
          />

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold text-card-foreground">Comparação por dia</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2">Dia</th><th>Registros</th><th>Risco</th><th>Temp.</th><th>Cisterna</th>
                  </tr>
                </thead>
                <tbody>
                  {porDia.map((d) => (
                    <tr key={d.dia} className="border-t border-border text-card-foreground">
                      <td className="py-2 font-semibold">{d.dia}</td><td>{d.n}</td><td>{d.risco}</td><td>{d.temp}°C</td><td>{d.cist}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Grafico({
  titulo,
  dados,
  linhas,
}: {
  titulo: string;
  dados: Record<string, string | number>[];
  linhas: { k: string; nome: string; cor: string }[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-card-foreground">{titulo}</h2>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="quando" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Tooltip />
            <Legend />
            {linhas.map((l) => (
              <Line key={l.k} type="monotone" dataKey={l.k} name={l.nome} stroke={l.cor} strokeWidth={2.5} dot />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
