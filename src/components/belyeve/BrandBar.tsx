import { BrandLogo } from "./BrandLogo";

export function BrandBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 sm:px-8">
        <a href="#top" className="flex min-w-0 items-center">
          <BrandLogo />
        </a>
        <a
          href="#escolher"
          className="shrink-0 rounded-sm bg-primary px-4 py-2 text-xs font-semibold tracking-[0.12em] text-primary-foreground uppercase transition-colors hover:bg-sage"
        >
          Quero meu Scoop
        </a>
      </div>
    </header>
  );
}
