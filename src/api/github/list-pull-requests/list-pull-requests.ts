import {GitHub} from '@actions/github/lib/utils'
import {OctokitListPullRequestsResponseType} from '../index'

export type listPullRequestsParameters = {
  owner: string
  repo: string
  state?: 'open' | 'closed' | 'all' | undefined
}
export const listPullRequests = (octokit: InstanceType<typeof GitHub>) => {
  return async ({owner, repo, ...rest}: listPullRequestsParameters) => {
    try {
      const {data}: OctokitListPullRequestsResponseType =
        await octokit.rest.pulls.list({
          owner,
          repo,
          ...rest
        })
      return data
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
