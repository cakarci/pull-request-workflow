import {githubService} from '../../api/github'
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
  },
  {owner, repo, pull_number}: {owner: string; repo: string; pull_number: number}
): Promise<{
  secondApprovers: string[]
  approvers: string[]
  changeRequesters: string[]
}> => {
  const reviews = await githubService.getReviews({
    owner,
    repo,
    pull_number
  })

  const reviewersWithState = getReviewers(reviews)
  const {approvers, changeRequesters} =
    getLatestReviewOfUsers(reviewersWithState)

  if (requestedReviewers.length === 0 && approvers.length < 2) {
    requestedReviewers = await requestTwoReviewers(
      [prAuthor, ...approvers, ...changeRequesters],
      githubUserNames,
      {
        owner,
        repo,
        pull_number
      }
    )
  }

  return {
    secondApprovers: [...new Set([...requestedReviewers, ...changeRequesters])],
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
): {
  approvers: string[]
  changeRequesters: string[]
} => {
  const getLatestReviewOfUser = (user: string): UserWithState | undefined =>
    reviews
      .filter(r => r.state !== 'COMMENTED')
      .filter(r => r.user === user)
      .pop()
  const approvers: string[] = []
  const changeRequesters: string[] = []
  for (const review of reviews) {
    const latestReview = getLatestReviewOfUser(review.user)
    if (latestReview?.state === 'APPROVED') {
      !approvers.includes(latestReview.user) &&
        approvers.push(latestReview.user)
    }
    if (latestReview?.state === 'CHANGES_REQUESTED') {
      !changeRequesters.includes(latestReview.user) &&
        changeRequesters.push(latestReview.user)
    }
  }
  return {
    approvers,
    changeRequesters
  }
}
