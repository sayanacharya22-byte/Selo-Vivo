import {
  BarChart3,
  ChevronRight,
  EyeOff,
  Home,
  Leaf,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";

import { BrandMark } from "./BrandMark";

const nav = [
  { label: "Visão geral", icon: Home, available: false },
  { label: "Proof Studio", icon: ShieldCheck, available: true },
  { label: "Credenciais", icon: WalletCards, available: false },
  { label: "Verificar", icon: Network, available: false },
  { label: "Inteligência", icon: Sparkles, available: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <div>
        <div className="brand-lockup">
          <BrandMark />
          <div>
            <strong>selo vivo</strong>
            <span>Midnight passport</span>
          </div>
        </div>
        <nav className="side-nav" aria-label="Navegação principal">
          {nav.map(({ label, icon: Icon, available }) => (
            <button key={label} type="button" className={available ? "active" : ""} disabled={!available} aria-current={available ? "page" : undefined} title={available ? undefined : "Área planejada para uma próxima versão"}>
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
              {!available && <small>em breve</small>}
            </button>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <a href="#privacy-boundary" className="privacy-link">
          <span className="privacy-link__icon"><EyeOff size={17} /></span>
          <span><strong>Modelo de privacidade</strong><small>A credencial fica local. Só o resultado escolhido chega ao ledger.</small></span>
          <ChevronRight size={15} />
        </a>
        <div className="sidebar-stat">
          <Leaf size={18} />
          <span><strong>Instituto Raiz</strong><small>emissor ativo</small></span>
          <BarChart3 size={16} />
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      <button className="mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
        <Menu size={21} />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="mobile-drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <button type="button" className="drawer-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={20} /></button>
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="main-canvas">{children}</main>
    </div>
  );
}
