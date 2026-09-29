import { Section } from "./Section";
import { SCOOP_VIDEOS } from "@/data/media";

/**
 * Seção de vídeos reais (formato vertical 9:16, Reels/TikTok).
 * Fica oculta enquanto SCOOP_VIDEOS estiver vazio — nunca exibe conteúdo fictício.
 */
export function VideoShowcase() {
  if (SCOOP_VIDEOS.length === 0) return null;
  return (
    <Section id="videos" eyebrow="Vídeos reais" title="Pescas de verdade">
      <div className="-mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {SCOOP_VIDEOS.map((v) => (
          <figure key={v.id} className="w-44 shrink-0 snap-start sm:w-52">
            <video
              src={v.src}
              poster={v.poster}
              controls
              playsInline
              preload="none"
              className="aspect-[9/16] w-full rounded-sm bg-sand object-cover"
            />
            {v.caption && <figcaption className="mt-2 text-xs text-muted-foreground">{v.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </Section>
  );
}
