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

## Fluxo Git obrigatório
- Toda tarefa, problema, melhoria ou correção deve começar por uma Issue clara.
- Fluxo esperado: Issue -> branch dedicada -> implementação -> commits pequenos -> validação -> PR/merge -> main.
- A branch `main` deve permanecer estável.
- Não desenvolver diretamente na `main`.
- Cada Issue deve representar um problema ou objetivo suficientemente claro.
- Não agrupar várias mudanças não relacionadas na mesma Issue.
- Não fazer merge automático na `main` sem que o fluxo atual do projeto permita ou solicite isso.

## Branches
- Cada Issue deve ser resolvida em uma branch separada.
- Usar nomes simples, descritivos e em inglês.
- Exemplos: `fix/checkout-validation`, `test/checkout-domain`, `feat/order-api`, `feat/asaas-webhook`, `refactor/payment-service`, `docs/postgres-architecture`.
- Não criar branches genéricas como `changes`, `updates`, `work`, `fix-stuff`.
- Quando houver número da Issue disponível, ele pode ser usado no nome da branch se isso estiver de acordo com o fluxo atual do repositório.

## Commits
- Commits devem ser pequenos, focados, semanticamente coerentes, fáceis de revisar e fáceis de reverter.
- Não fazer um único commit gigante para uma tarefa composta por mudanças independentes.
- Usar Conventional Commits.
- Mensagens de commit devem ser escritas em inglês simples, objetivo e curto, com linguagem aproximada CEFR B1.
- Exemplos: `test: add checkout validation tests`, `fix: update payment confirmation message`, `feat: add order validation schema`, `refactor: isolate shipping calculation`, `docs: update backend architecture`, `chore: configure vitest`, `docs: define PostgreSQL as main database`.
- Evitar mensagens vagas como `fix: improvements`, `update things`, `changes`, `final fix`.

## Stack definida
- Frontend: TanStack Start, React e TypeScript.
- Backend: Spring Boot, Java 21 e PostgreSQL.
- Validação obrigatória de entradas externas: Jakarta Bean Validation no backend, com validações de domínio em serviços/use cases.
- Banco de dados: PostgreSQL.
- Não apresentar Cloudflare Workers, Hono ou TypeScript como backend planejado.
- Não apresentar o banco como alternativa entre D1 e PostgreSQL; PostgreSQL está definido.

## Backend Spring Boot
- O backend já está implementado em `backend/`, com Spring Boot, Java 21, PostgreSQL, JPA e migrations Flyway. Este repositório contém frontend e backend.
- O backend Spring Boot será utilizado como API HTTP da BELYEVE e autoridade para pedidos, preços, frete, totais e estado de pagamento.
- Controllers não devem concentrar regras de negócio.
- Arquitetura conceitual: HTTP -> Controllers / Filters -> Input Validation -> Application / Use Cases -> Domain -> Repositories / Integrations.
- Evitar lógica de negócio complexa diretamente dentro dos controllers.
- Controllers devem permanecer pequenos e focados em responsabilidades HTTP.
- O backend será implantado em VPS com Docker, junto com PostgreSQL.
- Manter a solução simples, sem painel administrativo, login, JWT ou microsserviços enquanto o objetivo for somente armazenar vendas e suportar o checkout.

## PostgreSQL
- PostgreSQL é a decisão definitiva de banco de dados.
- A hospedagem atual planejada é VPS própria via Docker Compose, podendo migrar futuramente para serviço gerenciado de PostgreSQL.
- A implementação deve preservar a possibilidade de mudar a hospedagem sem reescrever regras de negócio.
- Não provisionar infraestrutura sem tarefa explícita.
- O volume inicialmente esperado é inferior a 100 novos registros por mês.
- Priorizar simplicidade operacional, segurança, backups, migrations e manutenção.
- Não introduzir infraestrutura desnecessária, microsserviços ou soluções complexas de escalabilidade.
- Não confundir baixo volume de gravações com ausência de consultas ou eventos de webhook.
- A futura implementação deve considerar migrations versionadas, integridade referencial, constraints no banco, transações para operações críticas, valores monetários com representação exata, idempotência de eventos de pagamento, índices justificados pelas consultas reais, backups e estratégia de restauração.
- Usar migrations versionadas com Flyway.
- JPA/Hibernate pode ser usado de forma simples quando não espalhar regras de negócio em entidades ou controllers.
- Usar consultas parametrizadas ou mecanismos seguros equivalentes.
- Nunca colocar credenciais do PostgreSQL no frontend ou no repositório.
- A conexão de produção deve utilizar transporte seguro, autenticação adequada e privilégios mínimos.

