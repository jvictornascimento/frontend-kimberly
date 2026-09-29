/** Conteúdo editorial da landing. Texto real da marca entra aqui. */

export interface JourneyStep {
  title: string;
  body: string;
  detail?: string;
  note?: string;
}

export const HOW_IT_WORKS_STEPS: JourneyStep[] = [
  {
    title: "Escolha seu Scoop",
    body: "Você escolhe 1, 2 ou 3 Scoops e informa os dados necessários para o pedido.",
  },
  {
    title: "Fazemos a pesca",
    body: "A Kimberly faz a pesca do seu Scoop e grava tudo, da pesca até a contagem dos pacotinhos encontrados.",
  },
  {
    title: "Você recebe seu vídeo",
    body: "O vídeo chega pelo WhatsApp informado no pedido.",
    detail: "de 2 a 5 dias úteis",
  },
  {
    title: "Sua caixinha vai até você",
    body: "Depois do vídeo e da confirmação pelo WhatsApp, preparamos seu pedido e enviamos o código de rastreamento.",
    detail: "Despacho em até 7 dias após a confirmação pelo WhatsApp",
    note: "Entrega grátis em Pedreira/SP, combinada pelo WhatsApp. Para outras cidades, o frete é calculado pelo CEP.",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Quantos itens vêm em cada Scoop?",
    a: "No mínimo 5 itens: 2 joias + 3 brindes surpresa. Dependendo da pesca, podem aparecer pacotinhos extras.",
  },
  {
    q: "Posso receber mais de 5 itens?",
    a: "Pode! A pesca pode revelar itens extras. Eles não são garantidos, mas, se aparecerem, são todos seus.",
  },
  {
    q: "Posso escolher minhas joias?",
    a: "Não, o Scoop é surpresa. Você escolhe só a categoria: Dourado (semijoias banhadas a ouro) ou Prata (semijoias banhadas a prata, Prata 925 e peças em inox).",
  },
  {
    q: "E se eu não usar anéis?",
    a: "No pedido você conta se usa anéis. Se não usar, não precisa informar tamanho.",
  },
  {
    q: "Posso informar alguma peça que não uso?",
    a: "Sim. No pedido tem um espaço opcional para isso, por exemplo: \"Não uso pulseiras.\"",
  },
  {
    q: "Quando recebo meu vídeo?",
    a: "O vídeo do seu Scoop chega pelo WhatsApp informado no pedido em 2 a 5 dias úteis.",
  },
  {
    q: "Quando meu pedido será enviado?",
    a: "Depois do vídeo e da confirmação pelo WhatsApp, preparamos tudo e despachamos em até 7 dias. Aí você recebe o código de rastreamento.",
  },
  {
    q: "Como funciona o frete?",
    a: "Em Pedreira/SP a entrega é nossa e gratuita. Para outras cidades, o frete é calculado pelo CEP no checkout.",
  },
  {
    q: "Como posso pagar?",
    a: "PIX ou cartão de crédito em até 3x. O parcelamento pode ter acréscimo, que aparece antes de você finalizar.",
  },
  {
    q: "Meu vídeo será publicado nas redes sociais?",
    a: "Só com a sua autorização. No checkout você responde se autoriza ou não a publicação no Instagram e TikTok da BELYEVE — e pode comprar normalmente mesmo sem autorizar.",
  },
];
