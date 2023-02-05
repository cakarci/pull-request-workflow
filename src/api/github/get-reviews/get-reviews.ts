import {GitHub} from '@actions/github/lib/utils'
import {OctokitListReviewsResponseType} from '../index'

type Parameters = {
  owner: string
  repo: string
  pull_number: number
}
export const getReviews = (octokit: InstanceType<typeof GitHub>) => {
  return async ({owner, repo, pull_number}: Parameters) => {
    try {
      const {data}: OctokitListReviewsResponseType =
        await octokit.rest.pulls.listReviews({
          owner,
          repo,
          pull_number
        })
      return data
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