## Validação nas fronteiras
- Toda entrada externa deve ser considerada não confiável.
- No backend Spring Boot, Jakarta Bean Validation deve ser utilizado para validação estrutural nas fronteiras da aplicação.
- Validar, quando aplicável: request body, query parameters, path parameters, headers relevantes, cookies, dados recebidos por webhook, dados vindos de APIs externas, payloads de integrações e valores enviados pelo frontend.
- Não considerar uma entrada segura apenas porque veio do frontend BELYEVE, porque TypeScript possui um tipo para ela, porque o formulário frontend já valida, ou porque a requisição veio de uma integração conhecida.
- TypeScript não substitui runtime validation.
- Frontend validation não substitui backend validation.
- DTOs externos devem ser restritivos.
- Quando apropriado, usar limites de tamanho, enums, formatos, ranges, normalização segura, rejeição de propriedades inesperadas e rejeição de valores inválidos.
- Não aceitar entradas simplesmente porque podem ser convertidas para o tipo esperado.
- Se esperamos `scoopQuantity = 1 | 2 | 3`, não aceitar arbitrariamente qualquer inteiro positivo.
- Se esperamos `jewelryCategory = GOLD | SILVER`, não aceitar strings arbitrárias.
- Toda entrada textual controlada pelo usuário deve possuir limites adequados quando possível: nome, email, telefone, CPF, CEP, endereço, complemento, observações, restrições e identificadores recebidos em URLs.
- Os limites definitivos serão estabelecidos durante a implementação de cada contrato.

## Validação, domínio e integrações
- Bean Validation responde: "A entrada possui uma estrutura e formato aceitáveis?"
- Application/Domain responde: "Essa operação é válida segundo as regras da BELYEVE?"
- Infrastructure/Integration responde: "O resultado ou evento externo é autêntico, esperado e pode ser processado?"
- Não colocar todas as regras de negócio dentro de DTOs/anotações de validação.
- Não utilizar validação estrutural como substituto do domínio.
- Respostas e eventos de Asaas, Melhor Envio, WhatsApp e futuras integrações também cruzam fronteira externa e devem ser tratados defensivamente.
- Fluxo esperado para providers: External Provider -> validation/parsing -> provider adapter -> BELYEVE domain model.
- Não espalhar objetos específicos de providers pelo domínio.

## Frontend nunca é autoridade comercial
- Nunca confiar em valores comerciais enviados pelo navegador.
- Mesmo que o frontend envie valores como `unitPrice`, `subtotal`, `discount`, `shipping`, `total`, `promotion` ou `freeShipping`, eles não devem ser tratados como fonte de verdade pelo backend.
- O backend deve determinar ou validar novamente preço atual, quantidade permitida, promoção válida, desconto, elegibilidade para entrega gratuita, valor do frete, subtotal e total final.
- O navegador pode calcular valores para UX/display, mas isso não torna esses valores autoritativos.

## Segurança por padrão
- Usar uma postura assume breach / untrusted input nas fronteiras externas.
- Preferir deny by default em vez de accept by default.
- Não confiar em IDs, status, preços, permissões, flags, URLs, callbacks ou valores comerciais somente porque foram enviados pelo cliente.
- Toda decisão sensível deve ser validada no contexto correto.
- Nunca commitar API keys, access tokens, webhook secrets, credenciais, senhas, private keys ou dados sensíveis.
- Nunca registrar em logs CVV, número completo do cartão, access tokens, API keys, webhook secrets, senhas, credentials ou outros secrets.
- Dados pessoais também devem ser tratados com cuidado.
- Não adicionar logging excessivo de request bodies completos.
- Erros enviados ao cliente devem ser úteis, mas não devem revelar stack traces, secrets, SQL, detalhes internos da infraestrutura, credenciais ou implementação interna desnecessária.
- Logs internos podem conter contexto técnico seguro para diagnóstico, respeitando as regras de dados sensíveis.

