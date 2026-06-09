import { useState, useRef, useEffect } from "react";

// ── Design tokens ──────────────────────────────────────────────
const C = {
  bg: "#0B0F1A",
  surface: "#131929",
  card: "#1A2238",
  cardHover: "#1E2840",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  indigo: "#5B6AF0",
  indigoLight: "#7C89F4",
  indigoDim: "rgba(91,106,240,0.12)",
  green: "#22C98E",
  greenDim: "rgba(34,201,142,0.12)",
  amber: "#F5A623",
  amberDim: "rgba(245,166,35,0.12)",
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.10)",
  purple: "#A855F7",
  purpleDim: "rgba(168,85,247,0.12)",
  whatsapp: "#25D366",
  whatsappDim: "rgba(37,211,102,0.12)",
  text: "#E8EBF4",
  muted: "#7B86A8",
  faint: "#3A4460",
};

const today = "2026-06-09";
const fmt = (n) => n >= 1000 ? `€${(n/1000).toFixed(0)}K` : `€${n}`;

// ── Seed data ──────────────────────────────────────────────────
const initLeads = [
  { id: 1, name: "Marco Ferretti", phone: "+39 333 1234567", email: "marco@gama.it", source: "Facebook Ads", commercialStage: "Lead", operationalStage: null, value: 8500, notes: "", created: "2026-05-20", messages: [] },
  { id: 2, name: "Sofia Ricci", phone: "+39 347 9876543", email: "sofia@nexo.it", source: "Referral", commercialStage: "Appuntamento", operationalStage: null, value: 24000, notes: "Interessata al pacchetto premium", created: "2026-05-15", messages: [] },
  { id: 3, name: "Lucia Bianchi", phone: "+39 320 5544332", email: "lucia@techwave.io", source: "Sito Web", commercialStage: "Preventivo", operationalStage: "Ordine", value: 15000, notes: "", created: "2026-05-01", messages: [] },
  { id: 4, name: "Andrea Conti", phone: "+39 348 7788990", email: "andrea@bludesign.it", source: "Google Ads", commercialStage: "Contratto", operationalStage: "Merce", value: 31000, notes: "Conferma consegna entro giugno", created: "2026-04-10", messages: [], merce: { fornitore: "Ceramiche Nord Srl", statoMerce: "In transito", dataArrivo: "2026-06-14", note: "Pallet 3 colli, consegna mattina" } },
  { id: 5, name: "Chiara Marini", phone: "+39 366 2233445", email: "chiara@solaris.eu", source: "Instagram", commercialStage: "Contratto", operationalStage: "Posa", value: 19500, notes: "", created: "2026-04-22", messages: [] },
  { id: 6, name: "Luca Romano", phone: "+39 334 6677889", email: "luca@romano.it", source: "Referral", commercialStage: "Contratto", operationalStage: "Saldo", value: 12800, notes: "Saldo in attesa bonifico", created: "2026-03-15", messages: [] },
];

const initCampaigns = [
  { id: 1, name: "Facebook Lead Gen Aprile", channel: "Facebook Ads", budget: 1200, leads: 34, conversions: 8, revenue: 48000, status: "Conclusa" },
  { id: 2, name: "Google Search Maggio", channel: "Google Ads", budget: 800, leads: 21, conversions: 5, revenue: 32000, status: "Conclusa" },
  { id: 3, name: "Instagram Stories Giugno", channel: "Instagram", budget: 500, leads: 12, conversions: 2, revenue: 9500, status: "Attiva" },
  { id: 4, name: "Email Nurturing Q2", channel: "Email", budget: 200, leads: 55, conversions: 11, revenue: 67000, status: "Attiva" },
];

// ── WhatsApp message templates ─────────────────────────────────
const WA_TEMPLATES = {
  Appuntamento: "Buongiorno {nome}, la confermiamo per l'appuntamento in programma. Il nostro consulente la contatterà a breve per definire data e orario. Cordiali saluti.",
  Preventivo: "Buongiorno {nome}, abbiamo preparato il preventivo in base alle sue esigenze. Lo riceverà via email nelle prossime ore. Rimaniamo a disposizione per qualsiasi domanda.",
  Contratto: "Buongiorno {nome}, siamo lieti di confermarle la firma del contratto. Il nostro team operativo la contatterà per avviare la gestione del suo ordine.",
  Ordine: "Buongiorno {nome}, il suo ordine è stato preso in carico. Stiamo procedendo con la preparazione della merce. La terremo aggiornata su ogni avanzamento.",
  Merce: "Buongiorno {nome}, il materiale del suo ordine è arrivato. A breve verrà contattata per fissare la posa. Grazie per la sua fiducia.",
  Posa: "Buongiorno {nome}, la posa è stata completata con successo. Speriamo che sia soddisfatta del risultato. Il nostro team è a sua disposizione per qualsiasi necessità.",
  Saldo: "Buongiorno {nome}, ricordiamo gentilmente che è in attesa il saldo finale. Per comodità, può effettuare il pagamento tramite bonifico bancario. La ringraziamo.",
};

