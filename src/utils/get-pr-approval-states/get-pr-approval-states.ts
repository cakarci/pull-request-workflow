import {githubService} from '../../api/github'
import * as core from '@actions/core'

export const getPrApprovalStates = async (
  {
    requestedReviewers,
    commit_id
  }: {
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

  return {
    approvers,
    secondApprovers: requestedReviewers
  }
}
