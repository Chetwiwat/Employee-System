import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.NEST_API_URL ?? "http://localhost:3000",
});

export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const m = e.response?.data?.message;
    if (Array.isArray(m)) return m.join(", ");
    if (typeof m === "string") return m;
  }
  return "Something went wrong";
}
