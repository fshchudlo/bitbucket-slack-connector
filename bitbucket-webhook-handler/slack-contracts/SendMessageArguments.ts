import { Block, KnownBlock } from "@slack/bolt";

export type SendMessageArguments = {
    text?: string;
    threadId?: string;
    replyBroadcast?: boolean,
    metadata?: {
        eventType: string;
        eventPayload: { [p: string]: string | number | boolean }
    };
    blocks?: Block[] | KnownBlock[]
}
export type SendMessageResponse = {
    messageId: string;
    threadId?: string;
}