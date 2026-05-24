"use client";

import { useEffect, useRef, useState } from "react";

type Step = {
  ch: string;
  badge: string;
  badgeColor: string;
  m1: string;
  m2: string;
  m3: string;
  text: string;
  info: string;
};

const STEPS_LAB: Step[] = [
  {
    ch: "Boas-vindas",
    badge: "LIMS QUAL",
    badgeColor: "#27AE60",
    m1: "v1.0",
    m2: "2026",
    m3: "ATIVO",
    text: "Olá! Sou o Quali, mascote do LimsQual! Vou guiar você por todo o controle de qualidade da sua indústria de bebidas — do recebimento de insumos até a emissão do laudo.",
    info: "Sistema LimsQual — plataforma completa para laboratório de controle de qualidade industrial. Conforme ISO 17025, ISO 22000 e FSSC 22000.",
  },
  {
    ch: "Dashboard",
    badge: "DASHBOARD",
    badgeColor: "#2980B9",
    m1: "12 OS",
    m2: "3 NC",
    m3: "2 ALRT",
    text: "A primeira tela ao entrar é o Dashboard. Você vê em tempo real: lotes em produção, ordens de serviço em análise, laudos pendentes, não conformidades abertas, insumos em quarentena e calibrações vencendo.",
    info: "Menu lateral → Dashboard. Cards: Lotes em produção • OS em análise • Laudos pendentes • NCs abertas • Insumos em quarentena • Calibrações vencendo.",
  },
  {
    ch: "Produtos",
    badge: "PRODUTOS",
    badgeColor: "#8E44AD",
    m1: "pH 3.2",
    m2: "Brix 11",
    m3: "CO2 3.5",
    text: "Cadastre os produtos que a indústria fabrica com nome, código, sabor, volume, tipo de embalagem PET vidro ou lata, e versão regular diet ou zero. O mais importante são as especificações técnicas com valor mínimo e máximo para cada parâmetro analítico.",
    info: "Menu → Produtos → Novo produto. Especificações obrigatórias: pH • Brix • Densidade • CO₂ • Acidez titulável • Turbidez • Coliformes • Bolores e leveduras.",
  },
  {
    ch: "Insumos",
    badge: "INSUMOS",
    badgeColor: "#16A085",
    m1: "AÇÚCAR",
    m2: "CO2 99%",
    m3: "APROV",
    text: "Cadastre todos os insumos: água de processo, açúcar, dióxido de carbono grau alimentício, concentrados, edulcorantes, acidulantes, conservantes e corantes. Para cada lote recebido registre número do lote, validade e faça upload do certificado de análise do fornecedor.",
    info: "Menu → Insumos → Novo lote de insumo. Status: Em análise → Aprovado ou Reprovado ou Quarentena. Rastreabilidade bidirecional.",
  },
  {
    ch: "Embalagens",
    badge: "EMBALAGEM",
    badgeColor: "#2980B9",
    m1: "PET 2L",
    m2: "TORQ OK",
    m3: "APROV",
    text: "As embalagens têm controle próprio. Para garrafas PET registra peso, espessura de parede, resistência à pressão e torque da tampa. Para vidro retornável registra o número de trips e resultado microbiológico pós-lavagem.",
    info: "Menu → Embalagens. Tipos: PET • Vidro retornável • Vidro não retornável • Lata • Tampa • Rótulo. Cada lote passa por análise antes de liberar para a linha de envase.",
  },
  {
    ch: "Lotes",
    badge: "LOTE 34A",
    badgeColor: "#E85D00",
    m1: "LINHA 2",
    m2: "TURNO M",
    m3: "1200 CX",
    text: "O módulo de lotes é o coração do sistema! Cada lote recebe número automático, data e hora de início, produto fabricado, volume produzido, linha de produção e turno. Registre quais insumos e embalagens foram usados — rastreabilidade completa de ponta a ponta.",
    info: "Menu → Lotes → Novo lote. Status: Em produção → Aguardando análise → Aprovado / Reprovado / Reprocesso → Expedido.",
  },
  {
    ch: "Ordens de serviço",
    badge: "OS-0042",
    badgeColor: "#2C3E50",
    m1: "XAROPE",
    m2: "pH 3.4",
    m3: "PEND",
    text: "Para cada análise o sistema gera uma Ordem de Serviço numerada automaticamente. Selecione o tipo: matéria prima, xarope simples, xarope composto, produto acabado, embalagem, água de processo, swab de superfície, CIP, retenção ou reclamação de cliente.",
    info: "Menu → Amostras → Nova OS. Fluxo: Recebida → Em análise → Aguardando aprovação → Aprovado → Laudo emitido.",
  },
  {
    ch: "Resultados",
    badge: "CONFORME",
    badgeColor: "#27AE60",
    m1: "pH 3.4",
    m2: "Brix 10",
    m3: "OK",
    text: "Na tela da OS o analista lança cada resultado com valor obtido, unidade, método analítico e equipamento. O sistema compara automaticamente com a especificação e indica conforme em verde, atenção em amarelo, ou não conforme em vermelho.",
    info: "Conformidade automática: Conforme ✅ • Atenção ±10% ⚠️ • Não conforme ❌. Resultado fora do limite abre NC automaticamente.",
  },
  {
    ch: "Não conformidades",
    badge: "NC ABERTA",
    badgeColor: "#C0392B",
    m1: "pH ALTO",
    m2: "NC-007",
    m3: "RETER",
    text: "Quando um resultado sai fora do limite o sistema abre uma não conformidade automaticamente. A equipe define a disposição: liberar com justificativa, reter o lote, reprocessar ou descartar. Em seguida registra causa raiz e ação corretiva com prazo.",
    info: "Menu → Não conformidades. Disposição: Liberar • Reter lote • Reprocessar • Descarte. Causa raiz: 5 Porquês ou Ishikawa.",
  },
  {
    ch: "Laudos",
    badge: "LAUDO PDF",
    badgeColor: "#27AE60",
    m1: "MAPA",
    m2: "ANVISA",
    m3: "INMETRO",
    text: "Com os resultados aprovados o sistema gera o laudo em PDF automaticamente. O cabeçalho traz logo, CNPJ, nome e registro do Responsável Técnico, autorização do MAPA, registro da ANVISA e certificado de acreditação do INMETRO ISO 17025. Com QR Code de autenticidade.",
    info: "Menu → Laudos → selecione OS → Emitir laudo. Cabeçalho com todos os registros oficiais. QR Code para verificação pública.",
  },
  {
    ch: "Equipamentos",
    badge: "CALIBRADO",
    badgeColor: "#27AE60",
    m1: "pHmetro",
    m2: "REFRAT",
    m3: "VALID",
    text: "Cadastre todos os equipamentos: pHmetro, refratômetro, densímetro, carbonatômetro, balança analítica, espectrofotômetro, turbidímetro, autoclave e estufa. Equipamento com calibração vencida fica bloqueado automaticamente.",
    info: "Status automático: Calibrado ✅ • Atenção vencendo em 30 dias ⚠️ • Vencido ❌. Bloqueio automático no lançamento de resultados.",
  },
  {
    ch: "CEP / SPC",
    badge: "Cpk 1.42",
    badgeColor: "#27AE60",
    m1: "pH ±0.1",
    m2: "CAPAZ",
    m3: "CTRL",
    text: "O Controle Estatístico de Processo gera automaticamente cartas de controle para pH, Brix e CO₂. Calcula os índices Cp e Cpk. Acima de 1 vírgula 33 o processo está sob controle. Detecta tendências antes de virar não conformidade.",
    info: "Menu → CEP/SPC. Cartas X-barra e R com limites calculados automaticamente. Alertas Regras de Nelson.",
  },
  {
    ch: "APPCC",
    badge: "PCC-02",
    badgeColor: "#8E44AD",
    m1: "PASTEUR",
    m2: "72°C OK",
    m3: "CTRL",
    text: "O módulo APPCC cadastra os Pontos Críticos de Controle com os limites críticos. A equipe lança as leituras por turno. Se uma leitura ultrapassar o limite crítico o sistema abre uma não conformidade automaticamente. Exigência da ISO 22000.",
    info: "Menu → APPCC → Novo PCC. Campos: etapa, tipo de perigo, limite crítico mín/máx, frequência, responsável, ação corretiva.",
  },
  {
    ch: "Portal cliente",
    badge: "CLIENTE",
    badgeColor: "#2980B9",
    m1: "12 LAUD",
    m2: "98% OK",
    m3: "ONLINE",
    text: "O portal do cliente é uma área separada onde cada cliente acessa com login próprio e visualiza apenas os laudos da sua empresa. Pode filtrar por produto, lote e período e baixar qualquer laudo em PDF.",
    info: "Acesso: /portal — login separado do laboratório. O cliente vê: dashboard com % de aprovação, lista de laudos, download de PDF.",
  },
  {
    ch: "Configurações",
    badge: "CONFIG",
    badgeColor: "#7F8C8D",
    m1: "RT ATIVO",
    m2: "MAPA OK",
    m3: "INMET",
    text: "Em configurações você cadastra os dados do laboratório que aparecem em todos os laudos: logo, razão social, CNPJ, Responsável Técnico com registro profissional e assinatura digital, autorização do MAPA, registro da ANVISA, certificado INMETRO e licença da Vigilância Sanitária.",
    info: "Menu → Configurações — apenas perfil Admin. Logo, CNPJ, RT, assinatura digital, MAPA, ANVISA, INMETRO CRL, Vigilância Sanitária.",
  },
];

