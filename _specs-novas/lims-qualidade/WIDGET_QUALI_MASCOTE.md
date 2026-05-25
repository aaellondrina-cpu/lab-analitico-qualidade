# WIDGET QUALI — Mascote Animado do LimsQual

## INSTRUÇÃO PARA O CLAUDE CODE
Criar o componente `QualiMascote` e integrar no sistema LimsQual conforme abaixo.

---

## 1. CRIAR O ARQUIVO
Caminho: `components/QualiMascote.tsx`

## 2. ONDE USAR NO SISTEMA
- **Tela de login** — Quali aparece ao lado do formulário dando boas-vindas
- **Dashboard** — botão flutuante no canto inferior direito com ícone de ajuda
- **Primeira vez que o usuário acessa** — modal de tour guiado automático

## 3. BOTÃO FLUTUANTE NO DASHBOARD
Adicionar no layout principal:
```tsx
// Em app/dashboard/layout.tsx ou components/Layout.tsx
<button
  onClick={() => setShowQuali(true)}
  className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
  style={{ background: '#FF6B00' }}
  title="Tour guiado do sistema"
>
  <span style={{ fontSize: 28 }}>🍊</span>
</button>

{showQuali && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      <button onClick={() => setShowQuali(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">×</button>
      <QualiMascote />
    </div>
  </div>
)}
```

---

