export function fullName(e: {
  prefix?: { prefixName: string } | null;
  firstName: string;
  lastName: string;
}) {
  return `${e.prefix?.prefixName ?? ""} ${e.firstName} ${e.lastName}`.trim();
}
