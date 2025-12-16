export const generateId = async (size = 32) => {
    const { nanoid } = await import("nanoid");
    return nanoid(size);
};
