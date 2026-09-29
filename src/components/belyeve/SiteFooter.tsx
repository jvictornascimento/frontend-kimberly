import logo from "@/assets/belyeve-logo.png.asset.json";
import { COMPANY_LEGAL_LINE, LEGAL_LINKS, SOCIAL_LINKS, type SiteLink } from "@/data/site";

function LinkList({ links, label }: { links: SiteLink[]; label: string }) {
  const available = links.filter((l): l is { label: string; href: string } => Boolean(l.href));
  if (available.length === 0) return null;
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {available.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="py-1 transition-colors hover:text-foreground" target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-background px-5 pt-12 pb-24 sm:px-8 md:pb-12">
      <div className="mx-auto max-w-3xl">
        <img src={logo.url} alt="BELYEVE Joias e Semijoias" className="h-9 w-auto" loading="lazy" />
        <div className="rule-gold mt-8 w-full" aria-hidden />
        <div className="mt-8 grid gap-5 text-xs text-muted-foreground">
          <LinkList links={SOCIAL_LINKS} label="Redes sociais" />
          <nav aria-label="Atalhos">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li><a href="#escolher" className="py-1 hover:text-foreground">Quero meu Scoop</a></li>
              <li><a href="#como-funciona" className="py-1 hover:text-foreground">Como funciona</a></li>
              <li><a href="#faq" className="py-1 hover:text-foreground">Dúvidas</a></li>
            </ul>
          </nav>
          <LinkList links={LEGAL_LINKS} label="Informações" />
          <p>
            © {new Date().getFullYear()} BELYEVE — Joias e Semijoias
            {COMPANY_LEGAL_LINE ? ` · ${COMPANY_LEGAL_LINE}` : ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
