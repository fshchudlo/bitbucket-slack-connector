import { UserPayload } from "../../contracts";

export function formatUserName(user: UserPayload) {
    return user.name;
}