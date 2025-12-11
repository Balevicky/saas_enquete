export const generateId = async (size: number = 32) => {
  const { nanoid } = await import("nanoid");
  return nanoid(size);
};
