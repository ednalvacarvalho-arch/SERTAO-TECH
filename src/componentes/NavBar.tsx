import { Link } from "@tanstack/react-router";

const ITENS = [
  { to: "/", label: "🌵 Assistente" },
  { to: "/graficos", label: "📊 Gráficos" },
  { to: "/previsao", label: "🌦️ Previsão" },
  { to: "/mapa", label: "🗺️ Mapa PI" },
] as const;

export function NavBar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-3 py-2">
        <Link to="/" className="mr-2 shrink-0 font-black text-foreground">
          Sertão<span className="text-primary">Tech</span>
        </Link>
        {ITENS.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            activeOptions={{ exact: true }}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-secondary"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