## Regras BELYEVE e Scoop
- BELYEVE Scoop é uma experiência mobile-first para clientes vindos principalmente de Instagram e TikTok.
- Mensagem principal da landing: "A cada Scoop, muitas surpresas."
- CTA principal: "QUERO MEU SCOOP".
- Usuários que já entendem o produto devem conseguir ir do Hero CTA para seleção de Scoop sem ler a landing inteira.
- Cada Scoop individual garante no mínimo 2 joias e 3 brindes surpresa.
- 1 Scoop = mínimo de 5 itens.
- O processo pode resultar em pacotes adicionais, mas pacotes extras nunca são garantidos.
- Não inventar probabilidades.
- Não usar linguagem de jogo, aposta, cassino ou gambling.
- A cliente escolhe exatamente uma preferência de joia: Dourado, Prata/inox ou Misto.
- Dourado contém semijoias banhadas a ouro.
- Prata pode conter semijoias banhadas a prata, Prata 925 e peças em inox.
- Misto pode conter peças douradas e Prata/inox.
- A cliente não escolhe o modelo exato da joia.
- Não usar textos como "personalize seu Scoop", "monte seu Scoop", "Scoop do seu jeito" ou "escolha suas peças".
- O campo opcional de restrições representa peças que a cliente não usa; ele não transforma o Scoop em produto configurável.
- Se `usesRings = false`, não solicitar tamanho de anel.
- Se `usesRings = true`, tamanho de anel é obrigatório.
- Tamanhos de anel devem vir de configuração/dados.
- O checkout também pode perguntar se o Scoop pode conter peças masculinas e, quando sim, qual preferência usar: Dourado, Prata/inox ou Misto.
- O checkout também pode perguntar se pode conter piercing de furo Prata 925 e, quando sim, quais locais são aceitos: nariz e/ou orelha (hélix).
- Categorias possíveis de brindes incluem skincare, maquiagem, cosméticos, cuidados para unhas, chaveiros e outros produtos.
- A comunicação pode incluir "e muito mais".
- Não fixar o domínio em uma lista fechada de brindes sem necessidade.
- A mecânica atual usa florzinha para pacote de joia e bolinha dourada para brinde surpresa.
- Uma mecânica futura de item raro não está ativa; não implementar prêmios raros sem solicitação explícita.

## Vídeo e consentimento
- Kimberly grava o processo do Scoop, da pesca até a contagem/abertura dos pacotes relevantes.
- A cliente recebe o vídeo pelo WhatsApp.
- Entrega esperada do vídeo: 2 a 5 dias úteis.
- Não construir infraestrutura de geração automática de vídeo sem solicitação explícita.
- Durante o checkout, a cliente deve responder explicitamente se a BELYEVE pode publicar o vídeo no Instagram e TikTok.
- Campo conceitual: `socialMediaConsent: boolean`.
- Nenhuma opção pode vir pré-selecionada.
- As duas escolhas devem ter peso visual equivalente.
- A cliente pode comprar normalmente quando `socialMediaConsent = false`.
- Falta de consentimento nunca deve impedir a compra; o obrigatório é responder à pergunta.

## Frete e despacho
- Pedidos entregues em Pedreira/SP têm frete grátis e entrega local pela BELYEVE.
- Detalhes da entrega local podem ser combinados depois pelo WhatsApp.
- Para outras localidades, o frete será calculado usando Melhor Envio.
- O frontend nunca deve se comunicar diretamente com APIs privadas do Melhor Envio.
- Arquitetura esperada: Frontend -> BELYEVE Backend -> Melhor Envio.
- O backend é autoridade para preços e elegibilidade de frete.
- Validação frontend nunca deve ser tratada como autoridade para frete grátis.
- A cliente recebe o vídeo primeiro.
- Depois do vídeo e da confirmação pelo WhatsApp, começa o prazo de despacho.
- Prazo esperado de despacho: até 7 dias após confirmação pelo WhatsApp.
- Não calcular o prazo de 7 dias a partir da confirmação de pagamento.

## Checkout, pagamentos e pedidos
- Checkout não exige conta; guest checkout é o padrão.
- Dados esperados incluem nome completo, WhatsApp, email, CPF e endereço.
- Não introduzir cadastro de conta sem solicitação explícita.
- Provedor de pagamento: Asaas.
- Métodos suportados: PIX e cartão de crédito.
- Cartão de crédito: até 3 parcelas.
- Parcelas podem incluir taxas.
- Backend/provedor determinam os valores autoritativos de parcelas e taxas.
- Não hardcodar cálculos financeiros autoritativos na UI.
- Frontend nunca deve conter secrets ou credenciais privadas do Asaas.
- Arquitetura esperada: Frontend -> BELYEVE Backend -> Asaas API.
- Mudanças de estado de pagamento são assíncronas.
- Asaas webhooks serão processados pelo backend.
- Frontend nunca deve assumir "clicou no botão final = pago".
- Estados conceituais devem distinguir draft, awaiting payment, processing, paid, failed, cancelled/refunded quando aplicável.
- Não acoplar o domínio diretamente a nomes de eventos do Asaas.
- Eventos do provider devem ser traduzidos para estados do domínio BELYEVE.
- Notificações internas de compra confirmada devem ser disparadas pelo backend após confirmação autoritativa de pagamento, não por ação do navegador.
- O envio de email de compra confirmada deve usar configuração de ambiente para remetente/destinatário e nunca commitar credenciais SMTP.
- Um pedido deve preservar informações suficientes para reconstruir o que a cliente comprou naquele momento.
- Valores comerciais importantes devem ser snapshotados no pedido quando apropriado.
- Não referenciar cegamente preços mutáveis atuais quando dados históricos precisam permanecer estáveis.

