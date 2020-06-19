import {prisma} from "./prisma";

export class UserRepo
{
    systemUserId?: number;
    anonymousUserId?: number;

    public async ensureUserExists(name: string)
    {
        let user = await prisma.user.findOne({
            where: {
                email: name
            }
        });
        if (!user) {
            user = await prisma.user.create({
                data:{
                    type: "System",
                    createdAt: new Date(),
                    email: name,
                    createdByRequestId: "-",
                    timezoneOffset: -120
                }
            })
        }

        // TODO: Remove magic strings
        if (user.email == "system@abis.local") {
            this.systemUserId = user.id;
        }
        if (user.email == "anon@abis.local") {
            this.anonymousUserId = user.id;
        }

        return user;
    }
}