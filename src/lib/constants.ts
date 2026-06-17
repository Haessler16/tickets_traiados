import type { EventCategory } from "@/types/database";

export const CATEGORIES: EventCategory[] = [
  "Música",
  "Comida & Bebida",
  "Cultura",
  "Desporto",
  "Festivais",
  "Teatro",
  "Outros",
];

export const CITIES = [
  "Todas",
  "Lisboa",
  "Porto",
  "Braga",
  "Coimbra",
  "Faro",
  "Funchal",
] as const;

export type City = (typeof CITIES)[number];

export const APP_NAME = "3cket";
