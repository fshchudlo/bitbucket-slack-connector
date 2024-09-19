import { UserPayload } from "../../../types/bitbucket-payload-types";

export function formatUserName(user: UserPayload) {
    return user.displayName ? user.displayName : user.emailAddress;
}