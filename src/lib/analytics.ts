/**
 * Ponto único para eventos de analytics futuros.
 * Nesta etapa NADA é enviado — `track` é intencionalmente um no-op.
 * TODO: conectar Meta Pixel / GA4 / TikTok Pixel aqui quando forem contratados.
 */
export type AnalyticsEvent =
  | "view_scoop_options"
  | "select_scoop"
  | "begin_checkout"
  | "shipping_calculated"
  | "select_payment_method"
  | "purchase";

export function track(_event: AnalyticsEvent, _params?: Record<string, unknown>): void {
  // Intencionalmente vazio até a integração de analytics.
}
