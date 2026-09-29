import { Section } from "./Section";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";
import { MEDIA } from "@/data/media";
import { GIFT_CATEGORIES, JEWELRY_CATEGORIES } from "@/data/scoops";

function CategoryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="eyebrow">{title}</h3>
      <ul className="mt-4">
        {items.map((item) => (
          <li key={item} className="border-b border-border py-2.5 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InsideScoop() {
  return (
    <Section
      id="o-que-pode-vir"
      eyebrow="Possibilidades"
      title="O que pode vir no seu Scoop?"
      intro="Cada pesca é única. Estes são alguns dos tipos de peças e mimos que podem aparecer."
    >
      <Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3">
          <MediaImage item={MEDIA.packets} ratio="1/1" />
          <MediaImage item={MEDIA.gifts} ratio="1/1" />
        </div>
      </Reveal>
      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <CategoryList title="Joias" items={JEWELRY_CATEGORIES} />
        <CategoryList title="Brindes surpresa" items={GIFT_CATEGORIES} />
      </div>
      <p className="font-display mt-10 text-center text-3xl text-gold-deep">E muito mais ✨</p>
    </Section>
  );
}
