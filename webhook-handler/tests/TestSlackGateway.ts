import * as slack from "@slack/web-api";

import {
    SlackAPIAdapter,
    SlackChannelInfo,
    BitbucketCommentSnapshot
} from "../SlackAPIAdapter";
import { UserPayload } from "../../typings";

const channelId = "12345";
const messageId = "ABCDE";
export default class TestSlackGateway implements SlackAPIAdapter {
    snapshot: {
        searchedCommentSnapshots: any[];
        searchedChannels: any[];
        createdChannels: slack.ConversationsCreateArguments[];
        setChannelTopics: slack.ConversationsSetTopicArguments[];
        invitesToChannels: slack.ConversationsInviteArguments[];
        kicksFromChannels: slack.ConversationsKickArguments[];
        archivedChannels: slack.ConversationsCloseArguments[];
        sentMessages: slack.ChatPostMessageArguments[];
        lookedUpUsers: slack.UsersLookupByEmailArguments[];
    };

    constructor() {
        this.snapshot = {
            createdChannels: new Array<slack.ConversationsCreateArguments>(),
            setChannelTopics: new Array<slack.ConversationsSetTopicArguments>(),
            invitesToChannels: new Array<slack.ConversationsInviteArguments>(),
            kicksFromChannels: new Array<slack.ConversationsKickArguments>(),
            archivedChannels: new Array<slack.ConversationsCloseArguments>(),
            sentMessages: new Array<slack.ChatPostMessageArguments>(),
            lookedUpUsers: new Array<slack.UsersLookupByEmailArguments>(),
            searchedCommentSnapshots: new Array<any>(),
            searchedChannels: new Array<any>()
        };
    }

    getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        userPayloads.forEach(u => this.snapshot.lookedUpUsers.push({ email: u.emailAddress }));
        return Promise.resolve(userPayloads.map(u => u.emailAddress));
    }

    getChannelInfo(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        this.snapshot.searchedChannels.push({ channelName, excludeArchived });
        return Promise.resolve({ isArchived: false, name: channelName, id: channelId });
    }

    createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse> {
        this.snapshot.createdChannels.push(options);
        return Promise.resolve({ ok: true, channel: { id: channelId, name: options.name } });
    }

    setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse> {
        this.snapshot.setChannelTopics.push(options);
        return Promise.resolve({ ok: true });
    }

    inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse> {
        this.snapshot.invitesToChannels.push(options);
        return Promise.resolve({ ok: true });
    }

    kickFromChannel(options: slack.ConversationsKickArguments): Promise<slack.ConversationsKickResponse> {
        this.snapshot.kicksFromChannels.push(options);
        return Promise.resolve({ ok: true });
    }

    archiveChannel(channelId: string): Promise<slack.ConversationsArchiveResponse> {
        this.snapshot.archivedChannels.push({ channel: channelId });
        return Promise.resolve({ ok: true });
    }

    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse> {
        this.snapshot.sentMessages.push(options);
        return Promise.resolve({ ok: true, channel: channelId, message: { ts: messageId } });
    }

    findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        this.snapshot.searchedCommentSnapshots.push({ channelId, bitbucketCommentId });
        return Promise.resolve({
            commentId: bitbucketCommentId.toString(),
            severity: "NORMAL",
            slackMessageId: messageId
        });
    }
}
