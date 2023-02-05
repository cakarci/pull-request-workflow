export enum GithubEventNames {
  'PULL_REQUEST' = 'pull_request',
  'PULL_REQUEST_REVIEW' = 'pull_request_review',
  'PULL_REQUEST_REVIEW_COMMENT' = 'pull_request_review_comment',
  'ISSUE_COMMENT' = 'issue_comment'
}

export enum ReviewStates {
  'CHANGES_REQUESTED' = 'CHANGES_REQUESTED',
  'APPROVED' = 'APPROVED',
  'COMMENTED' = 'COMMENTED'
}

export const allowedEventNames = [
  GithubEventNames.PULL_REQUEST,
  GithubEventNames.PULL_REQUEST_REVIEW,
  GithubEventNames.PULL_REQUEST_REVIEW_COMMENT,
  GithubEventNames.ISSUE_COMMENT
]
