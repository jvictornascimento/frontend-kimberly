import logo from "@/assets/belyeve-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <img src={logo.url} alt="BELYEVE Joias e Semijoias" className="h-9 w-auto" />
        <div className="rule-gold mt-8 w-full" aria-hidden />
        <div className="mt-8 grid gap-6 text-xs text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto]">
          <p className="min-w-0 max-w-xs leading-relaxed">
            BELYEVE — Joias e Semijoias. Scoop Surpresa: mínimo garantido de 2 joias e 3 brindes por
            Scoop.
          </p>
          <nav className="flex shrink-0 gap-5">
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <a href="#escolher" className="hover:text-foreground">
              Comprar
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