// ── Tiny UI primitives ─────────────────────────────────────────
const Btn = ({ onClick, children, variant = "primary", small, style = {}, disabled }) => {
  const base = { borderRadius: 8, padding: small ? "5px 12px" : "9px 18px", fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "opacity 0.15s", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" };
  const v = { primary: { background: C.indigo, color: "#fff" }, ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` }, danger: { background: C.redDim, color: C.red, border: `1px solid ${C.red}33` }, success: { background: C.greenDim, color: C.green, border: `1px solid ${C.green}33` }, whatsapp: { background: C.whatsappDim, color: C.whatsapp, border: `1px solid ${C.whatsapp}44` }, purple: { background: C.purpleDim, color: C.purple, border: `1px solid ${C.purple}44` } };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v[variant], ...style }}>{children}</button>;
};

const Badge = ({ label, color, dim }) => (
  <span style={{ background: (dim || color) + "22", color, border: `1px solid ${color}33`, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>
);

const Avatar = ({ name, size = 36 }) => {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??";
  return <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${C.indigo},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>;
};

const Card = ({ children, style = {} }) => <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>;

const Input = ({ value, onChange, placeholder, style = {}, multiline }) =>
  multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", ...style }} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", ...style }} />;

const Sel = ({ value, onChange, options, style = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none", ...style }}>
    {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

// ── Stage configs ──────────────────────────────────────────────
const COMM_STAGES = ["Lead", "Appuntamento", "Preventivo", "Contratto"];
const OPS_STAGES = ["Ordine", "Merce", "Posa", "Saldo"];
const COMM_COLORS = { Lead: C.muted, Appuntamento: C.amber, Preventivo: C.indigo, Contratto: C.green };
const OPS_COLORS = { Ordine: C.amber, Merce: C.indigo, Posa: C.purple, Saldo: C.green };

// ── AI Section ─────────────────────────────────────────────────
function AIPanel({ lead, onClose }) {
  const [activeAI, setActiveAI] = useState("summary");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const aiTasks = [
    { id: "summary", label: "📋 Riassunto chiamata", placeholder: "Incolla le note o la trascrizione della chiamata…", prompt: (text, lead) => `Sei un assistente CRM professionale in italiano. Dato questo testo di una chiamata con ${lead.name} (valore: €${lead.value}, fase: ${lead.commercialStage}), crea un riassunto strutturato in 3-5 punti bullet con: punti chiave emersi, obiezioni, prossimi passi. Rispondi SOLO con il riassunto, senza preamboli.\n\nTRALSCRIZIONE:\n${text}` },
    { id: "followup", label: "💡 Suggerisci follow-up", placeholder: "Descrivi la situazione del cliente…", prompt: (text, lead) => `Sei un esperto commerciale italiano. Per il cliente ${lead.name} in fase "${lead.commercialStage}", valore ordine €${lead.value}, fonte "${lead.source}".\nContesto: ${text || "nessun contesto aggiuntivo"}\nSuggerisci 3 azioni concrete di follow-up con tempistiche precise. Sii diretto e pratico. Rispondi in italiano.` },
    { id: "quote", label: "📄 Genera preventivo", placeholder: "Descrivi prodotti/servizi richiesti dal cliente…", prompt: (text, lead) => `Sei un commerciale esperto. Genera un testo professionale per un preventivo formale destinato a ${lead.name}, email: ${lead.email}. Valore stimato: €${lead.value}. Dettagli richiesti:\n${text}\nInclude: intestazione professionale, descrizione servizi, condizioni, validità 30 giorni, firma. Tono formale in italiano.` },
    { id: "reply", label: "✉️ Risposta automatica lead", placeholder: "Cosa ha scritto/richiesto il lead?", prompt: (text, lead) => `Sei un assistente commerciale italiano. Il lead ${lead.name} (fonte: ${lead.source}) ha inviato questo messaggio:\n"${text}"\nScrivi una risposta professionale, calorosa e convincente che: risponde alla richiesta, mette in evidenza il valore del servizio, propone un appuntamento. Massimo 5 righe. Solo il testo della risposta.` },
    { id: "transcribe", label: "🎤 Trascrivi vocale", placeholder: "Incolla il testo grezzo del vocale o le note veloce del venditore…", prompt: (text, lead) => `Sei un assistente CRM. Trasforma queste note grezze del venditore relative al cliente ${lead.name} in una nota CRM strutturata e professionale, pronta per essere salvata. Includi: data odierna (${today}), punti chiave, stato commerciale (${lead.commercialStage}), azioni da fare. Rispondi solo con la nota formattata.` },
  ];

  const task = aiTasks.find(t => t.id === activeAI);

  const run = async () => {
    if (!input.trim() && activeAI !== "followup") return;
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: task.prompt(input, lead) }] })
      });
      const data = await res.json();
      setOutput(data.content?.map(b => b.text).join("") || "Errore nella risposta.");
    } catch {
      setOutput("Errore di connessione. Riprova.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: 600, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(135deg,${C.purpleDim},${C.indigoDim})` }}>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>✨ Assistente AI — {lead.name}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>Fase: {lead.commercialStage} · Valore: {fmt(lead.value)}</div>
          </div>
          <Btn variant="ghost" onClick={onClose} small>✕ Chiudi</Btn>
        </div>

        {/* Task tabs */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${C.border}`, padding: "0 12px" }}>
          {aiTasks.map(t => (
            <button key={t.id} onClick={() => { setActiveAI(t.id); setOutput(""); setInput(""); }} style={{ padding: "10px 14px", background: "transparent", border: "none", borderBottom: activeAI === t.id ? `2px solid ${C.purple}` : "2px solid transparent", color: activeAI === t.id ? C.purple : C.muted, fontWeight: activeAI === t.id ? 700 : 400, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input value={input} onChange={setInput} placeholder={task.placeholder} multiline style={{ minHeight: 80 }} />
          <Btn variant="purple" onClick={run} disabled={loading}>
            {loading ? "⏳ Elaborazione in corso…" : "✨ Genera con AI"}
          </Btn>
          {output && (
            <div style={{ background: C.surface, border: `1px solid ${C.purple}33`, borderRadius: 10, padding: 16 }}>
              <div style={{ color: C.purple, fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>RISULTATO AI</div>
              <div style={{ color: C.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{output}</div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Btn variant="ghost" small onClick={() => navigator.clipboard?.writeText(output)}>📋 Copia</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Panel ─────────────────────────────────────────────
function WhatsAppPanel({ lead, onClose, onSend }) {
  const [msg, setMsg] = useState(WA_TEMPLATES[lead.commercialStage] || WA_TEMPLATES[lead.operationalStage] || "");
  const [sent, setSent] = useState(false);

  const previewMsg = msg.replace("{nome}", lead.name.split(" ")[0]);
  const allMsgs = lead.messages || [];

  const send = () => {
    const newMsg = { from: "azienda", text: previewMsg, time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) };
    onSend(lead.id, newMsg);
    setSent(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: 420, maxWidth: "95vw", background: C.card, borderRadius: 16, border: `1px solid ${C.whatsapp}33`, overflow: "hidden" }}>
        {/* WA Header */}
        <div style={{ background: C.whatsapp, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={lead.name} size={38} />
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{lead.name}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{lead.phone}</div>
          </div>
          <Btn variant="ghost" onClick={onClose} small style={{ marginLeft: "auto", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>✕</Btn>
        </div>

        {/* Chat */}
        <div style={{ background: "#0e1117", minHeight: 160, maxHeight: 220, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {allMsgs.length === 0 && <div style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>Nessun messaggio precedente</div>}
          {allMsgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "azienda" ? "flex-end" : "flex-start" }}>
              <div style={{ background: m.from === "azienda" ? "#005c4b" : C.surface, borderRadius: 10, padding: "8px 12px", maxWidth: "80%", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                {m.text}
                <div style={{ color: C.muted, fontSize: 10, marginTop: 4, textAlign: "right" }}>{m.time} {m.from === "azienda" && "✓✓"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Compose */}
        <div style={{ padding: 16 }}>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Messaggio automatico (modificabile):</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 12px", fontSize: 13, width: "100%", boxSizing: "border-box", resize: "none", outline: "none" }} />
          {sent
            ? <div style={{ color: C.whatsapp, fontSize: 13, fontWeight: 600, marginTop: 10, textAlign: "center" }}>✓ Messaggio inviato con successo</div>
            : <Btn variant="whatsapp" onClick={send} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>📱 Invia su WhatsApp</Btn>}
        </div>
      </div>
    </div>
  );
}

// ── Lead detail modal ──────────────────────────────────────────
function LeadModal({ lead, contacts, onClose, onSave, onWhatsApp, onAI }) {
  const [form, setForm] = useState({ ...lead });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150 }}>
      <div style={{ width: 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>{lead.id ? "Modifica Cliente" : "Nuovo Cliente"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {lead.id && <Btn variant="whatsapp" small onClick={() => onWhatsApp(form)}>📱 WhatsApp</Btn>}
            {lead.id && <Btn variant="purple" small onClick={() => onAI(form)}>✨ AI</Btn>}
            <Btn variant="ghost" small onClick={onClose}>✕</Btn>
          </div>
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Nome completo", "name"], ["Telefono", "phone"], ["Email", "email"], ["Fonte", "source"]].map(([l, k]) => (
              <div key={k}><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{l}</div><Input value={form[k] || ""} onChange={v => set(k, v)} placeholder={l} /></div>
            ))}
          </div>
          <div><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Valore Stimato (€)</div><Input value={form.value || ""} onChange={v => set("value", v)} placeholder="0" /></div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 10 }}>🏢 Area Commerciale</div>
            <Sel value={form.commercialStage || "Lead"} onChange={v => set("commercialStage", v)} options={COMM_STAGES} style={{ width: "100%" }} />
          </div>

          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 10 }}>⚙️ Area Operativa</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn variant={!form.operationalStage ? "primary" : "ghost"} small onClick={() => set("operationalStage", null)}>Nessuna</Btn>
              {OPS_STAGES.map(s => <Btn key={s} variant={form.operationalStage === s ? "success" : "ghost"} small onClick={() => set("operationalStage", s)}>{s}</Btn>)}
            </div>
          </div>

          <div><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Note</div><Input value={form.notes || ""} onChange={v => set("notes", v)} placeholder="Note interne…" multiline /></div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={onClose}>Annulla</Btn>
            <Btn onClick={() => { onSave(form); onClose(); }}>Salva</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Commercial Pipeline ────────────────────────────────────────
function CommercialArea({ leads, setLeads }) {
  const [modal, setModal] = useState(null);
  const [waLead, setWaLead] = useState(null);
  const [aiLead, setAiLead] = useState(null);

  const save = (form) => {
    const upd = { ...form, value: Number(form.value) };
    setLeads(prev => prev.some(l => l.id === upd.id) ? prev.map(l => l.id === upd.id ? upd : l) : [...prev, { ...upd, id: Date.now(), messages: [] }]);
  };

  const sendWA = (leadId, msg) => setLeads(prev => prev.map(l => l.id === leadId ? { ...l, messages: [...(l.messages || []), msg] } : l));

  const advanceStage = (lead, dir) => {
    const idx = COMM_STAGES.indexOf(lead.commercialStage);
    const next = COMM_STAGES[idx + dir];
    if (next) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, commercialStage: next } : l));
  };

  const totalByStage = (s) => leads.filter(l => l.commercialStage === s).reduce((sum, l) => sum + Number(l.value), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: C.text, margin: 0, fontSize: 22, fontWeight: 700 }}>🏢 Area Commerciale</h2>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Lead → Appuntamento → Preventivo → Contratto</div>
        </div>
        <Btn onClick={() => setModal({ commercialStage: "Lead", operationalStage: null, messages: [] })}>+ Nuovo Lead</Btn>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {COMM_STAGES.map(stage => {
          const col = leads.filter(l => l.commercialStage === stage);
          const color = COMM_COLORS[stage];
          return (
            <div key={stage} style={{ minWidth: 230, flex: "0 0 230px" }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase" }}>{stage}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{col.length} · {fmt(totalByStage(stage))}</span>
                </div>
                <div style={{ height: 3, background: color, borderRadius: 2, marginTop: 6, opacity: 0.8 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.map(l => (
                  <div key={l.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Avatar name={l.name} size={28} />
                      <div>
                        <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>{l.source}</div>
                      </div>
                    </div>
                    <div style={{ color: C.green, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{fmt(l.value)}</div>
                    {l.operationalStage && <Badge label={`⚙ ${l.operationalStage}`} color={OPS_COLORS[l.operationalStage] || C.muted} />}
                    {(l.messages || []).length > 0 && <span style={{ color: C.whatsapp, fontSize: 11, marginLeft: 6 }}>📱 {l.messages.length}</span>}
                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      <Btn variant="ghost" small onClick={() => advanceStage(l, -1)}>←</Btn>
                      <Btn variant="ghost" small onClick={() => setModal(l)}>✏️</Btn>
                      <Btn variant="whatsapp" small onClick={() => setWaLead(l)}>📱</Btn>
                      <Btn variant="purple" small onClick={() => setAiLead(l)}>✨</Btn>
                      <Btn variant="ghost" small onClick={() => advanceStage(l, 1)}>→</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modal && <LeadModal lead={modal} onClose={() => setModal(null)} onSave={save} onWhatsApp={l => { setModal(null); setWaLead(l); }} onAI={l => { setModal(null); setAiLead(l); }} />}
      {waLead && <WhatsAppPanel lead={waLead} onClose={() => setWaLead(null)} onSend={sendWA} />}
      {aiLead && <AIPanel lead={aiLead} onClose={() => setAiLead(null)} />}
    </div>
  );
}

// ── Merce status colours ───────────────────────────────────────
const MERCE_STATI = ["Da ordinare", "Ordinata", "In transito", "Arrivata", "Parziale"];
const MERCE_COLORS = { "Da ordinare": C.muted, "Ordinata": C.amber, "In transito": C.indigo, "Arrivata": C.green, "Parziale": C.purple };
const MERCE_ICONS  = { "Da ordinare": "🕐", "Ordinata": "📦", "In transito": "🚚", "Arrivata": "✅", "Parziale": "⚠️" };

// ── Merce Modal ────────────────────────────────────────────────
function MerceModal({ lead, onClose, onSave }) {
  const init = lead.merce || { fornitore: "", statoMerce: "Da ordinare", dataArrivo: "", note: "" };
  const [form, setForm] = useState({ ...init });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const daysLeft = form.dataArrivo ? Math.ceil((new Date(form.dataArrivo) - new Date(today)) / 86400000) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: 460, maxWidth: "95vw", background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(135deg,${C.amberDim},${C.indigoDim})`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>📦 Stato Merce — {lead.name}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Gestione approvvigionamento e consegna</div>
          </div>
          <Btn variant="ghost" onClick={onClose} small>✕</Btn>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Stato merce con bottoni visivi */}
          <div>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Stato merce</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MERCE_STATI.map(s => {
                const active = form.statoMerce === s;
                const color = MERCE_COLORS[s];
                return (
                  <button key={s} onClick={() => set("statoMerce", s)} style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${active ? color : C.border}`, background: active ? color + "22" : "transparent", color: active ? color : C.muted, fontWeight: active ? 700 : 400, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{MERCE_ICONS[s]}</span>{s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fornitore */}
          <div>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Fornitore</div>
            <Input value={form.fornitore} onChange={v => set("fornitore", v)} placeholder="Es. Ceramiche Nord Srl" />
          </div>

          {/* Data arrivo */}
          <div>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Data prevista arrivo</div>
            <Input value={form.dataArrivo} onChange={v => set("dataArrivo", v)} placeholder="AAAA-MM-GG" />
            {daysLeft !== null && (
              <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, background: daysLeft < 0 ? C.redDim : daysLeft <= 3 ? C.amberDim : C.greenDim, color: daysLeft < 0 ? C.red : daysLeft <= 3 ? C.amber : C.green, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {daysLeft < 0 ? `⚠️ In ritardo di ${Math.abs(daysLeft)} giorni` : daysLeft === 0 ? "📦 Arrivo previsto oggi" : `🚚 Arrivo tra ${daysLeft} giorni`}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Note interne</div>
            <Input value={form.note} onChange={v => set("note", v)} placeholder="Es. 3 colli, consegna al mattino, verificare imballo…" multiline />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={onClose}>Annulla</Btn>
            <Btn onClick={() => { onSave(lead.id, form); onClose(); }}>💾 Salva</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Operational Area ───────────────────────────────────────────
function OperationalArea({ leads, setLeads }) {
  const [waLead, setWaLead] = useState(null);
  const [merceLead, setMerceLead] = useState(null);
  const opsLeads = leads.filter(l => l.operationalStage);
  const sendWA = (leadId, msg) => setLeads(prev => prev.map(l => l.id === leadId ? { ...l, messages: [...(l.messages || []), msg] } : l));

  const advance = (lead, dir) => {
    const idx = OPS_STAGES.indexOf(lead.operationalStage);
    const next = OPS_STAGES[idx + dir];
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, operationalStage: next || null } : l));
  };

  const saveMerce = (leadId, merceData) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, merce: merceData } : l));
  };

  // Summary stats for merce
  const merceLeads = leads.filter(l => l.merce);
  const inTransito = merceLeads.filter(l => l.merce.statoMerce === "In transito").length;
  const inRitardo  = merceLeads.filter(l => l.merce.dataArrivo && new Date(l.merce.dataArrivo) < new Date(today) && l.merce.statoMerce !== "Arrivata").length;
  const inArrivo3g = merceLeads.filter(l => {
    if (!l.merce?.dataArrivo) return false;
    const days = Math.ceil((new Date(l.merce.dataArrivo) - new Date(today)) / 86400000);
    return days >= 0 && days <= 3 && l.merce.statoMerce !== "Arrivata";
  }).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ color: C.text, margin: 0, fontSize: 22, fontWeight: 700 }}>⚙️ Area Operativa</h2>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Ordine → Merce → Posa → Saldo</div>
      </div>

      {/* Merce alert bar */}
      {(inRitardo > 0 || inArrivo3g > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {inRitardo > 0 && (
            <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div><div style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>{inRitardo} ordine{inRitardo > 1 ? "i" : ""} in ritardo</div><div style={{ color: C.muted, fontSize: 11 }}>Data arrivo superata</div></div>
            </div>
          )}
          {inArrivo3g > 0 && (
            <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🚚</span>
              <div><div style={{ color: C.amber, fontWeight: 700, fontSize: 13 }}>{inArrivo3g} ordine{inArrivo3g > 1 ? "i" : ""} in arrivo</div><div style={{ color: C.muted, fontSize: 11 }}>Entro i prossimi 3 giorni</div></div>
            </div>
          )}
        </div>
      )}

      {/* Kanban */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {OPS_STAGES.map(stage => {
          const col = opsLeads.filter(l => l.operationalStage === stage);
          const color = OPS_COLORS[stage];
          return (
            <div key={stage} style={{ minWidth: 240, flex: "0 0 240px" }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase" }}>{stage}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{col.length}</span>
                </div>
                <div style={{ height: 3, background: color, borderRadius: 2, marginTop: 6, opacity: 0.8 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.map(l => {
                  const m = l.merce;
                  const daysLeft = m?.dataArrivo ? Math.ceil((new Date(m.dataArrivo) - new Date(today)) / 86400000) : null;
                  const isLate = daysLeft !== null && daysLeft < 0 && m?.statoMerce !== "Arrivata";
                  return (
                    <div key={l.id} style={{ background: C.card, border: `1px solid ${isLate ? C.red + "66" : C.border}`, borderRadius: 10, padding: 12, transition: "border-color 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <Avatar name={l.name} size={28} />
                        <div>
                          <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                          <div style={{ color: C.muted, fontSize: 11 }}>{l.phone}</div>
                        </div>
                      </div>
                      <div style={{ color: C.green, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{fmt(l.value)}</div>

                      {/* Merce info pill */}
                      {m && (
                        <div style={{ background: C.surface, borderRadius: 8, padding: "7px 10px", marginBottom: 8, borderLeft: `3px solid ${MERCE_COLORS[m.statoMerce] || C.muted}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                            <span style={{ fontSize: 13 }}>{MERCE_ICONS[m.statoMerce]}</span>
                            <span style={{ color: MERCE_COLORS[m.statoMerce] || C.muted, fontSize: 11, fontWeight: 700 }}>{m.statoMerce}</span>
                          </div>
                          {m.fornitore && <div style={{ color: C.muted, fontSize: 11 }}>🏭 {m.fornitore}</div>}
                          {m.dataArrivo && (
                            <div style={{ color: isLate ? C.red : daysLeft <= 3 ? C.amber : C.muted, fontSize: 11, marginTop: 2 }}>
                              {isLate ? `⚠️ Ritardo ${Math.abs(daysLeft)}g` : daysLeft === 0 ? "📦 Oggi" : `🗓 ${m.dataArrivo} (${daysLeft}gg)`}
                            </div>
                          )}
                        </div>
                      )}

                      {(l.messages || []).length > 0 && <div style={{ color: C.whatsapp, fontSize: 11, marginBottom: 6 }}>📱 {l.messages.length} msg inviati</div>}

                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <Btn variant="ghost" small onClick={() => advance(l, -1)}>←</Btn>
                        <Btn variant="amber" small onClick={() => setMerceLead(l)} style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📦 Merce</Btn>
                        <Btn variant="whatsapp" small onClick={() => setWaLead(l)}>📱</Btn>
                        <Btn variant="ghost" small onClick={() => advance(l, 1)}>→</Btn>
                      </div>
                    </div>
                  );
                })}
                {col.length === 0 && <div style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: 20, border: `1px dashed ${C.border}`, borderRadius: 10 }}>Nessun ordine</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Riepilogo merce table */}
      {merceLeads.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 15 }}>📦 Riepilogo Stato Merce</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Cliente", "Fornitore", "Stato merce", "Data arrivo", "Giorni", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merceLeads.map(l => {
                const m = l.merce;
                const daysLeft = m.dataArrivo ? Math.ceil((new Date(m.dataArrivo) - new Date(today)) / 86400000) : null;
                const isLate = daysLeft !== null && daysLeft < 0 && m.statoMerce !== "Arrivata";
                const color = MERCE_COLORS[m.statoMerce] || C.muted;
                return (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={l.name} size={28} />
                        <div>
                          <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                          <div style={{ color: C.muted, fontSize: 11 }}>{l.operationalStage}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", color: C.muted, fontSize: 13 }}>{m.fornitore || "—"}</td>
                    <td style={{ padding: "10px 16px" }}><Badge label={`${MERCE_ICONS[m.statoMerce]} ${m.statoMerce}`} color={color} /></td>
                    <td style={{ padding: "10px 16px", color: C.muted, fontSize: 13 }}>{m.dataArrivo || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      {daysLeft !== null && (
                        <span style={{ color: isLate ? C.red : daysLeft <= 3 ? C.amber : C.green, fontWeight: 700, fontSize: 13 }}>
                          {isLate ? `−${Math.abs(daysLeft)}g` : daysLeft === 0 ? "Oggi" : `+${daysLeft}g`}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <Btn variant="ghost" small onClick={() => setMerceLead(l)}>✏️ Modifica</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {waLead && <WhatsAppPanel lead={waLead} onClose={() => setWaLead(null)} onSend={sendWA} />}
      {merceLead && <MerceModal lead={merceLead} onClose={() => setMerceLead(null)} onSave={saveMerce} />}
    </div>
  );
}

// ── Marketing Area ─────────────────────────────────────────────
function MarketingArea({ leads, campaigns, setCampaigns }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [aiLead, setAiLead] = useState(null);

  const saveCamp = () => {
    const f = { ...form, budget: Number(form.budget), leads: Number(form.leads), conversions: Number(form.conversions), revenue: Number(form.revenue) };
    if (modal === "new") setCampaigns(prev => [...prev, { ...f, id: Date.now() }]);
    else setCampaigns(prev => prev.map(c => c.id === modal.id ? { ...f, id: modal.id } : c));
    setModal(null);
  };
  const del = (id) => setCampaigns(prev => prev.filter(c => c.id !== id));

  const totalRoi = campaigns.reduce((s, c) => s + (c.revenue - c.budget), 0);
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const totalConv = campaigns.reduce((s, c) => s + c.conversions, 0);

  const sourceStats = ["Facebook Ads", "Google Ads", "Instagram", "Referral", "Sito Web", "Email"].map(src => ({
    src, count: leads.filter(l => l.source === src).length
  })).filter(s => s.count > 0);
  const maxSrc = Math.max(...sourceStats.map(s => s.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: C.text, margin: 0, fontSize: 22, fontWeight: 700 }}>📣 Area Marketing</h2>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Campagne · ROI · Conversioni</div>
        </div>
        <Btn onClick={() => { setForm({ name: "", channel: "Facebook Ads", budget: 0, leads: 0, conversions: 0, revenue: 0, status: "Attiva" }); setModal("new"); }}>+ Nuova Campagna</Btn>
      </div>

      {/* KPI row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { l: "Budget Totale", v: fmt(totalBudget), color: C.amber },
          { l: "Revenue Generata", v: fmt(campaigns.reduce((s,c)=>s+c.revenue,0)), color: C.green },
          { l: "ROI Netto", v: fmt(totalRoi), color: totalRoi > 0 ? C.green : C.red },
          { l: "Lead Totali", v: totalLeads, color: C.indigo },
          { l: "Conversioni", v: totalConv, color: C.purple },
          { l: "Conv. Rate", v: totalLeads > 0 ? `${Math.round(totalConv/totalLeads*100)}%` : "—", color: C.indigo },
        ].map(s => (
          <div key={s.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", minWidth: 120, flex: 1 }}>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.l}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Campaigns table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.text, fontSize: 15 }}>Campagne</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Campagna", "Budget", "Lead", "Conv", "ROI", "Stato", ""].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const roi = c.revenue - c.budget;
                const roiPct = c.budget > 0 ? Math.round((roi / c.budget) * 100) : 0;
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ color: C.muted, fontSize: 11 }}>{c.channel}</div>
                    </td>
                    <td style={{ padding: "10px 14px", color: C.muted, fontSize: 13 }}>{fmt(c.budget)}</td>
                    <td style={{ padding: "10px 14px", color: C.text, fontSize: 13 }}>{c.leads}</td>
                    <td style={{ padding: "10px 14px", color: C.text, fontSize: 13 }}>{c.conversions}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ color: roi >= 0 ? C.green : C.red, fontWeight: 700, fontSize: 13 }}>{roiPct}%</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <Badge label={c.status} color={c.status === "Attiva" ? C.green : C.muted} />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn variant="ghost" small onClick={() => { setForm({ ...c }); setModal(c); }}>✏️</Btn>
                        <Btn variant="danger" small onClick={() => del(c.id)}>✕</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Source breakdown */}
        <Card>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 14 }}>Lead per Fonte</div>
          {sourceStats.map(s => (
            <div key={s.src} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: C.muted, fontSize: 12 }}>{s.src}</span>
                <span style={{ color: C.text, fontWeight: 600, fontSize: 12 }}>{s.count}</span>
              </div>
              <div style={{ background: C.surface, borderRadius: 4, height: 7 }}>
                <div style={{ width: `${(s.count / maxSrc) * 100}%`, background: C.indigo, borderRadius: 4, height: "100%" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 13, marginBottom: 10 }}>Lead recenti</div>
            {leads.filter(l => l.commercialStage === "Lead").slice(0, 3).map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <Avatar name={l.name} size={26} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{l.name}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{l.source}</div>
                </div>
                <Btn variant="purple" small onClick={() => setAiLead(l)}>✨</Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <Card style={{ width: 440, maxWidth: "95vw" }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{modal === "new" ? "Nuova Campagna" : "Modifica Campagna"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Nome campagna</div><Input value={form.name || ""} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nome" /></div>
              <div><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Canale</div><Sel value={form.channel || "Facebook Ads"} onChange={v => setForm(f => ({ ...f, channel: v }))} options={["Facebook Ads", "Google Ads", "Instagram", "Email", "Referral", "Sito Web"]} style={{ width: "100%" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Budget (€)", "budget"], ["Lead", "leads"], ["Conversioni", "conversions"], ["Revenue (€)", "revenue"]].map(([l, k]) => (
                  <div key={k}><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{l}</div><Input value={form[k] || ""} onChange={v => setForm(f => ({ ...f, [k]: v }))} placeholder="0" /></div>
                ))}
              </div>
              <div><div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Stato</div><Sel value={form.status || "Attiva"} onChange={v => setForm(f => ({ ...f, status: v }))} options={["Attiva", "Conclusa", "In pausa"]} style={{ width: "100%" }} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setModal(null)}>Annulla</Btn>
              <Btn onClick={saveCamp}>Salva</Btn>
            </div>
          </Card>
        </div>
      )}
      {aiLead && <AIPanel lead={aiLead} onClose={() => setAiLead(null)} />}
    </div>
  );
}

