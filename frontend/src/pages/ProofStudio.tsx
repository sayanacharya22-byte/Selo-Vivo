import {
  ArrowRight,
  Atom,
  Check,
  CheckCircle2,
  CircleDashed,
  CloudOff,
  EyeOff,
  FileText,
  Globe2,
  KeyRound,
  Laptop,
  Leaf,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useWallet } from "../hooks/useWallet";
import { composeProof, fetchDashboard, recordProof, type ComposeResponse, type Dashboard } from "../lib/api";
import { createDemoCredential, rotateDemoCredential, type LocalCredential } from "../lib/vault";
import { shortAddress, type MidnightNetwork } from "../lib/wallet";
import type { ProofReceipt } from "../lib/midnight";

const REQUIREMENT = "Credencial de agricultura regenerativa válida até 2027. Bioma elegível: Amazônia ou Cerrado.";
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

export function ProofStudio() {
  const wallet = useWallet();
  const [credential, setCredential] = useState<LocalCredential | null>(null);
  const [requirement, setRequirement] = useState(REQUIREMENT);
  const [proofState, setProofState] = useState<"idle" | "proving" | "success" | "error">("idle");
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ProofReceipt | null>(null);
  const [composerState, setComposerState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [composition, setComposition] = useState<ComposeResponse | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dashboardState, setDashboardState] = useState<"loading" | "ready" | "error">("loading");
  const [reviewOpen, setReviewOpen] = useState(false);

  const expiry = useMemo(() => credential
    ? new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(credential.expiryEpoch * 1000)
    : null, [credential]);
  const contractAddress = receipt
    && wallet.session
    && receipt.network === wallet.network
    && receipt.walletAddress === wallet.session.address
    ? receipt.contractAddress
    : null;
  const readiness = Math.min(100,
    (credential ? 35 : 0) + (wallet.session ? 25 : 0) +
    (requirement.trim().length >= 8 ? 20 : 0) + (composition ? 20 : 0),
  );
  const canProve = Boolean(credential && wallet.session && requirement.trim().length >= 8);

  useEffect(() => {
    fetchDashboard()
      .then((value) => { setDashboard(value); setDashboardState("ready"); })
      .catch(() => setDashboardState("error"));
  }, []);

  async function runComposer() {
    setComposerState("loading");
    try {
      const result = await composeProof(requirement);
      setComposition(result);
      setComposerState("ready");
    } catch {
      setComposerState("error");
    }
  }

  async function generateProof() {
    if (!credential) {
      setProofState("error");
      setProofMessage("Carregue uma credencial local antes de gerar a prova.");
      return;
    }
    if (!wallet.session) {
      setProofState("error");
      setProofMessage("Conecte a 1AM para revisar e assinar a transação.");
      return;
    }
    setProofState("proving");
    setProofMessage("Aguardando aprovação da carteira, prova local, envio e finalização…");
    setReceipt(null);
    try {
      const { proveCredential } = await import("../lib/midnight");
      const nextReceipt = await proveCredential({
        wallet: wallet.session.api,
        walletAddress: wallet.session.address,
        network: wallet.network,
        credential,
        requirement,
        requiredClass: 1,
        minimumExpiryEpoch: Date.UTC(2027, 0, 1) / 1000,
        requiredBiomeGroup: 1,
      });
      setReceipt(nextReceipt);
      setProofState("success");
      setProofMessage("Finalizada. Identidade, origem exata, validade exata e segredo permaneceram neste dispositivo.");
      recordProof({ network: nextReceipt.network, transactionId: nextReceipt.proofTxId, contractAddress: nextReceipt.contractAddress, requirement })
        .then(() => fetchDashboard().then((value) => { setDashboard(value); setDashboardState("ready"); }))
        .catch(() => undefined);
    } catch (reason) {
      const { describeMidnightError } = await import("../lib/midnight");
      setProofState("error");
      setProofMessage(describeMidnightError(reason));
    }
  }

  return (
    <motion.div className="page" variants={stagger} initial="hidden" animate="show">
      <motion.header className="page-header" variants={rise}>
        <div>
          <div className="eyebrow"><span /> Centro de prova confidencial</div>
          <h1>Prove o necessário.<br />Preserve o essencial.</h1>
          <p>Prepare, revise e publique uma prova seletiva na Midnight.</p>
        </div>
        <div className="wallet-cluster">
          <label className="network-picker">
            <span>Rede</span>
            <select value={wallet.network} onChange={(event) => wallet.changeNetwork(event.target.value as MidnightNetwork)} aria-label="Rede Midnight">
              <option value="preview">Preview</option><option value="preprod">Preprod</option>
            </select>
          </label>
          {wallet.session ? (
            <button className="wallet-button wallet-button--connected" type="button" onClick={wallet.disconnect} title="Desconectar desta sessão">
              <span className="wallet-dot" /> {shortAddress(wallet.session.address)} <LogOut size={16} />
            </button>
          ) : (
            <button className="wallet-button" type="button" onClick={wallet.connect} disabled={wallet.status === "connecting"}>
              <Wallet size={19} /> {wallet.status === "connecting" ? "Conectando…" : "Conectar 1AM"}
            </button>
          )}
        </div>
      </motion.header>

      <motion.section className="system-strip" variants={rise} aria-label="Estado operacional">
        <SystemState label="Rede" value={wallet.network} state="ok" />
        <SystemState label="Contrato" value={contractAddress ? shortAddress(contractAddress) : wallet.session ? "será criado nesta carteira" : "conecte a 1AM"} state={contractAddress ? "ok" : wallet.session ? "pending" : "warn"} />
        <SystemState label="API pública" value={dashboardState === "ready" ? "operacional" : dashboardState === "loading" ? "verificando" : "indisponível"} state={dashboardState === "ready" ? "ok" : dashboardState === "loading" ? "pending" : "warn"} />
        <SystemState label="Estado privado" value={credential ? "somente memória" : "não carregado"} state={credential ? "ok" : "pending"} />
      </motion.section>

      {wallet.error && <motion.div className="notice notice--error" role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>{wallet.error}</motion.div>}

      <motion.section className="studio-grid" variants={rise}>
        <article className="composer-card">
          <div className="card-heading">
            <div><span>Compositor de prova</span><h2>Defina a menor divulgação possível.</h2></div>
            <span className="status-chip status-chip--success">{readiness === 100 ? "pronta para provar" : `${readiness}% preparada`}</span>
          </div>
          <div className="steps">
            <div className="step completed">
              <div className="step-rail"><span><FileText size={19} /></span><i /></div>
              <div className="step-content">
                <div className="step-title"><h3>1. Requisito público</h3><small>{composition ? "ANALISADO" : "EDITÁVEL"}</small></div>
                <textarea className="requirement-box" maxLength={2000} value={requirement} onChange={(event) => { setRequirement(event.target.value); setComposition(null); setComposerState("idle"); }} aria-label="Requisito público do comprador" />
                <div className="field-meta"><span>Somente este texto e rótulos não sensíveis podem ir ao Gemini.</span><span>{requirement.length}/2000</span></div>
                <div className="tag-row">{(composition?.plan.public_disclosures ?? ["vigência", "classe", "bioma amplo"]).slice(0, 3).map((label) => <span key={label}>{label}</span>)}</div>
                {composition && <p className="composer-summary">{composition.plan.summary}</p>}
              </div>
            </div>

            <div className={credential ? "step completed" : "step active"}>
              <div className="step-rail"><span><Leaf size={19} /></span><i /></div>
              <div className="step-content">
                <div className="step-title"><h3>2. Credencial local</h3><small>{credential ? "EM MEMÓRIA" : "NECESSÁRIA"}</small></div>
                {credential ? (
                  <>
                    <div className="credential-card">
                      <div className="credential-icon"><Leaf size={22} /></div>
                      <div><strong>Selo Regenera Brasil</strong><small>{credential.issuer} · vence {expiry}</small></div>
                      <CheckCircle2 className="credential-check" size={22} />
                    </div>
                    <div className="masked-row">
                      <div className="masked-line"><LockKeyhole size={14} /><code>ID ••••••••{credential.id.slice(-3)} · segredo nunca persistido</code></div>
                      <button type="button" className="rotate-button" onClick={() => setCredential(rotateDemoCredential())} title="Criar nova credencial de demonstração"><RefreshCw size={13} /> renovar sessão</button>
                    </div>
                  </>
                ) : (
                  <div className="credential-empty">
                    <span><KeyRound size={20} /></span>
                    <div><strong>Nenhum witness carregado</strong><small>A demonstração cria dados efêmeros apenas nesta aba e nunca usa localStorage.</small></div>
                    <button type="button" onClick={() => setCredential(createDemoCredential())}>Carregar demonstração</button>
                  </div>
                )}
              </div>
            </div>

            <div className="step active">
              <div className="step-rail"><span><EyeOff size={19} /></span></div>
              <div className="step-content">
                <div className="step-title"><h3>3. Superfície de divulgação</h3><small>REVISÃO OBRIGATÓRIA</small></div>
                <div className="disclosure-grid">
                  <div className="disclosure disclosure--public"><span>Ledger público</span><strong>resultado + classe + tag</strong><small>sem identidade ou valor exato</small></div>
                  <div className="disclosure"><span>Witness protegido</span><strong>titular + validade + origem</strong><small>processado localmente</small></div>
                </div>
                <button className="inline-review" type="button" onClick={() => setReviewOpen((value) => !value)} aria-expanded={reviewOpen}>
                  {reviewOpen ? "Ocultar revisão detalhada" : "Revisar campos antes de provar"} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </article>

        <aside className="proof-capsule">
          <div className="azulejo-pattern" /><div className="capsule-orbit" />
          <div className="capsule-heading"><span>Cápsula de prova</span><strong>{wallet.network} · ZK</strong></div>
          <div className="readiness-wrap">
            <motion.div className="readiness" animate={proofState === "proving" ? { scale: [1, 1.025, 1] } : {}} transition={{ duration: 1.6, repeat: proofState === "proving" ? Infinity : 0 }}>
              <svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="79" className="ring-track"/><motion.circle cx="90" cy="90" r="79" className="ring-value" animate={{ pathLength: readiness / 100 }} transition={{ duration: 0.6 }}/></svg>
              <div><span><ShieldCheck size={26} /></span><strong>{readiness}%</strong><small>{readiness === 100 ? "pronta" : "preparando"}</small></div>
            </motion.div>
          </div>
          <div className="proof-layers" aria-label="Fases da prova">
            <ProofLayer icon={<Laptop size={17} />} title="Witness local" note={credential ? "carregado só em memória" : "aguardando credencial"} state={credential ? "done" : "idle"} />
            <ProofLayer icon={<Wallet size={17} />} title="Aprovação 1AM" note={wallet.session ? shortAddress(wallet.session.address) : "carteira desconectada"} state={wallet.session ? "done" : proofState === "proving" ? "pending" : "idle"} />
            <ProofLayer icon={<Atom size={17} />} title="Prova Compact" note="witness + política" state={proofState === "proving" ? "pending" : proofState === "success" ? "done" : "idle"} />
            <ProofLayer icon={<Globe2 size={17} />} title="Finalização pública" note="resultado mínimo" state={proofState === "success" ? "done" : "idle"} />
          </div>
          <button type="button" className="proof-button" onClick={generateProof} disabled={proofState === "proving" || !canProve}>
            {proofState === "proving" ? <CircleDashed size={18} className="spin" /> : <Sparkles size={18} />}
            {proofState === "proving" ? "Prova em andamento…" : "Revisar e gerar prova"}
          </button>
          <p className="proof-helper">{!credential ? "Carregue uma credencial local." : !wallet.session ? "Conecte a 1AM para continuar." : "A carteira pedirá confirmação antes de publicar."}</p>
        </aside>
      </motion.section>

      <AnimatePresence>{reviewOpen && <DisclosureReview onClose={() => setReviewOpen(false)} composition={composition} />}</AnimatePresence>
      <AnimateProofResult state={proofState} message={proofMessage} receipt={receipt} />

      <motion.section className="privacy-boundary" id="privacy-boundary" variants={rise}>
        <div><span className="boundary-icon boundary-icon--local"><Laptop size={20} /></span><div><small>Fica neste dispositivo</small><strong>Identidade, localização exata, documento, validade exata e segredo.</strong></div></div>
        <div><span className="boundary-icon boundary-icon--ledger"><Globe2 size={20} /></span><div><small>Vai para o ledger</small><strong>Classe escolhida, resultado válido, tag do requisito e nullifier.</strong></div></div>
      </motion.section>

      <motion.section className="dashboard-footer" variants={rise}>
        <div className="metrics" aria-label="Métricas públicas">
          <Metric value={dashboardState === "ready" ? String(dashboard?.verified_proofs ?? 0).padStart(2, "0") : "—"} label="provas verificadas" />
          <Metric value={dashboardState === "ready" ? `${dashboard?.disclosure_reduction_percent ?? 0}%` : "—"} label="menos campos públicos" />
          <Metric value={dashboardState === "ready" ? String(dashboard?.active_issuers ?? 0).padStart(2, "0") : "—"} label="raízes emissoras" />
        </div>
        <button className="gemini-dock" type="button" onClick={runComposer} disabled={composerState === "loading" || requirement.trim().length < 8}>
          <span className="gemini-icon">{composerState === "loading" ? <CircleDashed size={22} className="spin" /> : composerState === "error" ? <CloudOff size={22} /> : <Sparkles size={22} />}</span>
          <span><span className="gemini-title"><strong>Compositor Gemini</strong><small>{composition?.provider === "gemini" ? "GEMINI" : composition?.provider === "local" ? "POLÍTICA LOCAL" : composerState === "error" ? "INDISPONÍVEL" : composerState === "loading" ? "ANALISANDO" : "PRONTO"}</small></span><em>{composition ? `Confiança ${Math.round(composition.plan.confidence * 100)}% · ${composition.safety_note}` : composerState === "error" ? "A análise não foi concluída; nenhum dado privado foi enviado." : "Recebe apenas o requisito público e rótulos não sensíveis."}</em></span>
          <ArrowRight size={18} />
        </button>
      </motion.section>
    </motion.div>
  );
}

