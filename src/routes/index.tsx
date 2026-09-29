import { createFileRoute } from "@tanstack/react-router";

import { BrandBar } from "@/components/belyeve/BrandBar";
import { Hero } from "@/components/belyeve/Hero";
import { ScoopSelector } from "@/components/belyeve/ScoopSelector";
import { Guarantee } from "@/components/belyeve/Guarantee";
import { HowItWorks } from "@/components/belyeve/HowItWorks";
import { Fishing } from "@/components/belyeve/Fishing";
import { VideoShowcase } from "@/components/belyeve/VideoShowcase";
import { Faq } from "@/components/belyeve/Faq";
import { InsideScoop } from "@/components/belyeve/InsideScoop";
import { FinalCta } from "@/components/belyeve/FinalCta";
import { SiteFooter } from "@/components/belyeve/SiteFooter";

const title = "BELYEVE — Scoop Surpresa";
const description =
  "Cada Scoop da BELYEVE garante no mínimo 2 joias e 3 brindes surpresa. Escolha 1, 2 ou 3 Scoops e descubra o que a pesca revela.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      <BrandBar />
      <Hero />
      <ScoopSelector />
      <Guarantee />
      <HowItWorks />
      <Fishing />
      <VideoShowcase />
      <Faq />
      <InsideScoop />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
