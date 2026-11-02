export type Gift = {
  id: number;
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
