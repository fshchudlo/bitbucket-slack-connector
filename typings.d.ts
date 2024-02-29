import * as slack from "@slack/web-api";
declare global {
    // see https://confluence.atlassian.com/bitbucketserver0816/event-payload-1333334207.html#Eventpayload-pullrequest

    interface UserPayload {
        name: string;
        emailAddress: string;
    }
    interface PullRequestPayload {
        id: number;
        title: string;
        author: { user: UserPayload };
        reviewers: Array<{ user: UserPayload }>;
        links: { self: Array<string> };
        toRef: {
            displayId: string;
            repository: {
                slug: string;
                project: { key: string; name: string };
            };
        };
    }
    interface PullRequestCreatedPayload {
        eventKey: string;
        date: string;
        pullRequest: PullRequestPayload;
    }

    interface PullRequestMergedDeclinedDeletedPayload {
        eventKey: string;
        date: string;
        actor: UserPayload;
        pullRequest: PullRequestPayload;
    }

    declare interface SlackGateway {
        lookupUserByEmail(options: slack.UsersLookupByEmailArguments): Promise<slack.UsersLookupByEmailResponse>;
        createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse>;
        setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse>;
        inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse>;
        closeChannel(options: slack.ConversationsCloseArguments): Promise<slack.ConversationsCloseResponse>;
        sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse>;
    }
}
