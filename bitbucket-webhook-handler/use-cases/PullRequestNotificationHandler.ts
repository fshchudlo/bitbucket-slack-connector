import { BitbucketNotification } from "../../bitbucket-payload-types";
import { SlackChannel } from "../SlackChannel";

export interface PullRequestNotificationHandler {
    canHandle(payload: BitbucketNotification): boolean;

    handle(payload: BitbucketNotification, pullRequestChannel: SlackChannel): Promise<void>;
}