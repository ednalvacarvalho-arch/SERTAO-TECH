import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Droplets,
  Thermometer,
  Sun,
  Sprout,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Waves,
  History,
  ClipboardList,
} from "lucide-react";
import {
  analisar,
  SOLO_LABEL,
  SOL_LABEL,
  type Analise,
  type IntensidadeSolar,
  type Registro,
  type SoloCondicao,
} from "@/lib/analysis";
import { carregarRegistros, salvarRegistros } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SertãoTech — Monitoramento do Semiárido" },
      {
        name: "description",
        content:
          "Plataforma acessível para registrar temperatura, água da cisterna, condição do solo e receber orientações para o convívio com o semiárido.",
      },
      { property: "og:title", content: "SertãoTech — Monitoramento do Semiárido" },
      {
        property: "og:description",
        content:
          "Registre as condições do seu ambiente e receba orientações. Tecnologia acessível, sem necessidade de sensores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CULTURAS = [
  "Milho",
  "Feijão",
  "Mandioca",
  "Palma forrageira",
  "Capim / pastagem",
  "Hortaliças",
  "Frutíferas",
  "Outra",
];

const nivelEstilo = {
  adequada: {
    chip: "bg-success text-success-foreground",
    borda: "border-success/40",
    Icon: CheckCircle2,
  },
  atencao: {
    chip: "bg-warning text-warning-foreground",
    borda: "border-warning/50",
    Icon: AlertTriangle,
  },
  critica: {
    chip: "bg-destructive text-destructive-foreground",
    borda: "border-destructive/50",
    Icon: AlertOctagon,
  },
} as const;

