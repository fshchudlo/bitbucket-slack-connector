import { slackBold } from "./slackBold";

export function formatUserName(user: UserPayload) {
    return slackBold(user.displayName ? user.displayName : user.emailAddress);
}