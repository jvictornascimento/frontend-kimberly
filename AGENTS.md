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
