import { getCommentType } from "../getCommentType";
import { PullRequestCommentActionNotification } from "../../../typings";

describe("getCommentType function", () => {
    it("should return \"task\" for BLOCKER severity", () => {
        const payload = {
            comment: {
                severity: "BLOCKER"
            }
        } as PullRequestCommentActionNotification;
        expect(getCommentType(payload)).toBe("task");
    });

    it("should return \"comment\" for NORMAL severity", () => {
        const payload = {
            comment: {
                severity: "NORMAL"
            }
        } as PullRequestCommentActionNotification;
        expect(getCommentType(payload)).toBe("comment");
    });

    it("should throw an error for unknown severity", () => {
        const payload = {
            comment: {
                severity: "UNKNOWN"
            }
        } as unknown as PullRequestCommentActionNotification;
        expect(() => getCommentType(payload)).toThrowError("\"UNKNOWN\" comment severity is unknown.");
    });
});