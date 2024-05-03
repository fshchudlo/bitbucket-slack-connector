export interface SlackChannelFactory {
    findExistingChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackChannelInfo | null>;
    createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo>;
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