function SystemState({ label, value, state }: { label: string; value: string; state: "ok" | "pending" | "warn" }) {
  return <div className={`system-state system-state--${state}`}><span /><div><small>{label}</small><strong>{value}</strong></div></div>;
}

function DisclosureReview({ onClose, composition }: { onClose: () => void; composition: ComposeResponse | null }) {
  const publicItems = composition?.plan.public_disclosures ?? ["resultado booleano", "classe regenerativa", "tag hash do requisito", "nullifier"];
  const privateItems = composition?.plan.private_inputs ?? ["identidade do titular", "segredo do titular", "validade exata", "evidência de bioma", "documento de auditoria"];
  return (
    <motion.section className="review-panel" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} aria-label="Revisão detalhada da divulgação">
      <div className="review-panel__header"><div><span>Fronteira de privacidade</span><h2>Confira antes de autorizar.</h2></div><button type="button" onClick={onClose} aria-label="Fechar revisão"><X size={18} /></button></div>
      <div className="review-columns">
        <div><small>PÚBLICO E VERIFICÁVEL</small>{publicItems.map((item) => <p key={item}><Check size={15} /> {item}</p>)}</div>
        <div><small>PRIVADO E LOCAL</small>{privateItems.map((item) => <p key={item}><EyeOff size={15} /> {item}</p>)}</div>
      </div>
      <p className="review-note">Gemini não recebe o witness. A 1AM mostra a transação final antes de qualquer envio.</p>
    </motion.section>
  );
}

