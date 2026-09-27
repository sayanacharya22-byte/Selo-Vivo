import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Selo Vivo UI failure", { name: error.name, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="fatal-state">
        <div className="fatal-state__mark"><AlertTriangle size={26} /></div>
        <p className="eyebrow">Falha isolada no aplicativo</p>
        <h1>Seus dados privados não foram publicados.</h1>
        <p>Recarregue a interface para retomar. Nenhuma prova é enviada sem uma confirmação explícita da carteira.</p>
        <button type="button" onClick={() => window.location.reload()}><RefreshCw size={17} /> Recarregar com segurança</button>
      </main>
    );
  }
}
