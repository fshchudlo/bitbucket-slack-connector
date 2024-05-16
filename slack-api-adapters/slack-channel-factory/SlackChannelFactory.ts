import { SlackChannel } from "../../bitbucket-webhook-handler/SlackChannel";

export interface SlackChannelFactory {
    fromExistingChannel(channelName: string, includePrivateChannels: boolean): Promise<SlackChannel | null>;

    setupNewChannel(options: CreateChannelArguments): Promise<SlackChannel>;
}

export type SlackChannelInfo = {
    id: string;
    name: string;
    isArchived: boolean;
}
export type CreateChannelArguments = {
    name: string;
    isPrivate?: boolean;
}