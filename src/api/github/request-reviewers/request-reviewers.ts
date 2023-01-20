import {GitHub} from '@actions/github/lib/utils'

type Parameters = {
  owner: string
  repo: string
  pull_number: number
  reviewers: string[] | undefined
}
export const requestReviewers = (octokit: InstanceType<typeof GitHub>) => {
  return async ({owner, repo, pull_number, reviewers}: Parameters) =>
    await octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number,
      reviewers
    })
}
