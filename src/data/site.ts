/**
 * Dados institucionais do rodapé. Enquanto um valor for null, o link não aparece.
 * Não inventar URLs, CNPJ, endereço, e-mail ou telefone — preencher com os dados oficiais.
 */
export interface SiteLink {
  label: string;
  href: string | null;
}

export const SOCIAL_LINKS: SiteLink[] = [
  { label: "Instagram", href: null },
  { label: "TikTok", href: null },
];

export const LEGAL_LINKS: SiteLink[] = [
  { label: "Política de Privacidade", href: null },
  { label: "Termos de Uso", href: null },
  { label: "Contato", href: null },
];

/** Ex.: "CNPJ 00.000.000/0000-00" — null = não exibido. */
export const COMPANY_LEGAL_LINE: string | null = null;
