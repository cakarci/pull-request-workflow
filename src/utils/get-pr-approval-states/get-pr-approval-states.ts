import {githubService} from '../../api/github'
import * as core from '@actions/core'
import {requestTwoReviewers} from '../request-two-reviewers'

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
): Promise<{
  approvers: string[]
  secondApprovers: string[]
  changesRequesters: string[]
  commenters: string[]
}> => {
  const reviewers = await githubService.getReviewers({
    owner,
    repo,
    pull_number
  })

  type State = 'APPROVED' | 'COMMENTED' | 'CHANGES_REQUESTED'
  const revs = reviewers
    .filter(r => r.commit_id === commit_id)
    .map(r => r?.user?.login as string)
  const isLastReviewFromUser = (user: string, state: State): boolean => {
    return (
      [...reviewers]
        .filter(r => (r?.user?.login as string) === user)
        .filter(r => r.commit_id === commit_id)
        .pop()?.state === state
    )
  }
  const approvers: string[] = []
  const commenters: string[] = []
  const changesRequesters: string[] = []
  for (const rev of revs) {
    if (isLastReviewFromUser(rev, 'APPROVED')) {
      !approvers.includes(rev) && approvers.push(rev)
    }
    if (isLastReviewFromUser(rev, 'COMMENTED')) {
      !commenters.includes(rev) && commenters.push(rev)
    }
    if (isLastReviewFromUser(rev, 'CHANGES_REQUESTED')) {
      !changesRequesters.includes(rev) && changesRequesters.push(rev)
    }
  }

  core.info(
    JSON.stringify({
      reviewers
    })
  )

  if (requestedReviewers.length === 0 && approvers.length < 2) {
    requestedReviewers = await requestTwoReviewers(
      [prAuthor, ...approvers, ...commenters, ...changesRequesters],
      githubUserNames,
      {
        owner,
        repo,
        pull_number
      }
    )
  }

  return {
    approvers,
    secondApprovers: [
      ...new Set([...requestedReviewers, ...commenters, ...changesRequesters])
    ],
    changesRequesters,
    commenters
  }
}
