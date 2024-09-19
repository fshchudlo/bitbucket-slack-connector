// https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request
export type PullRequestNotification = {
    action: string;
    number: number;
    pull_request: PullRequestPayload;
    repository: RepositoryPayload;
    sender: UserPayload;
}
export type PullRequestPayload = {
    url: string;
    id: number;
    html_url: string;
    diff_url: string;
    patch_url: string;
    issue_url: string;
    number: number;
    state: string;
    title: string;
    user: UserPayload;
    body: string;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
    merge_commit_sha: string | null;
    assignee: string | null;
    assignees: any[];
    requested_reviewers: any[];
    requested_teams: any[];
    labels: any[];
    milestone: string | null;
    draft: boolean;
    commits_url: string;
    review_comments_url: string;
    review_comment_url: string;
    comments_url: string;
    statuses_url: string;
    head: RefPayload;
    base: RefPayload;
    _links: {
        self: { href: string };
        html: { href: string };
        issue: { href: string };
        comments: { href: string };
        review_comments: { href: string };
        review_comment: { href: string };
        commits: { href: string };
        statuses: { href: string };
    };
    author_association: string;
    auto_merge: string | null;
    active_lock_reason: string | null;
}
export type RepositoryPayload = {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: UserPayload;
    html_url: string;
    description: string;
    fork: boolean;
    url: string;
    forks_url: string;
    keys_url: string;
    collaborators_url: string;
    teams_url: string;
    hooks_url: string;
    issue_events_url: string;
    events_url: string;
    assignees_url: string;
    branches_url: string;
    tags_url: string;
    blobs_url: string;
    git_tags_url: string;
    git_refs_url: string;
    trees_url: string;
    statuses_url: string;
    languages_url: string;
    stargazers_url: string;
    contributors_url: string;
    subscribers_url: string;
    subscription_url: string;
    commits_url: string;
    git_commits_url: string;
    comments_url: string;
    issue_comment_url: string;
    contents_url: string;
    compare_url: string;
    merges_url: string;
    archive_url: string;
    downloads_url: string;
    issues_url: string;
    pulls_url: string;
    milestones_url: string;
    notifications_url: string;
    labels_url: string;
    releases_url: string;
    deployments_url: string;
}
export type UserPayload = {
    login: string;
    id: number;
    email: string;
    type: string;
    site_admin: boolean;
}
export type RefPayload = {
    label: string;
    ref: string;
    sha: string;
    user: UserPayload;
    repo: RepositoryPayload;
}