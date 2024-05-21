import { SendMessageArguments, SendMessageResponse } from "./SendMessageArguments";

export interface SlackBroadcastChannel {
    addReaction(messageId: string, reaction: string): Promise<void>;

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;

    findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null>;
}

export type PullRequestSnapshotInSlackMetadata = {
    pullRequestId: string,
    projectKey: string,
    repositorySlug: string
}
