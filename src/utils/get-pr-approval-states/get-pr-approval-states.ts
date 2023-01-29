import {githubService} from '../../api/github'
import * as core from '@actions/core'
import {requestTwoReviewers} from '../request-two-reviewers'
import {components} from '@octokit/openapi-types'

type State = 'APPROVED' | 'COMMENTED' | 'CHANGES_REQUESTED'
type StateUsersMap = Record<State, never[]>
export const getPrApprovalStates = async (
  {
    prAuthor,
    githubUserNames,
    requestedReviewers,
    commit_id
  }: {
    prAuthor: string
    githubUserNames: string[]
    requestedReviewers: string[]
    commit_id: string
  },
  {owner, repo, pull_number}: {owner: string; repo: string; pull_number: number}
): Promise<StateUsersMap & {SECOND_APPROVERS: string[]}> => {
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

  const reviewsOnLatestCommit = getReviewsByCommitId(commit_id, reviews)
  const reviewersOnLatestCommit = getReviewers(reviewsOnLatestCommit)

  const {APPROVED, COMMENTED, CHANGES_REQUESTED} =
    reviewersOnLatestCommit.reduce(
      (acc, curr): StateUsersMap => {
        return {
          ...acc,
          [curr.state]: [...acc[curr.state], curr.user]
        }
      },
      {
        APPROVED: [],
        COMMENTED: [],
        CHANGES_REQUESTED: []
      }
    )

  core.info(
    JSON.stringify({
      reviewersOnLatestCommit
    })
  )

  if (requestedReviewers.length === 0 && APPROVED.length < 2) {
    requestedReviewers = await requestTwoReviewers(
      [prAuthor, ...APPROVED, ...COMMENTED, ...CHANGES_REQUESTED],
      githubUserNames,
      {
        owner,
        repo,
        pull_number
      }
    )
  }

  return {
    SECOND_APPROVERS: [
      ...new Set([...requestedReviewers, ...COMMENTED, ...CHANGES_REQUESTED])
    ],
    APPROVED,
    COMMENTED,
    CHANGES_REQUESTED
  }
}

const getReviewsByCommitId = (
  commit_id: string,
  reviews: components['schemas']['pull-request-review'][]
): components['schemas']['pull-request-review'][] => {
  return reviews.filter((r: {commit_id: string}) => r.commit_id === commit_id)
}

const getReviewers = (
  reviews: components['schemas']['pull-request-review'][]
): {user: string; state: State}[] => {
  const reviewers = reviews.map(r => ({
    user: r?.user?.login as string,
    state: r.state as State
  }))
  core.info(
    JSON.stringify({
      reviewersNotUnique: reviewers
    })
  )
  return uniqueBy<{state: State; user: string}>(['user', 'state'], reviewers)
}

const uniqueBy = <T>(properties: string[], arr: T[]): T[] =>
  arr.filter(
    (v: T, i: number, a: T[]) =>
      a.findIndex(v2 =>
        properties.every(
          k =>
            (v2 as Record<string, string>)[k] ===
            (v as Record<string, string>)[k]
        )
      ) === i
  )