function AnimateProofResult({ state, message, receipt }: { state: "idle" | "proving" | "success" | "error"; message: string | null; receipt: ProofReceipt | null }) {
  if (state === "idle" || !message) return null;
  return (
    <motion.section className={`proof-result proof-result--${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite" initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: "auto", y: 0 }}>
      <span>{state === "success" ? <CheckCircle2 size={19} /> : state === "proving" ? <CircleDashed size={19} className="spin" /> : <EyeOff size={19} />}</span>
      <div><strong>{state === "success" ? "Prova confirmada" : state === "proving" ? "Prova em andamento" : "Ação necessária"}</strong><small>{message}</small>{receipt && <code>{receipt.network} · contrato {shortAddress(receipt.contractAddress)} · tx {shortAddress(receipt.proofTxId)}</code>}</div>
    </motion.section>
  );
}

function ProofLayer({ icon, title, note, state }: { icon: ReactNode; title: string; note: string; state: "done" | "pending" | "idle" }) {
  return <div className={`proof-layer ${state === "idle" ? "is-idle" : ""}`}><span>{icon}</span><div><strong>{title}</strong><small>{note}</small></div>{state === "done" ? <Check size={18} className="state-done" /> : state === "pending" ? <CircleDashed size={18} className="state-pending spin" /> : null}</div>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}
