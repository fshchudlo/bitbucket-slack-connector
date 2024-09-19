import { UserPayload } from "../../../types/normalized-payload-types";

export function formatUserName(user: UserPayload) {
    return user.name ? user.name : user.email;
}