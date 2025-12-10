import { Prisma } from "@prisma/client";
export function buildPagination(query: any) {
  const page = Math.max(1, parseInt(query.page || "1"));
  const perPage = Math.max(1, Math.min(100, parseInt(query.perPage || "20")));
  const skip = (page - 1) * perPage;
  return { skip, take: perPage };
}
// export function buildSearchFilter(search?: string) {
//   if (!search) return {};
//   return {
//     contains: search,
//     mode: "insensitive",
//   };
// }
export function buildSearchFilter(search?: string): Prisma.StringFilter | {} {
  if (!search) return {};
  return {
    contains: search,
    mode: "insensitive", // Prisma attend QueryMode
  };
}
