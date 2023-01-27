import {githubService} from '../../api/github'
import * as core from '@actions/core'
import {requestTwoReviewers} from '../request-two-reviewers'

export const getPrApprovalStates = async (
  {
    actor,
    githubUserNames,
    requestedReviewers,
    commit_id
  }: {
    actor: string
    githubUserNames: string[]
    requestedReviewers: string[]
    commit_id: string
  },
  {owner, repo, pull_number}: {owner: string; repo: string; pull_number: number}
): Promise<{
  approvers: string[]
  secondApprovers: string[]
}> => {
  const reviewers = await githubService.getReviewers({
    owner,
    repo,
    pull_number
  })

  core.info(
    JSON.stringify({
      reviewers
    })
  )
  const approvers = [
    ...new Set(
      reviewers
        .filter(r => r.commit_id === commit_id)
        .filter(r => r.state === 'APPROVED')
        .map(r => r?.user?.login as string)
    )
  ]

  if (requestedReviewers.length === 0 && approvers.length < 2) {
    requestedReviewers = await requestTwoReviewers(actor, githubUserNames, {
      owner,
      repo,
      pull_number
    })
  }

  return {
    approvers,
    secondApprovers: requestedReviewers
  }
}
