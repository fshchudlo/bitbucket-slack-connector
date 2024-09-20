import { SlackChannelCachedDecorator } from "../SlackChannelCachedDecorator";
import { snapshotCommentState } from "../../../bitbucket-webhook-handler/use-case-handlers/utils";
import { register } from "prom-client";
import { CHANNELS_CACHE } from "../../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../../COMMENTS_CACHE";
import { PullrequestCommentSnapshotInSlackMetadata, SendMessageResponse, SlackTargetedChannel } from "../../../bitbucket-webhook-handler/slack-api-ports";


const decoratedChannelMock = {
    channelInfo: {
        id: "channelId",
        name: "channelName"
    },
    addBookmark: jest.fn(),
    addReaction: jest.fn(),
    closeChannel: jest.fn(),
    findLatestPullRequestCommentSnapshot: jest.fn(),
    findPROpenedBroadcastMessageId: jest.fn(),
    getSlackUserIds: jest.fn(),
    inviteToChannel: jest.fn(),
    kickFromChannel: jest.fn(),
    sendMessage: jest.fn()
} as SlackTargetedChannel;


describe("SlackChannelCachedDecorator", () => {
    let systemUnderTest: SlackChannelCachedDecorator;

    beforeEach(() => {
        systemUnderTest = new SlackChannelCachedDecorator(decoratedChannelMock as any);
        CHANNELS_CACHE.deleteWhere(() => true);
        COMMENTS_CACHE.deleteWhere(() => true);
    });

    afterEach(() => {
        jest.clearAllMocks();
        register.clear();
    });

    it("should delete channel info from cache when closing a channel", async () => {
        (<jest.Mock>decoratedChannelMock.closeChannel).mockResolvedValue({});

        CHANNELS_CACHE.set(decoratedChannelMock.channelInfo.name, decoratedChannelMock.channelInfo);
        expect(CHANNELS_CACHE.get(decoratedChannelMock.channelInfo.name)).not.toBeUndefined();

        await systemUnderTest.closeChannel();
        expect(CHANNELS_CACHE.get(decoratedChannelMock.channelInfo.name)).toBeUndefined();
    });

    it("should cache comment info when sending a message", async () => {
        (<jest.Mock>decoratedChannelMock.sendMessage).mockResolvedValue(<SendMessageResponse>{
            messageId: "ABCDE"
        });

        const testPayload = {
            comment: {
                id: 1,
                severity: "NORMAL",
                resolvedAt: undefined as number,
                threadResolvedAt: new Date(1714381184802)
            },
            commentParentId: undefined as string
        };

        await systemUnderTest.sendMessage({
            metadata: snapshotCommentState(testPayload as any)
        });


        expect(await systemUnderTest.findLatestPullRequestCommentSnapshot(testPayload.comment.id)).toMatchSnapshot();
        expect(decoratedChannelMock.findLatestPullRequestCommentSnapshot).not.toHaveBeenCalled();
    });

    it("should fetch comment snapshot from gateway and save in cache", async () => {
        const commentSnapshot = <PullrequestCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        (<jest.Mock>decoratedChannelMock.findLatestPullRequestCommentSnapshot).mockResolvedValueOnce(commentSnapshot);

        const result = await systemUnderTest.findLatestPullRequestCommentSnapshot(commentSnapshot.commentId);

        expect(decoratedChannelMock.findLatestPullRequestCommentSnapshot).toHaveBeenCalledWith(commentSnapshot.commentId);
        expect(result).toEqual(commentSnapshot);
        expect(COMMENTS_CACHE.get("channelId-1")).toEqual(commentSnapshot);
    });

    it("should delete comment snapshots from cache when archiving a channel", async () => {
        const commentSnapshot = <PullrequestCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        (<jest.Mock>decoratedChannelMock.findLatestPullRequestCommentSnapshot).mockResolvedValueOnce(commentSnapshot);

        await systemUnderTest.findLatestPullRequestCommentSnapshot(commentSnapshot.commentId);

        expect(COMMENTS_CACHE.get("channelId-1")).toEqual(commentSnapshot);

        (<jest.Mock>decoratedChannelMock.closeChannel).mockResolvedValue({});

        await systemUnderTest.closeChannel();

        expect(COMMENTS_CACHE.get("channelId-1")).toBeUndefined();

    });
});