import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

interface GraphQLError {
  message: string;
}

/** Thrown when the GraphQL response contains `errors`. */
export class GraphQLRequestError extends Error {}

/**
 * Send a GraphQL operation. Every query and mutation goes to the same
 * endpoint as `{ query, variables }`; the response is `{ data, errors }`.
 */
export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await api.post<{ data?: T; errors?: GraphQLError[] }>(
    "/graphql",
    { query, variables },
  );
  // GraphQL reports most errors in the body, usually with HTTP status 200
  if (res.data.errors?.length) {
    throw new GraphQLRequestError(res.data.errors[0].message);
  }
  return res.data.data as T;
}

export function errorMessage(e: unknown): string {
  if (e instanceof GraphQLRequestError) return e.message;
  if (axios.isAxiosError(e)) {
    // e.g. a query the schema rejects comes back as HTTP 400 with `errors`
    const errors = e.response?.data?.errors as GraphQLError[] | undefined;
    if (errors?.length) return errors[0].message;
  }
  return "Something went wrong";
}
