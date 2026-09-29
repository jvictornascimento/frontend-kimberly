import { Section } from "./Section";

/**
 * Estrutura preparada para receber vídeos reais (Instagram/TikTok) depois.
 * Nenhum conteúdo fictício é exibido.
 */
export interface ScoopVideo {
  id: string;
  src: string;
  poster?: string;
  caption?: string;
}

export function VideoShowcase({ videos = [] }: { videos?: ScoopVideo[] }) {
  return (
    <Section
      id="videos"
      eyebrow="Vídeos reais"
      title="Pescas gravadas."
      intro="Espaço reservado para os vídeos reais das pescas."
    >
      {videos.length === 0 ? (
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] w-44 shrink-0 snap-start rounded-sm border border-dashed border-border bg-muted"
              aria-hidden
            />
          ))}
        </div>
      ) : (
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          {videos.map((v) => (
            <figure key={v.id} className="w-44 shrink-0 snap-start">
              <video
                src={v.src}
                poster={v.poster}
                controls
                playsInline
                className="aspect-[9/16] w-full rounded-sm object-cover"
              />
              {v.caption && (
                <figcaption className="mt-2 text-xs text-muted-foreground">{v.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}
