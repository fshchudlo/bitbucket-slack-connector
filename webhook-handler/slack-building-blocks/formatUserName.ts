import { slackBold } from "./slackBold";
import { UserPayload } from "../../typings";

export function formatUserName(user: UserPayload) {
    return slackBold(user.displayName ? user.displayName : user.emailAddress);
}