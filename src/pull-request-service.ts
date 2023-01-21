import * as core from '@actions/core'
import * as github from '@actions/github'
import {githubService} from './api/github'

export const PullRequestService = async (): Promise<void> => {
  try {
    if (!github.context.eventName.startsWith('pull_request')) {
      core.warning(
        `eventName should be "pull_request*" but received: ${github.context.eventName} `
      )
      return
    }
    core.setOutput('context', github.context.payload.action)
    if (github.context.payload.action === 'labeled') {
      await githubService.createComment({
        owner: 'cakarci',
        repo: github.context.issue.repo,
        issue_number: github.context.issue.number,
        body: `you added label: ${github.context.payload.label?.name}`
      })
    }
    if (
      github.context.payload.action === 'opened' &&
      github.context.payload.pull_request
    ) {
      await githubService.requestReviewers({
        owner: github.context.actor,
        repo: github.context.issue.repo,
        pull_number: github.context.payload.pull_request.number,
        reviewers: ['scakarci', 'pcakarci']
      })
    }
    if (
      github.context.eventName === 'pull_request_review' &&
      github.context.payload.action === 'submitted'
    ) {
      await githubService.createComment({
        owner: 'cakarci',
        repo: github.context.issue.repo,
        issue_number: github.context.issue.number,
        body: `pull request reviewed (${github.context.payload.review.state}) by : ${github.context.payload.sender}`
      })
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
