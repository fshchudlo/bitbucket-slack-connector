import { UserPayload } from "../../typings";

export function formatUserName(user: UserPayload) {
    return user.displayName ? user.displayName : user.emailAddress;
}