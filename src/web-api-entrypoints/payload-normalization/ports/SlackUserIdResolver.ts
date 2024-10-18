export interface SlackUserIdResolver {
    getUserId(email: string): Promise<string | null>;
}