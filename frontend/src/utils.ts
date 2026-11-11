export function fullName(e: {
  prefix?: { prefixName: string } | null;
  firstName: string;
  lastName: string;
}) {
  return `${e.prefix?.prefixName ?? ""} ${e.firstName} ${e.lastName}`.trim();
}

export type SortOrder = "asc" | "desc";

/** Convert an antd Table sorter into API sort params (undefined = default order). */
export function toSort<K extends string>(sorter: unknown): {
  sortBy?: K;
  sortOrder?: SortOrder;
} {
  const s = (Array.isArray(sorter) ? sorter[0] : sorter) as
    | { columnKey?: K; order?: "ascend" | "descend" | null }
    | undefined;
  // explicit undefineds so spreading this over the old query clears the sort
  if (!s?.order || !s.columnKey) {
    return { sortBy: undefined, sortOrder: undefined };
  }
  return {
    sortBy: s.columnKey,
    sortOrder: s.order === "ascend" ? "asc" : "desc",
  };
}

/** The antd sortOrder for a column, given the current API sort params. */
export function columnSortOrder(
  key: string,
  q: { sortBy?: string; sortOrder?: SortOrder },
): "ascend" | "descend" | null {
  if (q.sortBy !== key) return null;
  return q.sortOrder === "desc" ? "descend" : "ascend";
}