// ── Dashboard overview ─────────────────────────────────────────
function Dashboard({ leads, campaigns }) {
  const pipeline = leads.filter(l => l.commercialStage !== "Lead").reduce((s, l) => s + Number(l.value), 0);
  const contratti = leads.filter(l => l.commercialStage === "Contratto");
  const waMessages = leads.reduce((s, l) => s + (l.messages || []).length, 0);

  const commDist = COMM_STAGES.map(s => ({ s, n: leads.filter(l => l.commercialStage === s).length }));
  const opsDist = OPS_STAGES.map(s => ({ s, n: leads.filter(l => l.operationalStage === s).length }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ color: C.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Dashboard</h2>
        <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Panoramica operativa — {today}</div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { l: "Pipeline Commerciale", v: fmt(pipeline), color: C.indigo, sub: `${leads.filter(l=>l.commercialStage!=="Lead").length} trattative attive` },
          { l: "Contratti Firmati", v: contratti.length, color: C.green, sub: `${fmt(contratti.reduce((s,l)=>s+Number(l.value),0))} totale` },
          { l: "In lavorazione (Ops)", v: leads.filter(l=>l.operationalStage).length, color: C.amber, sub: "ordini attivi" },
          { l: "Messaggi WhatsApp", v: waMessages, color: C.whatsapp, sub: "inviati automaticamente" },
          { l: "Campagne Attive", v: campaigns.filter(c=>c.status==="Attiva").length, color: C.purple, sub: `su ${campaigns.length} totali` },
        ].map(s => (
          <div key={s.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 140 }}>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.l}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{s.v}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 14 }}>🏢 Funnel Commerciale</div>
          {commDist.map(({ s, n }) => {
            const max = Math.max(...commDist.map(x => x.n), 1);
            return (
              <div key={s} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>{s}</span>
                  <span style={{ color: C.text, fontWeight: 600, fontSize: 12 }}>{n}</span>
                </div>
                <div style={{ background: C.surface, borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${(n / max) * 100}%`, background: COMM_COLORS[s], borderRadius: 4, height: "100%", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 14 }}>⚙️ Stato Operativo</div>
          {opsDist.map(({ s, n }) => {
            const max = Math.max(...opsDist.map(x => x.n), 1);
            return (
              <div key={s} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>{s}</span>
                  <span style={{ color: C.text, fontWeight: 600, fontSize: 12 }}>{n}</span>
                </div>
                <div style={{ background: C.surface, borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${(n / max) * 100}%`, background: OPS_COLORS[s], borderRadius: 4, height: "100%", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
          {leads.filter(l => l.operationalStage).length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Nessun ordine in lavorazione</div>}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 14 }}>📱 Ultimi messaggi WhatsApp</div>
          {leads.filter(l => (l.messages || []).length > 0).flatMap(l => l.messages.map(m => ({ ...m, lead: l }))).slice(-4).reverse().map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <Avatar name={m.lead.name} size={28} />
              <div>
                <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{m.lead.name}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2, maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.text}</div>
              </div>
              <span style={{ color: C.whatsapp, fontSize: 11, marginLeft: "auto", whiteSpace: "nowrap" }}>{m.time}</span>
            </div>
          ))}
          {waMessages === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 16 }}>Nessun messaggio inviato</div>}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 15, marginBottom: 14 }}>📣 Performance campagne</div>
          {campaigns.map(c => {
            const roi = c.budget > 0 ? Math.round(((c.revenue - c.budget) / c.budget) * 100) : 0;
            return (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{c.leads} lead · {c.conversions} conv.</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: roi >= 0 ? C.green : C.red, fontWeight: 700, fontSize: 14 }}>+{roi}%</div>
                  <Badge label={c.status} color={c.status === "Attiva" ? C.green : C.muted} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "commercial", icon: "🏢", label: "Commerciale" },
  { id: "operational", icon: "⚙️", label: "Operativo" },
  { id: "marketing", icon: "📣", label: "Marketing" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [leads, setLeads] = useState(initLeads);
  const [campaigns, setCampaigns] = useState(initCampaigns);

  const opsCount = leads.filter(l => l.operationalStage).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.text }}>
      {/* Sidebar */}
      <div style={{ width: 216, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 18px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${C.indigo},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>C</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>CRM Pro</div>
              <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>✨ AI · 📱 WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map(n => {
            const active = tab === n.id;
            const badge = n.id === "operational" && opsCount > 0 ? opsCount : null;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, background: active ? C.indigoDim : "transparent", color: active ? C.indigoLight : C.muted, fontWeight: active ? 700 : 400, fontSize: 14, transition: "all 0.15s", textAlign: "left" }}>
                <span>{n.icon}</span><span style={{ flex: 1 }}>{n.label}</span>
                {badge && <span style={{ background: C.amber, color: "#000", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* AI badge */}
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, background: C.purpleDim }}>
          <div style={{ color: C.purple, fontSize: 12, fontWeight: 700 }}>✨ AI Attiva</div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Riassunti · Preventivi · Follow-up · Trascrizioni</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 28 }}>
          {tab === "dashboard" && <Dashboard leads={leads} campaigns={campaigns} />}
          {tab === "commercial" && <CommercialArea leads={leads} setLeads={setLeads} />}
          {tab === "operational" && <OperationalArea leads={leads} setLeads={setLeads} />}
          {tab === "marketing" && <MarketingArea leads={leads} campaigns={campaigns} setCampaigns={setCampaigns} />}
        </div>
      </div>
    </div>
  );
}
