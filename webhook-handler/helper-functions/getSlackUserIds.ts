import { UserPayload } from "../contracts";
import { SlackGateway } from "../gateways/SlackGateway";

export default async function getSlackUserIds(userPayloads: Array<UserPayload>, slackGateway: SlackGateway) {
    const slackUserRequests = userPayloads
        .map(r => r.emailAddress)
        .map(async email =>
            await slackGateway.lookupUserByEmail({
                email: email
            })
        );
    return [...new Set((await Promise.all(slackUserRequests)).map(r => r.user.id))];
}