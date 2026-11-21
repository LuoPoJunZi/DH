import { Component, type ErrorInfo, type ReactNode } from 'react';

const RELOAD_FLAG_KEY = 'luopo-chunk-reload';

interface ToolErrorBoundaryProps {
  children: ReactNode;
}

interface ToolErrorBoundaryState {
  failed: boolean;
}

function isChunkLoadError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /dynamically imported module|Importing a module script failed|module script|Loading chunk|Failed to fetch/i.test(
    error.message,
  );
}

const RELOAD_COOLDOWN_MS = 30_000;

function tryReloadOnce() {
  try {
    const lastReload = Number(window.sessionStorage.getItem(RELOAD_FLAG_KEY));
    // Avoid reload loops when the asset is genuinely unavailable.
    if (Number.isFinite(lastReload) && Date.now() - lastReload < RELOAD_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * Error boundaries still require a class component in React 19.
 * Catches lazy tool chunk failures (e.g. stale hashed assets after a redeploy)
 * so a single tool failure never blanks the whole site.
 */
export class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  state: ToolErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ToolErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isChunkLoadError(error) && tryReloadOnce()) return;
    console.error('Tool failed to render', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="tool-loading tool-loading--error" role="alert">
        <div>
          <p>工具加载失败，可能是网站刚刚更新或网络不稳定。</p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }
}
