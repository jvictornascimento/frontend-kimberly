/**
 * Registro central de imagens da landing.
 * TODAS são MOCKS ilustrativos temporários (mock: true) até chegarem as fotos oficiais.
 * Para substituir: troque o import/URL e marque mock: false — o layout não muda.
 */
import scoopPearls from "@/assets/mocks/scoop-pearls.jpg";
import packets from "@/assets/mocks/packets.jpg";
import box from "@/assets/mocks/box.jpg";
import gifts from "@/assets/mocks/gifts.jpg";

export interface MediaItem {
  src: string;
  alt: string;
  width: number;
  height: number;
  mock: boolean;
}

export const MEDIA = {
  scoop: {
    src: scoopPearls,
    alt: "Scoop dourado com pérolas, bolinhas e florzinhas douradas",
    width: 1024,
    height: 1280,
    mock: true,
  },
  packets: {
    src: packets,
    alt: "Pacotinhos dourados e prateados com pérolas e florzinhas",
    width: 1280,
    height: 1024,
    mock: true,
  },
  box: {
    src: box,
    alt: "Caixinha de apresentação com papel verde e laço dourado",
    width: 1024,
    height: 1280,
    mock: true,
  },
  gifts: {
    src: gifts,
    alt: "Itens de beleza neutros e chaveiro delicado",
    width: 1024,
    height: 1024,
    mock: true,
  },
} satisfies Record<string, MediaItem>;

/** Vídeos reais das pescas (vertical 9:16). Vazio = seção oculta. */
export interface ScoopVideo {
  id: string;
  src: string;
  poster?: string;
  caption?: string;
}

export const SCOOP_VIDEOS: ScoopVideo[] = [];
