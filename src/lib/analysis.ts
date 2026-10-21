export type SoloCondicao = "umido" | "seco" | "muito-seco";
export type IntensidadeSolar = "fraco" | "moderado" | "forte";

export interface Registro {
  id: string;
  data: string; // ISO
  temperatura: number; // °C
  cisterna: number; // %
  solo: SoloCondicao;
  sol: IntensidadeSolar;
  cultura: string;
  localizacao: string;
}

export type NivelAlerta = "adequada" | "atencao" | "critica";

export interface Analise {
  nivel: NivelAlerta;
  titulo: string;
  resumo: string;
  orientacoes: string[];
  pontuacao: number; // 0-100 risco
  fatores: Fator[];
  dicasCultura: string[];
}

export interface Fator {
  nome: string;
  pontos: number;
  explicacao: string;
}

const DICAS_CULTURA: Record<string, string[]> = {
  Milho: ["O milho é sensível à falta de água na floração e no enchimento dos grãos — priorize a irrigação nessas fases."],
  Feijão: ["O feijão sofre com calor acima de 35°C na floração (queda de flores). Irrigue cedo e mantenha o solo coberto."],
  Mandioca: ["A mandioca tolera bem a seca depois de estabelecida; concentre a água nos primeiros 3 meses após o plantio."],
  "Palma forrageira": ["A palma é muito resistente à seca e pode ser reserva de água e alimento para os animais em períodos críticos."],
  "Capim / pastagem": ["Evite o superpastejo em períodos secos e reserve forragem (silagem ou feno) para os meses sem chuva."],
  Hortaliças: ["Hortaliças precisam de água frequente: use gotejamento ou regador e sombrite de 30–50% nos dias de sol forte."],
  Frutíferas: ["Faça uma bacia (coroa) ao redor do pé com cobertura morta para concentrar a água nas raízes."],
};


export const SOLO_LABEL: Record<SoloCondicao, string> = {
  umido: "Úmido",
  seco: "Seco",
  "muito-seco": "Muito seco",
};

export const SOL_LABEL: Record<IntensidadeSolar, string> = {
  fraco: "Fraco",
  moderado: "Moderado",
  forte: "Forte",
};

export function analisar(r: Omit<Registro, "id" | "data">): Analise {
  let risco = 0;
  const fatores: string[] = [];
  const detalhes: Fator[] = [];
  const add = (nome: string, pontos: number, explicacao: string) =>
    detalhes.push({ nome, pontos, explicacao });
  const orientacoes: string[] = [];

  // Temperatura
  if (r.temperatura >= 36) {
    risco += 30;
    add("Temperatura", 30, `${r.temperatura}°C é muito quente: aumenta a evaporação da água e o estresse das plantas.`);
    fatores.push("temperatura muito elevada");
    orientacoes.push(
      "Evite irrigar nas horas mais quentes (10h às 15h) para reduzir a evaporação."
    );
  } else if (r.temperatura >= 31) {
    risco += 18;
    add("Temperatura", 18, `${r.temperatura}°C é quente: as plantas perdem mais água durante o dia.`);
    fatores.push("temperatura elevada");
    orientacoes.push("Prefira irrigar no início da manhã ou no fim da tarde.");
  } else if (r.temperatura <= 18) {
    risco += 5;
    add("Temperatura", 5, `${r.temperatura}°C é baixa e pode atrasar o crescimento.`);
    fatores.push("temperatura baixa para a maioria das culturas");
  }

  // Cisterna
  if (r.cisterna <= 20) {
    risco += 35;
    add("Cisterna", 35, `Com ${r.cisterna}% de água, a reserva pode acabar em poucos dias.`);
    fatores.push("nível de água da cisterna crítico");
    orientacoes.push(
      "Racione a água: priorize consumo humano, animais e culturas mais sensíveis."
    );
  } else if (r.cisterna <= 50) {
    risco += 18;
    add("Cisterna", 18, `Com ${r.cisterna}% de água, é preciso economizar para não faltar.`);
    fatores.push("nível de água da cisterna baixo");
    orientacoes.push("Use a água da cisterna com moderação e evite desperdícios.");
  }

  // Solo
  if (r.solo === "muito-seco") {
    risco += 25;
    add("Solo", 25, "Solo muito seco indica que as raízes já estão com pouca água disponível.");
    fatores.push("solo muito seco");
    orientacoes.push(
      "Verifique a necessidade de irrigação e considere cobertura morta (palha) para reter umidade."
    );
  } else if (r.solo === "seco") {
    risco += 12;
    add("Solo", 12, "Solo seco: a umidade está diminuindo.");
    fatores.push("solo seco");
    orientacoes.push("Monitore a umidade do solo nos próximos dias.");
  }

  // Sol
  if (r.sol === "forte") {
    risco += 10;
    add("Sol", 10, "Sol forte acelera a perda de água do solo e das folhas.");
    orientacoes.push(
      "Com sol forte, proteja mudas jovens com sombrite ou sombra natural."
    );
  }

  risco = Math.min(100, risco);
  const extra = { fatores: detalhes, dicasCultura: DICAS_CULTURA[r.cultura] ?? ["Observe sua cultura diariamente e ajuste o uso da água conforme a resposta das plantas."] };

  const resumoBase = fatores.length
    ? `Foram registrados: ${fatores.join(", ")}.`
    : "As condições registradas estão dentro da faixa esperada.";

  if (orientacoes.length === 0) {
    orientacoes.push(
      "Mantenha o acompanhamento regular dos dados e o uso racional da água."
    );
  }

  if (risco >= 55) {
    return {
      nivel: "critica",
      titulo: "Situação crítica",
      resumo: resumoBase,
      orientacoes,
      pontuacao: risco,
      ...extra,
    };
  }
  if (risco >= 25) {
    return {
      nivel: "atencao",
      titulo: "Situação de atenção",
      resumo: resumoBase,
      orientacoes,
      pontuacao: risco,
      ...extra,
    };
  }
  return {
    nivel: "adequada",
    titulo: "Situação adequada",
    resumo: resumoBase,
    orientacoes,
    pontuacao: risco,
    ...extra,
  };
}