## Webhooks
- Webhooks devem considerar autenticidade, mecanismo de autenticação/verificação suportado pelo provider, idempotência, eventos duplicados, ordem inesperada de eventos, retries, payload validation, safe state transitions e observabilidade suficiente para diagnóstico.
- Para Asaas, consultar a documentação oficial atual antes da implementação.
- Não presumir nomes de eventos, headers, autenticação ou comportamento com base apenas em conhecimento anterior.
- Nunca confiar em status de pagamento enviado pelo browser.

## Promoção
- A promoção de lançamento usa contador baseado em data absoluta configurada.
- Configuração conceitual: `LAUNCH_PROMO_END_DATE`.
- Nunca resetar promoção por refresh, rebuild ou novo deploy.
- Não criar falsa urgência.

## Integrações planejadas
- Asaas: pagamentos e eventos de pagamento.
- Melhor Envio: cálculo e operações de frete.
- WhatsApp: comunicação futura com clientes.
- Arquitetura esperada: Frontend -> BELYEVE Backend -> External Providers.
- O frontend nunca deve possuir credenciais privadas dos providers.
- Manter provider-specific logic atrás de boundaries/adapters explícitos.

## Testes
- Regras business-critical devem ter testes automatizados.
- Cenários prioritários: regras mínimas do Scoop, validação de categoria de joia, tamanho de anel condicional, pricing, expiração da promoção, regra de frete grátis em Pedreira, contratos/cálculos de frete, total do pedido, transições de pagamento, idempotência de webhook, eventos duplicados, transições inválidas de pagamento.
- Além dos happy paths, schemas e regras críticas devem possuir testes para entradas inválidas.
- Quando aplicável, testar missing fields, unexpected fields, invalid enums, invalid formats, oversized strings, invalid ranges, inconsistent combinations, manipulated commercial values, duplicate webhook events e invalid state transitions.
- Fronteiras de integração devem ser testáveis sem provider real durante a execução normal de testes.

## Sequência de desenvolvimento
- Prompts 1-6: Lovable - frontend, design e UX.
- Prompt 7: Codex - inspeção do repositório e planejamento.
- Backend MVP já implementado: criação e consulta de pedidos, preços e totais no backend, PIX e cartão via Asaas, webhook autenticado com tratamento de duplicatas e email interno após pagamento confirmado.
- Asaas possui configurações separadas para sandbox e produção, selecionadas por `ASAAS_ENVIRONMENT`; sandbox é o padrão.
- Email interno e email de confirmação para a cliente são implementados em `PurchaseEmailService`, após evento autoritativo de pagamento e commit da transação. `PURCHASE_EMAIL_ENABLED` e `PURCHASE_CUSTOMER_EMAIL_ENABLED` controlam cada envio de forma independente; ambos são desativados por padrão. SMTP deve ser configurado por ambiente.
- Melhor Envio ainda está pendente na Issue #27. Atualmente, o backend usa `NON_LOCAL_SHIPPING_CENTS` como tarifa temporária fora de Pedreira/SP; isso não representa cotação real do provider.
- Frontend, backend e PostgreSQL possuem configuração Docker Compose. Não provisionar ou alterar produção sem tarefa explícita.
- Backend: Spring Boot + Java 21 + PostgreSQL + Docker em VPS.
- Banco: PostgreSQL.
- Hospedagem do PostgreSQL: VPS via Docker Compose inicialmente.
- As demais integrações reais serão implementadas incrementalmente, nas respectivas Issues.
- Não tratar Prompt 7 como permissão para grande rewrite.
- Não implementar provider real ou infraestrutura fora do escopo da Issue atual.
