import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CloudRain, Search, Sun, Thermometer } from "lucide-react";
import { buscarLocal, buscarPrevisao, riscoClimatico, type DiaPrevisao, type Local } from "@/lib/clima";

export const Route = createFileRoute("/previsao")({
  head: () => ({
    meta: [
      { title: "Previsão do tempo — SertãoTech" },
      { name: "description", content: "Previsão de temperatura e chuva para 7 dias na sua cidade, com orientações para o semiárido." },
      { property: "og:title", content: "Previsão do tempo — SertãoTech" },
      { property: "og:description", content: "Antecipe dias quentes e secos e planeje o uso da água." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Previsao,
});

function Previsao() {
  const [busca, setBusca] = useState("Teresina");
  const [local, setLocal] = useState<Local | null>(null);
  const [dias, setDias] = useState<DiaPrevisao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const l = await buscarLocal(busca.trim());
      if (!l) { setErro("Cidade não encontrada. Tente escrever de outro jeito."); setDias([]); return; }
      setLocal(l);
      setDias(await buscarPrevisao(l.lat, l.lon));
    } catch {
      setErro("Não foi possível consultar a previsão agora. Verifique a internet e tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  const r = dias.length ? riscoClimatico(dias) : null;
  const orient: string[] = [];
  if (r) {
    if (r.chuva < 2) orient.push("Não há chuva prevista: economize a água da cisterna e evite plantios novos nesta semana.");
    else if (r.chuva >= 15) orient.push("Há chuva prevista: limpe calhas e prepare a cisterna para captar água. Bom momento para plantio.");
    if (r.tmax >= 33) orient.push("Dias quentes: irrigue cedo ou no fim da tarde e proteja animais do sol.");
    if (!orient.length) orient.push("Condições moderadas: mantenha o acompanhamento e o uso racional da água.");
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">🌦️ Previsão do tempo</h1>
        <p className="mt-1 text-muted-foreground">Consulte os próximos 7 dias e complemente seus registros manuais.</p>
      </div>

      <form onSubmit={consultar} className="flex gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Nome da cidade (ex.: Picos)"
          required
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <button disabled={carregando} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 font-bold text-primary-foreground disabled:opacity-60">
          <Search className="h-4 w-4" /> {carregando ? "Buscando…" : "Consultar"}
        </button>
      </form>
      {erro && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}

      {r && local && (
        <>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold text-card-foreground">
              {local.nome}{local.estado ? `, ${local.estado}` : ""}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Risco climático da semana: <strong className="text-card-foreground">{r.risco}/100</strong>
              {r.motivos.length ? ` — ${r.motivos.join(", ")}.` : " — sem fatores de alerta."}
            </p>
            <ul className="mt-3 space-y-2">
              {orient.map((o) => (
                <li key={o} className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">{o}</li>
              ))}
            </ul>
          </section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {dias.map((d) => (
              <div key={d.data} className="rounded-xl border border-border bg-card p-3 text-sm">
                <p className="font-bold capitalize text-card-foreground">
                  {new Date(d.data + "T12:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" })}
                </p>
                <p className="mt-2 flex items-center gap-1 text-card-foreground"><Thermometer className="h-4 w-4 text-destructive" />{Math.round(d.tmax)}° / {Math.round(d.tmin)}°</p>
                <p className="flex items-center gap-1 text-muted-foreground"><CloudRain className="h-4 w-4 text-water" />{d.chuvaProb}% · {d.chuvaMm.toFixed(1)} mm</p>
                <p className="flex items-center gap-1 text-muted-foreground"><Sun className="h-4 w-4 text-warning" />UV {d.uv.toFixed(0)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Fonte: Open-Meteo (previsão automática; pode variar).</p>
        </>
      )}
    </main>
  );
}