## 4. CÓDIGO COMPLETO DO COMPONENTE

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    ch: "Boas-vindas",
    badge: "LIMS QUAL", badgeColor: "#27AE60",
    m1: "v1.0", m2: "2026", m3: "ATIVO",
    text: "Olá! Sou o Quali, mascote do LimsQual! Vou guiar você por todo o controle de qualidade da sua indústria de bebidas — do recebimento de insumos até a emissão do laudo.",
    info: "Sistema LimsQual — plataforma completa para laboratório de controle de qualidade industrial. Conforme ISO 17025, ISO 22000 e FSSC 22000."
  },
  {
    ch: "Dashboard",
    badge: "DASHBOARD", badgeColor: "#2980B9",
    m1: "12 OS", m2: "3 NC", m3: "2 ALRT",
    text: "A primeira tela ao entrar é o Dashboard. Você vê em tempo real: lotes em produção, ordens de serviço em análise, laudos pendentes, não conformidades abertas, insumos em quarentena e calibrações vencendo.",
    info: "Menu lateral → Dashboard. Cards: Lotes em produção • OS em análise • Laudos pendentes • NCs abertas • Insumos em quarentena • Calibrações vencendo. Gráficos de conformidade e alertas urgentes."
  },
  {
    ch: "Produtos",
    badge: "PRODUTOS", badgeColor: "#8E44AD",
    m1: "pH 3.2", m2: "Brix 11", m3: "CO2 3.5",
    text: "Cadastre os produtos que a indústria fabrica com nome, código, sabor, volume, tipo de embalagem PET vidro ou lata, e versão regular diet ou zero. O mais importante são as especificações técnicas com valor mínimo e máximo para cada parâmetro analítico.",
    info: "Menu → Produtos → Novo produto. Especificações obrigatórias: pH • Brix • Densidade • CO₂ • Acidez titulável • Turbidez • Coliformes • Bolores e leveduras."
  },
  {
    ch: "Insumos",
    badge: "INSUMOS", badgeColor: "#16A085",
    m1: "AÇÚCAR", m2: "CO2 99%", m3: "APROV",
    text: "Cadastre todos os insumos: água de processo, açúcar, dióxido de carbono grau alimentício, concentrados, edulcorantes, acidulantes, conservantes e corantes. Para cada lote recebido registre número do lote, validade e faça upload do certificado de análise do fornecedor.",
    info: "Menu → Insumos → Novo lote de insumo. Status: Em análise → Aprovado ou Reprovado ou Quarentena. Rastreabilidade bidirecional: dado um lote de produto sabe quais insumos foram usados."
  },
  {
    ch: "Embalagens",
    badge: "EMBALAGEM", badgeColor: "#2980B9",
    m1: "PET 2L", m2: "TORQ OK", m3: "APROV",
    text: "As embalagens têm controle próprio. Para garrafas PET registra peso, espessura de parede, resistência à pressão e torque da tampa. Para vidro retornável registra o número de trips e resultado microbiológico pós-lavagem. Tampas e rótulos também passam por inspeção.",
    info: "Menu → Embalagens. Tipos: PET • Vidro retornável • Vidro não retornável • Lata • Tampa • Rótulo. Cada lote passa por análise antes de liberar para a linha de envase."
  },
  {
    ch: "Lotes",
    badge: "LOTE 34A", badgeColor: "#E85D00",
    m1: "LINHA 2", m2: "TURNO M", m3: "1200 CX",
    text: "O módulo de lotes é o coração do sistema! Cada lote recebe número automático, data e hora de início, produto fabricado, volume produzido, linha de produção e turno. Registre quais insumos e embalagens foram usados — rastreabilidade completa de ponta a ponta.",
    info: "Menu → Lotes → Novo lote. Status: Em produção → Aguardando análise → Aprovado / Reprovado / Reprocesso → Expedido. Rastreabilidade completa por lote com todos os insumos e análises."
  },
  {
    ch: "Ordens de serviço",
    badge: "OS-0042", badgeColor: "#2C3E50",
    m1: "XAROPE", m2: "pH 3.4", m3: "PEND",
    text: "Para cada análise o sistema gera uma Ordem de Serviço numerada automaticamente. Selecione o tipo: matéria prima, xarope simples, xarope composto, produto acabado, embalagem, água de processo, swab de superfície, CIP, retenção ou reclamação de cliente.",
    info: "Menu → Amostras → Nova OS. Fluxo: Recebida → Em análise → Aguardando aprovação → Aprovado → Laudo emitido. Campos: tipo, lote vinculado, ponto de coleta, analista, prazo."
  },
  {
    ch: "Resultados",
    badge: "CONFORME", badgeColor: "#27AE60",
    m1: "pH 3.4", m2: "Brix 10", m3: "OK",
    text: "Na tela da OS o analista lança cada resultado com valor obtido, unidade, método analítico e equipamento. O sistema compara automaticamente com a especificação e indica conforme em verde, atenção em amarelo a menos de dez porcento do limite, ou não conforme em vermelho.",
    info: "Menu → Amostras → clique na OS → Lançar resultados. Conformidade automática: Conforme ✅ • Atenção ±10% ⚠️ • Não conforme ❌. Resultado fora do limite abre NC automaticamente."
  },
  {
    ch: "Não conformidades",
    badge: "NC ABERTA", badgeColor: "#C0392B",
    m1: "pH ALTO", m2: "NC-007", m3: "RETER",
    text: "Quando um resultado sai fora do limite o sistema abre uma não conformidade automaticamente. A equipe define a disposição: liberar com justificativa, reter o lote, reprocessar ou descartar. Em seguida registra causa raiz e ação corretiva com prazo.",
    info: "Menu → Não conformidades. Disposição: Liberar (justificativa obrigatória) • Reter lote • Reprocessar • Descarte (autorização gerencial). Causa raiz: 5 Porquês ou Ishikawa."
  },
  {
    ch: "Laudos e CoA",
    badge: "LAUDO PDF", badgeColor: "#27AE60",
    m1: "MAPA", m2: "ANVISA", m3: "INMETRO",
    text: "Com os resultados aprovados o sistema gera o laudo em PDF automaticamente. O cabeçalho traz logo, CNPJ, nome e registro do Responsável Técnico, autorização do MAPA, registro da ANVISA e certificado de acreditação do INMETRO ISO 17025. Com QR Code de autenticidade.",
    info: "Menu → Laudos → selecione OS → Emitir laudo. Tipos: Laudo de análise • Certificado de Análise CoA • Relatório de rastreabilidade do lote • Boletim mensal. Cabeçalho com todos os registros oficiais."
  },
  {
    ch: "Equipamentos",
    badge: "CALIBRADO", badgeColor: "#27AE60",
    m1: "pHmetro", m2: "REFRAT", m3: "VALID",
    text: "Cadastre todos os equipamentos: pHmetro, refratômetro, densímetro, carbonatômetro, balança analítica, espectrofotômetro, turbidímetro, autoclave e estufa. Para cada um registre as datas de calibração e faça upload do certificado. Equipamento com calibração vencida fica bloqueado automaticamente.",
    info: "Menu → Equipamentos → Novo equipamento. Status automático: Calibrado ✅ • Atenção vencendo em 30 dias ⚠️ • Vencido ❌. Bloqueio automático no lançamento de resultados."
  },
  {
    ch: "CEP e SPC",
    badge: "Cpk 1.42", badgeColor: "#27AE60",
    m1: "pH ±0.1", m2: "CAPAZ", m3: "CTRL",
    text: "O Controle Estatístico de Processo gera automaticamente cartas de controle para pH, Brix e CO₂. Calcula os índices Cp e Cpk. Acima de 1 vírgula 33 o processo está sob controle. Detecta tendências antes de virar não conformidade — sistema preventivo como na Ambev.",
    info: "Menu → CEP/SPC. Cartas X-barra e R com limites calculados automaticamente. Alertas: 7 pontos consecutivos acima/abaixo da linha central detectam deriva antes de NC."
  },
  {
    ch: "APPCC",
    badge: "PCC-02", badgeColor: "#8E44AD",
    m1: "PASTEUR", m2: "72°C OK", m3: "CTRL",
    text: "O módulo APPCC cadastra os Pontos Críticos de Controle com os limites críticos. A equipe lança as leituras por turno. Se uma leitura ultrapassar o limite crítico o sistema abre uma não conformidade automaticamente e notifica o responsável em tempo real. Exigência da ISO 22000.",
    info: "Menu → APPCC → Novo PCC. Campos: etapa do processo, tipo de perigo, limite crítico mín/máx, frequência, responsável, ação corretiva predefinida. Conforme ISO 22000 e FSSC 22000."
  },
  {
    ch: "Portal do cliente",
    badge: "CLIENTE", badgeColor: "#2980B9",
    m1: "12 LAUD", m2: "98% OK", m3: "ONLINE",
    text: "O portal do cliente é uma área separada onde cada cliente acessa com login próprio e visualiza apenas os laudos da sua empresa. Pode filtrar por produto, lote e período e baixar qualquer laudo em PDF. Recebe email automático quando um novo laudo fica disponível.",
    info: "Acesso: /portal — login separado do laboratório. O cliente vê: dashboard com % de aprovação, lista de laudos, download de PDF, gráfico de evolução. Não vê dados de outros clientes."
  },
  {
    ch: "Configurações",
    badge: "CONFIG", badgeColor: "#7F8C8D",
    m1: "RT ATIVO", m2: "MAPA OK", m3: "INMET",
    text: "Em configurações você cadastra os dados do laboratório que aparecem em todos os laudos: logo, razão social, CNPJ, Responsável Técnico com registro profissional e assinatura digital, autorização do MAPA, registro da ANVISA, certificado INMETRO e licença da Vigilância Sanitária.",
    info: "Menu → Configurações — apenas perfil Admin. Dados: Logo, CNPJ, RT (nome, formação, CRF/CRQ/CRBio), assinatura digital, MAPA, ANVISA, INMETRO CRL, Vigilância Sanitária, IBAMA opcional."
  }
]

