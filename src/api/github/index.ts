import * as core from '@actions/core'
import * as github from '@actions/github'
import {createComment} from './create-comment'
import {requestReviewers} from './request-reviewers'
import {getReviews} from './get-reviews'
import {listPullRequests} from './list-pull-requests'

const token = core.getInput('github-token')
const octokit = github.getOctokit(token)

export type OctokitListReviewsResponseType = Awaited<
  ReturnType<typeof octokit.rest.pulls.listReviews>
>

export type OctokitListPullRequestsResponseType = Awaited<
  ReturnType<typeof octokit.rest.pulls.list>
>

export const githubService = {
  createComment: createComment(octokit),
  requestReviewers: requestReviewers(octokit),
  getReviews: getReviews(octokit),
  listPullRequests: listPullRequests(octokit)
}
