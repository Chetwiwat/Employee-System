import { api } from "./client";
import type { Gender, Position, Prefix } from "../types";

export const masterApi = {
  genders: () => api.get<Gender[]>("/master/genders").then((r) => r.data),
  positions: () => api.get<Position[]>("/master/positions").then((r) => r.data),
  prefixes: () => api.get<Prefix[]>("/master/prefixes").then((r) => r.data),
};