// Steps reduzidos para o Portal do Cliente — só o que o cliente vê.
const STEPS_PORTAL: Step[] = [
  {
    ch: "Boas-vindas",
    badge: "PORTAL", badgeColor: "#27AE60",
    m1: "v1.0", m2: "2026", m3: "ATIVO",
    text: "Olá! Sou o Quali, mascote do LimsQual! Vou te mostrar como acompanhar os laudos da sua empresa no portal.",
    info: "Você está no Portal do Cliente — sua área pra ver todos os laudos emitidos pelo laboratório para a sua empresa.",
  },
  {
    ch: "Dashboard",
    badge: "DASHBOARD", badgeColor: "#2980B9",
    m1: "12 LAUD", m2: "98% OK", m3: "ATIVO",
    text: "No seu dashboard você vê os indicadores principais: total de amostras enviadas, laudos disponíveis, percentual de aprovação dos seus produtos e os últimos cinco laudos emitidos.",
    info: "Menu Dashboard — KPIs em tempo real + atalho pros últimos laudos.",
  },
  {
    ch: "Meus laudos",
    badge: "LAUDOS", badgeColor: "#8E44AD",
    m1: "OS-001", m2: "APROV", m3: "PDF",
    text: "Em Meus Laudos você acessa a lista completa de laudos. Clique em qualquer um pra abrir o documento oficial com cabeçalho do laboratório, parâmetros analisados, conclusão e QR Code de autenticidade.",
    info: "Menu Laudos — lista filtrável. Cada laudo abre em página própria com botão Imprimir / PDF.",
  },
  {
    ch: "Conclusão",
    badge: "STATUS", badgeColor: "#27AE60",
    m1: "✅ OK", m2: "⚠️ ATEN", m3: "❌ NC",
    text: "Cada laudo tem uma conclusão clara: aprovado em verde, aprovado com restrições em amarelo, ou reprovado em vermelho. Você pode confiar — os parâmetros seguem ISO 17025 e legislação vigente.",
    info: "Conclusão APROVADO / APROVADO COM RESTRIÇÕES / REPROVADO. Detalhes de cada parâmetro disponíveis no PDF.",
  },
  {
    ch: "Imprimir / PDF",
    badge: "PDF", badgeColor: "#2C3E50",
    m1: "QR CODE", m2: "OFICIAL", m3: "BAIXAR",
    text: "Pra baixar ou imprimir um laudo é só abrir e clicar em Imprimir slash PDF. O documento sai no formato oficial com QR Code de verificação de autenticidade — qualquer pessoa pode escanear pra confirmar que é genuíno.",
    info: "Botão Imprimir / PDF aparece no topo de cada laudo. Use Salvar como PDF no diálogo de impressão.",
  },
];

