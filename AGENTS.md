<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Estrutura BELYEVE
- Seções da landing vivem em `src/components/belyeve/` e são compostas em `src/routes/index.tsx`; conteúdo e regras ficam em `src/data/` (scoops.ts, content.ts) para manter apresentação separada de dados e preparar integrações futuras.
- Checkout vive em `src/features/checkout/` (types, config, services, adapters, mocks, domain, state, hooks) e UI em `src/components/checkout/`; componentes só chamam hooks/services, nunca HTTP direto, para trocar mocks pelo backend BELYEVE sem refazer a UI.
- Integrações futuras ficam marcadas com `TODO:` somente em `services/checkout.service.ts`; `VITE_API_BASE_URL` vazio = modo mock.
- Dados de cartão ficam só no estado local do `CardForm`; o store (sessionStorage) nunca guarda dados sensíveis de pagamento.
- Rodapé lê links/CNPJ de `src/data/site.ts` (null = oculto) para nunca inventar dados institucionais.
- Vídeos reais entram em `SCOOP_VIDEOS` (`src/data/media.ts`); a seção fica oculta enquanto vazia.
- Eventos de analytics passam por `track()` em `src/lib/analytics.ts` (no-op até contratar ferramentas); CTAs usam `data-analytics`.
