import { getTaskOrCommentTitle } from "../getTaskOrCommentTitle";
import { PullRequestCommentActionNotification } from "../../../contracts";

describe("getTaskOrCommentTitle", () => {
    it("should return \"task\" for BLOCKER severity", () => {
        const payload = {
            comment: {
                severity: "BLOCKER"
            }
        } as PullRequestCommentActionNotification;
        expect(getTaskOrCommentTitle(payload)).toBe("task");
    });

    it("should return \"comment\" for NORMAL severity", () => {
        const payload = {
            comment: {
                severity: "NORMAL"
            }
        } as PullRequestCommentActionNotification;
        expect(getTaskOrCommentTitle(payload)).toBe("comment");
    });

    it("should throw an error for unknown severity", () => {
        const payload = {
            comment: {
                severity: "UNKNOWN"
            }
        } as unknown as PullRequestCommentActionNotification;
        expect(() => getTaskOrCommentTitle(payload)).toThrowError("\"UNKNOWN\" comment severity is unknown.");
    });
});