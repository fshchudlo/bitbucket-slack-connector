import { UserPayload } from "../../../bitbucket-payload-types";

export function formatUserName(user: UserPayload) {
    return user.displayName ? user.displayName : user.emailAddress;
}