import {githubService, OctokitListReviewsResponseType} from '../../api/github'
import {ReviewStates} from '../../constants'

type UserWithState = {user: string; state: ReviewStates}

interface ReviewStateUsersMap {
  [ReviewStates.APPROVED]: string[]
  [ReviewStates.CHANGES_REQUESTED]: string[]
  [ReviewStates.COMMENTED]: string[]
}

export const getPullRequestReviewStateUsers = async (
  {
    prAuthor,
    requestedReviewers
  }: {
    prAuthor: string
    requestedReviewers: string[]
  },
  {owner, repo, pull_number}: {owner: string; repo: string; pull_number: number}
): Promise<ReviewStateUsersMap & {SECOND_APPROVERS: string[]}> => {
  const reviews = await githubService.getReviews({
    owner,
    repo,
    pull_number
  })

  const reviewersWithState = getReviewers(reviews)
  const {APPROVED, CHANGES_REQUESTED, COMMENTED} = getReviewStateUsersMap(
    reviewersWithState,
    prAuthor
  )

  return {
    SECOND_APPROVERS: [
      ...new Set([...requestedReviewers, ...COMMENTED, ...CHANGES_REQUESTED])
    ],
    APPROVED,
    CHANGES_REQUESTED,
    COMMENTED
  }
}

const getReviewers = (
  reviews: OctokitListReviewsResponseType['data']
): UserWithState[] => {
  return reviews.map(r => ({
    user: r?.user?.login as string,
    state: r.state as ReviewStates
  }))
}

const getReviewStateUsersMap = (
  reviews: UserWithState[],
  prAuthor: string
): ReviewStateUsersMap => {
  const getLatestReviewOfUser = (user: string): UserWithState | undefined =>
    reviews
      .filter(r => r.state !== ReviewStates.COMMENTED)
      .filter(r => r.user === user)
      .pop()

  const isUserOnlyCommented = (user: string): boolean =>
    reviews
      .filter(r => r.user === user)
      .every(r => r.state === ReviewStates.COMMENTED)

  const reducer = (
    acc: ReviewStateUsersMap,
    review: UserWithState
  ): ReviewStateUsersMap => {
    if (isUserOnlyCommented(review.user)) {
      !acc[ReviewStates.COMMENTED].includes(review.user) &&
        review.user !== prAuthor &&
        acc[ReviewStates.COMMENTED].push(review.user)
    }
    const latestReview = getLatestReviewOfUser(review.user)
    if (latestReview?.state) {
      !acc[latestReview.state].includes(review.user) &&
        acc[latestReview.state].push(review.user)
    }
    return acc
  }

  return reviews.reduce(reducer, {
    [ReviewStates.APPROVED]: [],
    [ReviewStates.CHANGES_REQUESTED]: [],
    [ReviewStates.COMMENTED]: []
  })
}
