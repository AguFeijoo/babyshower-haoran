// fixed = cantidad fija · unlimited = sin límite · money = dinero (cada invitado pone el monto)
export type GiftMode = "fixed" | "unlimited" | "money";
export const GIFT_MODES: GiftMode[] = ["fixed", "unlimited", "money"];

export type Gift = {
  id: number;
  mode: GiftMode;
  pledgeCount: number;
  category: string;
  name: string;
  description: string;
  link: string;
  quantity: number;
  pledged: number;
  remaining: number;
};

export type Pledge = {
  id: number;
  giftId: number;
  giverName: string;
  quantity: number;
  coGivers: string[];
  message: string;
  createdAt: string;
};

export type GiftInput = {
  mode?: GiftMode;
  category: string;
  name: string;
  description: string;
  link: string;
  quantity: number;
};

export type PledgeInput = {
  giftId: number;
  giverName: string;
  quantity: number;
  coGivers: string[];
  message: string;
};

// Un regalo sigue aceptando respuestas si es sin límite / dinero, o si todavía falta cantidad.
export const isOpen = (g: Pick<Gift, "mode" | "remaining">) => g.mode !== "fixed" || g.remaining > 0;

export const formatMoney = (n: number) => `$ ${n.toLocaleString("es-UY")}`;
