"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallVariant = "icon" | "full";

function DownloadGlyph({ gradientId }: { gradientId: string }) {
  const stroke = `url(#${gradientId})`;

  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="var(--install-arrow-1)" />
          <stop offset="100%" stopColor="var(--install-arrow-2)" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="var(--install-arrow-stroke)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.2v10" />
        <path d="m7.6 10.4 4.4 4.4 4.4-4.4" />
        <path d="M4.9 16.6v2.1a1.7 1.7 0 0 0 1.7 1.7h10.8a1.7 1.7 0 0 0 1.7-1.7v-2.1" />
      </g>
      <g
        fill="none"
        stroke={stroke}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.2v10" />
        <path d="m7.6 10.4 4.4 4.4 4.4-4.4" />
        <path d="M4.9 16.6v2.1a1.7 1.7 0 0 0 1.7 1.7h10.8a1.7 1.7 0 0 0 1.7-1.7v-2.1" />
      </g>
    </svg>
  );
}

export function InstallAppButton({
  variant = "icon",
  className = "",
}: {
  variant?: InstallVariant;
  className?: string;
}) {
  const gradientId = `install-gold-${useId().replace(/:/g, "")}`;
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    setIsIOS(
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showHelp) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowHelp(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showHelp]);

  const install = useCallback(async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }

    setShowHelp(true);
  }, [promptEvent]);

  if (installed) return null;

  const label = "Instalar o aplicativo";
  const buttonClass = `install-btn ${variant === "full" ? "install-btn-full" : ""} ${className}`.trim();

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={buttonClass}
        aria-label={label}
        title={label}
      >
        <DownloadGlyph gradientId={gradientId} />
        {variant === "full" ? <span>Instalar app</span> : null}
      </button>

      {showHelp && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
              role="dialog"
              aria-modal="true"
              aria-labelledby="install-help-title"
              onClick={(event) => {
                if (event.target === event.currentTarget) setShowHelp(false);
              }}
            >
              <div className="card w-full max-w-sm pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="install-btn pointer-events-none">
                      <DownloadGlyph gradientId={`${gradientId}-dialog`} />
                    </span>
                    <div>
                      <h2
                        id="install-help-title"
                        className="text-lg font-semibold tracking-tight text-[var(--text)]"
                      >
                        Instalar o CEPK Absence
                      </h2>
                      <p className="text-xs text-[var(--muted)]">
                        Fica na tela inicial, como um app.
                      </p>
                    </div>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setShowHelp(false)}
                    aria-label="Fechar"
                    className="theme-toggle"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>

                {isIOS ? (
                  <ol className="mt-5 space-y-3 text-sm text-[var(--muted)]">
                    <li className="flex gap-3">
                      <span className="badge bg-[var(--surface-3)] text-[var(--text)]">1</span>
                      <span>
                        Abra esta página no <strong className="text-[var(--text)]">Safari</strong> e
                        toque no botão <strong className="text-[var(--text)]">Compartilhar</strong>{" "}
                        (quadrado com a seta para cima).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="badge bg-[var(--surface-3)] text-[var(--text)]">2</span>
                      <span>
                        Escolha{" "}
                        <strong className="text-[var(--text)]">
                          Adicionar à Tela de Início
                        </strong>
                        .
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="badge bg-[var(--surface-3)] text-[var(--text)]">3</span>
                      <span>
                        Confirme em{" "}
                        <strong className="text-[var(--text)]">Adicionar</strong>. O ícone do CEPK
                        aparece junto aos seus apps.
                      </span>
                    </li>
                  </ol>
                ) : (
                  <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
                    <p>
                      Abra o menu do navegador{" "}
                      <strong className="text-[var(--text)]">(⋮)</strong> e escolha{" "}
                      <strong className="text-[var(--text)]">Instalar aplicativo</strong> ou{" "}
                      <strong className="text-[var(--text)]">
                        Adicionar à tela inicial
                      </strong>
                      .
                    </p>
                    <p className="text-xs text-[var(--muted-2)]">
                      No computador, o ícone de instalação costuma aparecer na barra de endereço.
                      Se o navegador não oferecer a opção, use Chrome, Edge ou Safari atualizados.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="btn-primary mt-6 w-full"
                >
                  Entendi
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