function BottleAvatar({ mouthOpen, waving }: { mouthOpen: boolean; waving: boolean }) {
  return (
    <svg
      width="160"
      height="280"
      viewBox="0 0 200 320"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      {/* sombra */}
      <ellipse cx="100" cy="305" rx="60" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* tampa */}
      <rect x="78" y="14" width="44" height="22" rx="4" fill="#0D3B5E" />
      <rect x="78" y="14" width="44" height="4" rx="2" fill="#1a4c7a" />

      {/* gargalo */}
      <rect x="86" y="34" width="28" height="18" fill="#00B4D8" />

      {/* corpo principal da garrafa */}
      <path
        d="M70 52 Q60 56 60 72 L60 250 Q60 280 100 280 Q140 280 140 250 L140 72 Q140 56 130 52 Z"
        fill="#00B4D8"
      />
      <path
        d="M70 52 Q60 56 60 72 L60 250 Q60 280 100 280 Q140 280 140 250 L140 72 Q140 56 130 52 Z"
        fill="url(#bottleGradient)"
        opacity="0.35"
      />

      {/* etiqueta branca */}
      <rect x="64" y="115" width="72" height="80" fill="white" rx="6" />
      <rect x="64" y="115" width="72" height="14" fill="#0D3B5E" rx="6" />
      <text
        x="100"
        y="125"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        LimsQual
      </text>

      {/* "qualidade" stamp */}
      <text
        x="100"
        y="158"
        textAnchor="middle"
        fill="#0D3B5E"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        QUALI
      </text>
      <text
        x="100"
        y="172"
        textAnchor="middle"
        fill="#00B4D8"
        fontSize="7"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        Controle Qualidade
      </text>
      <line x1="74" y1="180" x2="126" y2="180" stroke="#0D3B5E" strokeOpacity="0.2" />
      <text
        x="100"
        y="190"
        textAnchor="middle"
        fill="#0D3B5E"
        fontSize="6"
        fontFamily="system-ui, sans-serif"
      >
        ISO 17025 · ISO 22000
      </text>

      {/* rosto — olhos */}
      <circle cx="84" cy="80" r="6" fill="white" />
      <circle cx="116" cy="80" r="6" fill="white" />
      <circle cx="85" cy="81" r="3" fill="#0D3B5E" />
      <circle cx="117" cy="81" r="3" fill="#0D3B5E" />
      <circle cx="86" cy="80" r="1" fill="white" />
      <circle cx="118" cy="80" r="1" fill="white" />

      {/* sobrancelhas — pra ficar simpático */}
      <path d="M78 72 Q84 70 90 73" stroke="#0D3B5E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M110 73 Q116 70 122 72" stroke="#0D3B5E" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* bochechas */}
      <ellipse cx="72" cy="95" rx="5" ry="3" fill="#FF6B9D" opacity="0.5" />
      <ellipse cx="128" cy="95" rx="5" ry="3" fill="#FF6B9D" opacity="0.5" />

      {/* boca — anima entre fechada e aberta */}
      {mouthOpen ? (
        <ellipse cx="100" cy="96" rx="7" ry="5" fill="#0D3B5E" />
      ) : (
        <path
          d="M93 95 Q100 100 107 95"
          stroke="#0D3B5E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* braço esquerdo — acena se waving */}
      <g
        style={{
          transformOrigin: "60px 150px",
          transform: waving ? "rotate(-25deg)" : "rotate(0deg)",
          transition: "transform 200ms",
        }}
      >
        <path d="M60 140 Q42 150 38 175" stroke="#00B4D8" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="38" cy="175" r="7" fill="#00B4D8" />
      </g>

      {/* braço direito */}
      <path d="M140 140 Q158 150 162 175" stroke="#00B4D8" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="162" cy="175" r="7" fill="#00B4D8" />

      <defs>
        <linearGradient id="bottleGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(13,59,94,0.4)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

type Props = {
  variant?: "lab" | "portal";
  compact?: boolean;
};

export function QualiMascote({ variant = "lab", compact = false }: Props) {
  const steps = variant === "portal" ? STEPS_PORTAL : STEPS_LAB;

  const [cur, setCur] = useState(0);
  const [muted, setMuted] = useState(true); // começa mudo — usuário liga manualmente
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [waving, setWaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Clique num módulo ou em Play pro tour automático.");

  const typeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const talkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[cur];

  function startTalk() {
    if (talkRef.current) clearInterval(talkRef.current);
    talkRef.current = setInterval(() => setMouthOpen(Math.random() > 0.35), 145);
  }
  function stopTalk() {
    if (talkRef.current) clearInterval(talkRef.current);
    setMouthOpen(false);
  }

  function typeText(txt: string) {
    if (typeRef.current) clearTimeout(typeRef.current);
    setDisplayText("");
    setIsTyping(true);
    let i = 0;
    function tick() {
      if (i < txt.length) {
        setDisplayText(txt.slice(0, ++i));
        typeRef.current = setTimeout(tick, 20);
      } else {
        setIsTyping(false);
      }
    }
    tick();
  }

  function speak(txt: string) {
    if (typeof window === "undefined") return;
    if (muted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = txt
      .replace(/pH/g, "pê agá")
      .replace(/CO₂/g, "CO 2")
      .replace(/°Brix/g, "Brix")
      .replace(/Cpk/g, "Cê Pê Ka")
      .replace(/MAPA/g, "Mapa")
      .replace(/ANVISA/g, "Anvisa")
      .replace(/INMETRO/g, "Inmetro")
      .replace(/ISO/g, "I S O")
      .replace(/FSSC/g, "F S S C")
      .replace(/NC/g, "não conformidade")
      .replace(/OS/g, "Ordem de Serviço")
      .replace(/PET/g, "Pê É Tê")
      .replace(/CIP/g, "C I P")
      .replace(/CoA/g, "C o A")
      .replace(/PDF/g, "Pê Dê Éfe");
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "pt-BR";
    u.rate = 1.0;
    u.pitch = 1.1;
    u.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang === "pt-BR") || voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) u.voice = ptVoice;
    u.onstart = () => {
      startTalk();
      setWaving(true);
      setVoiceStatus("🔊 Quali está falando...");
    };
    u.onend = () => {
      stopTalk();
      setWaving(false);
      setVoiceStatus("✅ Clique em outro módulo.");
    };
    u.onerror = () => {
      stopTalk();
      setVoiceStatus("Voz indisponível neste navegador.");
    };
    window.speechSynthesis.speak(u);
  }

  function showStep(idx: number) {
    const s = steps[idx];
    setCur(idx);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    stopTalk();
    typeText(s.text);
    speak(s.text);
  }

  function togglePlay() {
    if (playing) {
      if (autoRef.current) clearInterval(autoRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      autoRef.current = setInterval(() => {
        setCur((c) => {
          if (c < steps.length - 1) {
            showStep(c + 1);
            return c + 1;
          } else {
            if (autoRef.current) clearInterval(autoRef.current);
            setPlaying(false);
            return c;
          }
        });
      }, 11000);
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (next && typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (!next) speak(step.text);
  }

  useEffect(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.getVoices();
    typeText(steps[0].text);
    setWaving(true);
    const t = setTimeout(() => setWaving(false), 1500);
    return () => {
      clearTimeout(t);
      if (typeRef.current) clearTimeout(typeRef.current);
      if (talkRef.current) clearInterval(talkRef.current);
      if (autoRef.current) clearInterval(autoRef.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className={`flex items-end gap-4 w-full ${compact ? "max-w-md" : "max-w-2xl"}`}>
        <BottleAvatar mouthOpen={mouthOpen} waving={waving} />

        {/* Balão de fala */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 relative min-h-24">
          <div className="absolute left-[-12px] bottom-10 border-t-8 border-b-8 border-r-[12px] border-t-transparent border-b-transparent border-r-slate-200" />
          <div className="absolute left-[-10px] bottom-[41px] border-t-[7px] border-b-[7px] border-r-[11px] border-t-transparent border-b-transparent border-r-white" />
          <p className="text-sm leading-relaxed min-h-16 text-slate-700">
            {displayText}
            {isTyping && <span className="inline-block w-0.5 h-3 bg-slate-400 ml-0.5 animate-pulse" />}
          </p>
          <div className="h-1 bg-slate-100 rounded mt-2">
            <div
              className="h-1 bg-agua rounded transition-all"
              style={{ width: `${Math.round((cur / Math.max(1, steps.length - 1)) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Módulo {cur + 1} de {steps.length} — {step.ch}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400">{voiceStatus}</p>

      {/* Controles */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-petroleo hover:bg-petroleo-dark"
        >
          {playing ? "⏸ Pausar tour" : "▶ Tour automático"}
        </button>
        <button
          onClick={() => showStep(Math.max(0, cur - 1))}
          className="px-4 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50"
          disabled={cur === 0}
        >
          ← Anterior
        </button>
        <button
          onClick={() => showStep(Math.min(steps.length - 1, cur + 1))}
          className="px-4 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50"
          disabled={cur === steps.length - 1}
        >
          Próximo →
        </button>
        <button
          onClick={toggleMute}
          className="px-4 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50"
        >
          {muted ? "🔇 Voz desligada" : "🔊 Voz ligada"}
        </button>
      </div>

      {/* Capítulos */}
      <div className={`flex gap-2 flex-wrap justify-center ${compact ? "max-w-md" : "max-w-2xl"}`}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => showStep(i)}
            className="px-3 py-1 rounded-full text-xs border transition-all"
            style={{
              background: i === cur ? "#0D3B5E" : i < cur ? "#E6F4F9" : "transparent",
              color: i === cur ? "white" : i < cur ? "#0D3B5E" : "#888",
              borderColor: i === cur ? "#0D3B5E" : i < cur ? "#0D3B5E" : "#ddd",
            }}
          >
            {s.ch}
          </button>
        ))}
      </div>

      {/* Info card */}
      <div className={`w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 leading-relaxed ${compact ? "max-w-md" : "max-w-2xl"}`}>
        <p className="font-medium text-slate-800 mb-1">{step.ch}</p>
        <p>{step.info}</p>
      </div>
    </div>
  );
}
