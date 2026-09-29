import { useState } from "react";
import type { MediaItem } from "@/data/media";
import { cn } from "@/lib/utils";

/** Imagem com proporção fixa, fallback e selo discreto quando for mock. */
export function MediaImage({
  item,
  ratio = "4/5",
  className,
  priority,
}: {
  item: MediaItem;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure
      className={cn("relative overflow-hidden rounded-sm bg-sand", className)}
      style={{ aspectRatio: ratio }}
    >
      {!failed ? (
        <img
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
          {item.alt}
        </div>
      )}
      {item.mock && (
        <figcaption className="absolute bottom-2 left-2 rounded-sm bg-cream/85 px-2 py-0.5 text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
          Imagem ilustrativa
        </figcaption>
      )}
    </figure>
  );
}