export default function QualiMascote() {
  const [cur, setCur] = useState(0)
  const [muted, setMuted] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(false)
  const [waving, setWaving] = useState(false)
  const typeRef = useRef<NodeJS.Timeout>()
  const talkRef = useRef<NodeJS.Timeout>()
  const autoRef = useRef<NodeJS.Timeout>()
  const [playing, setPlaying] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('Clique num módulo para ouvir o Quali!')

  const step = steps[cur]

  function startTalk() {
    talkRef.current = setInterval(() => setMouthOpen(Math.random() > 0.35), 145) as any
  }
  function stopTalk() {
    clearInterval(talkRef.current)
    setMouthOpen(false)
  }

  function typeText(txt: string) {
    clearTimeout(typeRef.current)
    setDisplayText('')
    setIsTyping(true)
    let i = 0
    function tick() {
      if (i < txt.length) {
        setDisplayText(txt.slice(0, ++i))
        typeRef.current = setTimeout(tick, 20) as any
      } else {
        setIsTyping(false)
      }
    }
    tick()
  }

  function speak(txt: string) {
    if (muted || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const clean = txt
      .replace(/pH/g, 'pê agá')
      .replace(/CO₂/g, 'CO 2')
      .replace(/°Brix/g, 'Brix')
      .replace(/Cpk/g, 'Cê Pê Ka')
      .replace(/MAPA/g, 'Mapa')
      .replace(/ANVISA/g, 'Anvisa')
      .replace(/INMETRO/g, 'Inmetro')
      .replace(/ISO/g, 'I S O')
      .replace(/FSSC/g, 'F S S C')
      .replace(/NC/g, 'não conformidade')
      .replace(/OS/g, 'Ordem de Serviço')
      .replace(/PET/g, 'Pê É Tê')
      .replace(/CIP/g, 'C I P')
      .replace(/CoA/g, 'C o A')
      .replace(/PDF/g, 'Pê Dê Éfe')
    const u = new SpeechSynthesisUtterance(clean)
    u.lang = 'pt-BR'
    u.rate = 1.0
    u.pitch = 1.1
    u.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const ptVoice = voices.find(v => v.lang === 'pt-BR') || voices.find(v => v.lang.startsWith('pt'))
    if (ptVoice) u.voice = ptVoice
    u.onstart = () => { startTalk(); setWaving(true); setVoiceStatus('🔊 Quali está falando...') }
    u.onend = () => { stopTalk(); setWaving(false); setVoiceStatus('✅ Clique em outro módulo.') }
    u.onerror = () => { stopTalk(); setVoiceStatus('Erro na voz. Verifique o navegador.') }
    window.speechSynthesis.speak(u)
  }

  function showStep(idx: number) {
    const s = steps[idx]
    setCur(idx)
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    stopTalk()
    typeText(s.text)
    speak(s.text)
  }

  function togglePlay() {
    if (playing) {
      clearInterval(autoRef.current)
      setPlaying(false)
    } else {
      setPlaying(true)
      autoRef.current = setInterval(() => {
        setCur(c => {
          if (c < steps.length - 1) { showStep(c + 1); return c + 1 }
          else { clearInterval(autoRef.current); setPlaying(false); return c }
        })
      }, 11000) as any
    }
  }

  useEffect(() => {
    setTimeout(() => { window.speechSynthesis?.getVoices(); showStep(0) }, 800)
    return () => {
      clearTimeout(typeRef.current)
      clearInterval(talkRef.current)
      clearInterval(autoRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="flex items-end gap-6 w-full max-w-2xl">
        {/* SVG PERSONAGEM */}
        <svg width="160" height="280" viewBox="0 0 200 320" style={{ flexShrink: 0 }}>
          {/* Cole aqui o SVG completo do personagem garrafa gerado anteriormente */}
          {/* O SVG está no arquivo WIDGET_QUALI_SVG.svg nesta mesma pasta */}
        </svg>

        {/* BALÃO DE FALA */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 relative min-h-24">
          <div className="absolute left-[-12px] bottom-10 border-t-8 border-b-8 border-r-[12px] border-t-transparent border-b-transparent border-r-gray-200" />
          <div className="absolute left-[-10px] bottom-[41px] border-t-[7px] border-b-[7px] border-r-[11px] border-t-transparent border-b-transparent border-r-white" />
          <p className="text-sm leading-relaxed min-h-16">{displayText}{isTyping && <span className="inline-block w-0.5 h-3 bg-gray-400 ml-0.5 animate-pulse" />}</p>
          <div className="h-1 bg-gray-100 rounded mt-2">
            <div className="h-1 bg-orange-500 rounded transition-all" style={{ width: `${Math.round((cur / (steps.length - 1)) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Módulo {cur + 1} de {steps.length} — {step.ch}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400">{voiceStatus}</p>

      {/* CONTROLES */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={togglePlay} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#E85D00' }}>
          {playing ? '⏸ Pausar tour' : '▶ Tour automático'}
        </button>
        <button onClick={() => showStep(Math.max(0, cur - 1))} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">← Anterior</button>
        <button onClick={() => showStep(Math.min(steps.length - 1, cur + 1))} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">Próximo →</button>
        <button onClick={() => { setMuted(!muted); if (!muted) window.speechSynthesis?.cancel() }} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
          {muted ? '🔇 Voz desligada' : '🔊 Voz ligada'}
        </button>
      </div>

      {/* CAPÍTULOS */}
      <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
        {steps.map((s, i) => (
          <button key={i} onClick={() => showStep(i)}
            className="px-3 py-1 rounded-full text-xs border transition-all"
            style={{
              background: i === cur ? '#E85D00' : i < cur ? '#FFF0E6' : 'transparent',
              color: i === cur ? 'white' : i < cur ? '#E85D00' : '#888',
              borderColor: i === cur ? '#E85D00' : i < cur ? '#E85D00' : '#ddd'
            }}>
            {s.ch}
          </button>
        ))}
      </div>

      {/* INFO CARD */}
      <div className="w-full max-w-2xl bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
        <p className="font-medium text-gray-800 mb-1">{step.ch}</p>
        <p>{step.info}</p>
      </div>
    </div>
  )
}
```

---

## 5. ONDE COLOCAR NA TELA DE LOGIN
```tsx
// Em app/login/page.tsx
<div className="grid grid-cols-2 min-h-screen">
  <div className="flex items-center justify-center bg-orange-50">
    <QualiMascote />
  </div>
  <div className="flex items-center justify-center">
    {/* formulário de login */}
  </div>
</div>
```

---

## 6. NOME DO MASCOTE
- Nome: **Quali** (abreviação de Qualidade)
- Personalidade: simpático, didático, animado
- Função: guiar novos usuários e servir de ajuda contextual