function Index() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [analise, setAnalise] = useState<Analise | null>(null);

  const [temperatura, setTemperatura] = useState("32");
  const [cisterna, setCisterna] = useState("60");
  const [solo, setSolo] = useState<SoloCondicao>("seco");
  const [sol, setSol] = useState<IntensidadeSolar>("forte");
  const [cultura, setCultura] = useState<string>("Milho");
  const [localizacao, setLocalizacao] = useState("");

  useEffect(() => {
    setRegistros(carregarRegistros());
  }, []);

  function registrar(e: React.FormEvent) {
    e.preventDefault();
    const dados = {
      temperatura: Number(temperatura),
      cisterna: Number(cisterna),
      solo,
      sol,
      cultura,
      localizacao: localizacao.trim() || "Não informada",
    };
    if (Number.isNaN(dados.temperatura) || Number.isNaN(dados.cisterna)) return;

    const resultado = analisar(dados);
    setAnalise(resultado);

    const novo: Registro = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      ...dados,
    };
    const atualizados = [novo, ...registros].slice(0, 50);
    setRegistros(atualizados);
    salvarRegistros(atualizados);
  }

  function limparHistorico() {
    setRegistros([]);
    salvarRegistros([]);
  }

  const estilo = analise ? nivelEstilo[analise.nivel] : null;
  const historicoRecente = useMemo(() => registros.slice(0, 8), [registros]);

  return (
    <div className="bg-background">
      {/* Hero */}
      <header className="hero-pattern relative overflow-hidden border-b border-border">
        <div className="sun-glow pointer-events-none absolute inset-x-0 top-0 h-64" />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-14 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary-foreground">
            <Waves className="h-3.5 w-3.5 text-water" />
            Tecnologia para o semiárido
          </span>
          <h1 className="mt-5 text-balance text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            Sertão<span className="text-primary">Tech</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Registre as condições do seu ambiente — água, solo, temperatura e sol —
            e receba orientações práticas. Sem sensores, sem equipamentos caros:
            só você e um dispositivo conectado.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulário */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-card-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              Registrar condições
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados observados hoje na sua propriedade ou comunidade.
            </p>

            <form onSubmit={registrar} className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Thermometer className="h-4 w-4 text-destructive" />
                    Temperatura (°C)
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="-10"
                    max="55"
                    required
                    value={temperatura}
                    onChange={(e) => setTemperatura(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Droplets className="h-4 w-4 text-water" />
                    Cisterna (%)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={cisterna}
                    onChange={(e) => setCisterna(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Sprout className="h-4 w-4 text-success" />
                  Condição do solo
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(Object.keys(SOLO_LABEL) as SoloCondicao[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setSolo(op)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        solo === op
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      {SOLO_LABEL[op]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Sun className="h-4 w-4 text-warning" />
                  Intensidade solar
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(Object.keys(SOL_LABEL) as IntensidadeSolar[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setSol(op)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        sol === op
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      {SOL_LABEL[op]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">
                    Tipo de cultura
                  </span>
                  <select
                    value={cultura}
                    onChange={(e) => setCultura(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CULTURAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-clay" />
                    Localização
                  </span>
                  <input
                    type="text"
                    placeholder="Ex.: Sítio Lagedo, PE"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Analisar e registrar
              </button>
            </form>
          </section>

          {/* Resultado */}
          <section className="space-y-8">
            <div
              className={`rounded-2xl border bg-card p-6 shadow-sm ${
                estilo ? estilo.borda : "border-border"
              }`}
            >
              <h2 className="text-xl font-bold text-card-foreground">
                🌵 Assistente do Sertão
              </h2>

              {analise && estilo ? (
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${estilo.chip}`}
                  >
                    <estilo.Icon className="h-4 w-4" />
                    {analise.titulo}
                  </span>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>Índice de risco</span>
                      <span>{analise.pontuacao}/100</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          analise.nivel === "critica"
                            ? "bg-destructive"
                            : analise.nivel === "atencao"
                              ? "bg-warning"
                              : "bg-success"
                        }`}
                        style={{ width: `${analise.pontuacao}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-card-foreground">
                    {analise.resumo}
                  </p>

                  {analise.fatores.length > 0 && (
                    <>
                      <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        Por que esse resultado?
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {analise.fatores.map((f) => (
                          <li key={f.nome} className="rounded-lg border border-border p-3 text-sm">
                            <div className="flex justify-between font-semibold text-card-foreground">
                              <span>{f.nome}</span>
                              <span className="text-muted-foreground">+{f.pontos} pts</span>
                            </div>
                            <p className="mt-0.5 text-muted-foreground">{f.explicacao}</p>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Orientações
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {analise.orientacoes.map((o, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground"
                      >
                        <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-water" />
                        {o}
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Dica para {cultura}
                  </h3>
                  {analise.dicasCultura.map((d) => (
                    <p key={d} className="mt-2 flex gap-2.5 rounded-lg bg-sand/60 p-3 text-sm text-foreground">
                      <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {d}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  Preencha o formulário ao lado e clique em{" "}
                  <strong>Analisar e registrar</strong> para receber um resumo da
                  situação e orientações práticas.
                </p>
              )}
            </div>

            {/* Histórico */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-card-foreground">
                  <History className="h-5 w-5 text-primary" />
                  Histórico
                </h2>
                {registros.length > 0 && (
                  <button
                    onClick={limparHistorico}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              {historicoRecente.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum registro ainda. Seus registros ficam salvos neste
                  dispositivo.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {historicoRecente.map((r) => {
                    const a = analisar(r);
                    const st = nivelEstilo[a.nivel];
                    return (
                      <li
                        key={r.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${st.chip}`}
                        >
                          <st.Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {r.temperatura}°C · Cisterna {r.cisterna}% · Solo{" "}
                            {SOLO_LABEL[r.solo].toLowerCase()}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.localizacao} · {r.cultura} ·{" "}
                            {new Date(r.data).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.chip}`}
                        >
                          {a.nivel === "adequada"
                            ? "OK"
                            : a.nivel === "atencao"
                              ? "Atenção"
                              : "Crítico"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Sobre */}
        <section className="mt-12 grid gap-4 rounded-2xl border border-border bg-sand/60 p-6 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-4">
            <Waves className="h-6 w-6 text-water" />
            <h3 className="mt-2 font-bold text-card-foreground">Coleta manual</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Os dados são informados pelo próprio usuário — não é preciso nenhum
              sensor ou equipamento.
            </p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h3 className="mt-2 font-bold text-card-foreground">Análise por regras</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              O sistema interpreta as combinações de dados e classifica a situação
              em adequada, atenção ou crítica.
            </p>
          </div>
          <div className="rounded-xl bg-card p-4">
            <Sprout className="h-6 w-6 text-success" />
            <h3 className="mt-2 font-bold text-card-foreground">Pronto para evoluir</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No futuro, a plataforma poderá receber dados automáticos de sensores
              de temperatura, umidade e nível de água (IoT).
            </p>
          </div>
        </section>
      </main>

    </div>
  );
}
