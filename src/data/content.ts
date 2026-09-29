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
    q: "O que vem garantido em cada Scoop?",
    a: "No mínimo 2 joias e 3 brindes surpresa por Scoop.",
  },
  {
    q: "Eu escolho as peças que vou receber?",
    a: "Não. Você escolhe a categoria Dourado ou Prata e informa sobre o uso de anéis. Quais joias e brindes aparecem é a parte surpresa da experiência.",
  },
  {
    q: "Quais tipos de joias podem vir?",
    a: "Semijoias banhadas a ouro, semijoias banhadas a prata, Prata 925 e inox.",
  },
  {
    q: "E os brindes?",
    a: "Podem incluir skincare, maquiagem, cosméticos, produtos para cuidados das unhas, chaveiros, entre outros.",
  },
  {
    q: "Posso receber mais do que o mínimo?",
    a: "Sim. A pesca pode resultar em pacotes extras, e os itens extras também são seus.",
  },
];
