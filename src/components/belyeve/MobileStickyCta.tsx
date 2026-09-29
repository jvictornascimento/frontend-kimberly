import { useEffect, useState } from "react";

/**
 * CTA inferior discreto, só no celular e só na landing.
 * Aparece depois do topo e some enquanto a seleção de Scoops ou o CTA final estão na tela,
 * para nunca cobrir os cards, os campos do pedido ou competir com outro botão.
 */
const HIDE_WHEN_VISIBLE = ["top", "escolher", "cta-final"];

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = HIDE_WHEN_VISIBLE.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const inView = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inView.add(e.target.id) : inView.delete(e.target.id)));
      setVisible(inView.size === 0);
    });
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 px-5 py-3 transition-transform duration-300 motion-reduce:transition-none md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="#escolher"
        tabIndex={visible ? 0 : -1}
        data-analytics="cta_sticky"
        className="flex min-h-12 w-full items-center justify-center rounded-sm bg-primary text-sm font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-colors hover:bg-sage"
      >
        Quero meu Scoop
      </a>
    </div>
  );
}
