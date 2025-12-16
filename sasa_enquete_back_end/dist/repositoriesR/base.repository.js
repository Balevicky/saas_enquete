import { PrismaClient } from "@prisma/client";
export class BaseRepository {
    prisma;
    constructor() {
        this.prisma = new PrismaClient();
    }
}
