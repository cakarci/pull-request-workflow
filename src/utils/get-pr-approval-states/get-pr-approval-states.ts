import {githubService} from '../../api/github'
import * as core from '@actions/core'
import {requestTwoReviewers} from '../request-two-reviewers'
import {components} from '@octokit/openapi-types'

type State = 'APPROVED' | 'COMMENTED' | 'CHANGES_REQUESTED'
type UserWithState = {user: string; state: State}
export const getPrApprovalStates = async (
  {
    prAuthor,
    githubUserNames,
    requestedReviewers
  }: {
    prAuthor: string
    githubUserNames: string[]
    requestedReviewers: string[]
    commit_id: string
  },
  {owner, repo, pull_number}: {owner: string; repo: string; pull_number: number}
): Promise<{
  approvers: string[]
  secondApprovers: string[]
  changeRequesters: string[]
}> => {
  const reviews = await githubService.getReviews({
    owner,
    repo,
    pull_number
  })

  core.info(
    JSON.stringify({
      AllReviews: reviews
    })
  )

  core.info(
    JSON.stringify({
      requestedReviewers
    })
  )

  const reviewersWithState = getReviewers(reviews)
  const latestReviewOfUsers = getLatestReviewOfUsers(reviewersWithState)

  core.info(
    JSON.stringify({
      latestReviewOfUsers
    })
  )
  const approvers = Object.values(latestReviewOfUsers).filter(
    s => s === 'APPROVED'
  )

  const changeRequesters = Object.values(latestReviewOfUsers).filter(
    s => s === 'CHANGES_REQUESTED'
  )

  if (requestedReviewers.length === 0 && approvers.length < 2) {
    requestedReviewers = await requestTwoReviewers(
      [prAuthor, ...Object.keys(latestReviewOfUsers)],
      githubUserNames,
      {
        owner,
        repo,
        pull_number
      }
    )
  }

  return {
    secondApprovers: [
      ...new Set([...requestedReviewers, ...Object.keys(latestReviewOfUsers)])
    ],
    approvers,
    changeRequesters
  }
}

const getReviewers = (
  reviews: components['schemas']['pull-request-review'][]
): UserWithState[] => {
  return reviews.map(r => ({
    user: r?.user?.login as string,
    state: r.state as State
  }))
}

const getLatestReviewOfUsers = (
  reviews: UserWithState[]
): Record<string, State> => {
  return reviews.reduce((acc, curr) => {
    const latestReviewOfUser = reviews
      .filter(r => r.state !== 'COMMENTED')
      .filter(r => r.user === curr.user)
      .pop()
    return {
      ...acc,
      [curr.user]: latestReviewOfUser?.state
    }
  }, {})
}
