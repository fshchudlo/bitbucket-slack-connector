import * as slack from "@slack/web-api";

export class TestSlackGateway implements SlackGateway {
    snapshot: {
        createdChannels: slack.ConversationsCreateArguments[];
        setChannelTopics: slack.ConversationsSetTopicArguments[];
        invitesToChannels: slack.ConversationsInviteArguments[];
        closedChannels: slack.ConversationsCloseArguments[];
        lookedUpUsers: slack.UsersLookupByEmailArguments[];
    };
    constructor() {
        this.snapshot = {
            createdChannels: new Array<slack.ConversationsCreateArguments>(),
            setChannelTopics: new Array<slack.ConversationsSetTopicArguments>(),
            invitesToChannels: new Array<slack.ConversationsInviteArguments>(),
            closedChannels: new Array<slack.ConversationsCloseArguments>(),
            lookedUpUsers: new Array<slack.UsersLookupByEmailArguments>(),
        };
    }
    lookupUserByEmail(options: slack.UsersLookupByEmailArguments): Promise<slack.UsersLookupByEmailResponse> {
        this.snapshot.lookedUpUsers.push(options);
        return Promise.resolve({ ok: true, user: { id: options.email } });
    }
    createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse> {
        this.snapshot.createdChannels.push(options);
        return Promise.resolve({ ok: true, channel: { id: '12345', name: options.name } });
    }
    setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse> {
        this.snapshot.setChannelTopics.push(options);
        return Promise.resolve({ ok: true });
    }
    inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse> {
        this.snapshot.invitesToChannels.push(options);
        return Promise.resolve({ ok: true });
    }
    closeChannel(options: slack.ConversationsCloseArguments): Promise<slack.ConversationsCloseResponse> {
        this.snapshot.closedChannels.push(options);
        return Promise.resolve({ ok: true });
    }
}
