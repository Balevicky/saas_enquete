import prisma from "../prisma";
// import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { buildPagination, buildSearchFilter } from "../utils/pagination";
import { generateId } from "../utils/generateId";
class InviteController {
    static async create(req, res) {
        const tenantId = req.tenantId;
        const { email, role } = req.body;
        // generateId;
        // const token = nanoid(32);
        const token = await generateId(32);
        const invite = await prisma.invite.create({
            data: { email, role: role || "USER", tenantId, token },
        });
        // TODO: send invitation email containing the token (using nodemailer + template)
        return res.status(201).json({ invite });
    }
    static async accept(req, res) {
        const { token, fullName, password } = req.body;
        const invite = await prisma.invite.findUnique({
            where: { token },
            include: { user: true },
        }); // 🔥 important
        if (!invite)
            return res.status(404).json({ error: "Invalid invite token" });
        if (invite.accepted)
            return res.status(400).json({ error: "Invite already accepted" });
        const hashed = password ? await bcrypt.hash(password, 10) : undefined;
        let user;
        if (!invite.user) {
            user = await prisma.user.create({
                data: { email: invite.email, fullName, password: hashed || "" },
            });
            await prisma.userTenant.create({
                data: { userId: user.id, tenantId: invite.tenantId, role: invite.role },
            });
        }
        await prisma.invite.update({
            where: { id: invite.id },
            data: { accepted: true },
        });
        return res.json({ ok: true, user });
    }
    // static async list(req: Request, res: Response) {
    //   const tenantId = (req as any).tenantId;
    //   const invites = await prisma.invite.findMany({ where: { tenantId } });
    //   return res.json(invites);
    // }
    static async list(req, res) {
        const tenantId = req.tenantId;
        if (!tenantId)
            return res.status(400).json({ error: "Tenant missing" });
        // Pagination
        const { skip, take } = buildPagination(req.query);
        // Filtre par email
        const emailFilter = buildSearchFilter(req.query.search);
        const invites = await prisma.invite.findMany({
            where: {
                tenantId,
                ...(Object.keys(emailFilter).length ? { email: emailFilter } : {}),
            },
            include: { user: true },
            skip,
            take,
            orderBy: { createdAt: "desc" },
        });
        const total = await prisma.invite.count({
            where: {
                tenantId,
                ...(Object.keys(emailFilter).length ? { email: emailFilter } : {}),
            },
        });
        return res.json({
            data: invites,
            meta: {
                total,
                page: Number(req.query.page) || 1,
                perPage: Number(req.query.perPage) || take,
            },
        });
    }
    static async revoke(req, res) {
        const { id } = req.params;
        await prisma.invite.delete({ where: { id } });
        return res.status(204).send();
    }
}
export default InviteController;
