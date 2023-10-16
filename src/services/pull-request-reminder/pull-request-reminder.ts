import {listPullRequestsParameters} from '../../api/github/list-pull-requests'
import {
  githubService,
  OctokitListPullRequestsResponseType
} from '../../api/github'
import {
  generatePullRequestAuthorReminderMessage,
  generatePullRequestChangeRequesterReminderMessage,
  generatePullRequestReviewerReminderMessage,
  getPullRequestReviewStateUsers,
  getPullRequestThread
} from '../../utils'
import {Slack} from '../../api/slack'
import * as core from '@actions/core'

interface PullRequestReminderParameters {
  githubUserNames: string[]
  githubSlackUserMapper: Record<string, string>
  remindAfter: number | undefined
}

/**
 * Send reminders for pull requests.
 */
export const pullRequestReminder = async (
  {
    githubUserNames,
    githubSlackUserMapper,
    remindAfter
  }: PullRequestReminderParameters,
  {owner, repo, state = 'open'}: listPullRequestsParameters
): Promise<void> => {
  if (!remindAfter) {
    // No need to send reminders if remindAfter is not defined.
    return
  }

  const pulls: OctokitListPullRequestsResponseType['data'] =
    await githubService.listPullRequests({owner, repo, state})

  if (pulls.length === 0) {
    // No pull requests to remind about.
    return
  }

  for (const pullRequest of pulls) {
    await processPullRequest(
      pullRequest,
      remindAfter,
      githubUserNames,
      githubSlackUserMapper,
      owner,
      repo
    )
  }
}

/**
 * Check if it's time to send a reminder for a pull request.
 */
const isTimeToRemind = (updatedAt: string, remindAfter: number): boolean => {
  const currentTime = new Date().getTime()
  const updatedAtTime = new Date(updatedAt).getTime()
  const remindThreshold = 3600000 * remindAfter // Convert hours to milliseconds.
  return currentTime - remindThreshold > updatedAtTime
}

/**
 * Process an individual pull request and send reminders if necessary.
 */
const processPullRequest = async (
  pullRequest: OctokitListPullRequestsResponseType['data'][number],
  remindAfter: number,
  githubUserNames: string[],
  githubSlackUserMapper: Record<string, string>,
  owner: string,
  repo: string
): Promise<void> => {
  const {number, updated_at, requested_reviewers, user, html_url} = pullRequest

  if (isTimeToRemind(updated_at, remindAfter)) {
    const thread = await getPullRequestThread({
      repoName: repo,
      prNumber: number
    })

    if (!thread?.ts) {
      // Skip if there's no thread timestamp.
      return
    }

    const reviewStateUsers = await getPullRequestReviewStateUsers(
      {
        prAuthor: user?.login as string,
        requestedReviewers: requested_reviewers?.map(
          (r: {login: string}) => r.login
        ) as string[],
        githubUserNames
      },
      {
        owner,
        repo,
        pull_number: number
      }
    )

    sendAuthorReminderIfApplicable(
      reviewStateUsers.APPROVED.length,
      reviewStateUsers.CHANGES_REQUESTED.length,
      html_url,
      thread.ts,
      user?.login as string,
      githubSlackUserMapper
    )

    sendReviewerRemindersIfApplicable(
      reviewStateUsers.APPROVED.length,
      reviewStateUsers.SECOND_APPROVERS,
      html_url,
      thread.ts,
      githubSlackUserMapper
    )

    sendChangeRequesterRemindersIfApplicable(
      reviewStateUsers.APPROVED.length,
      reviewStateUsers.CHANGES_REQUESTED,
      html_url,
      thread.ts,
      githubSlackUserMapper
    )
  }
}

/**
 * Send a reminder message to the author of the pull request if applicable.
 */
const sendAuthorReminderIfApplicable = (
  approvedCount: number,
  changesRequestedCount: number,
  htmlUrl: string,
  threadTs: string,
  authorLogin: string,
  slackUserMapper: Record<string, string>
): void => {
  if (approvedCount === 2 && changesRequestedCount === 0) {
    Slack.postMessage({
      channel: core.getInput('slack-channel-id'),
      thread_ts: threadTs,
      blocks: generatePullRequestAuthorReminderMessage(
        slackUserMapper,
        authorLogin,
        htmlUrl
      )
    })
  }
}

/**
 * Send reminders to additional reviewers if applicable.
 */
const sendReviewerRemindersIfApplicable = (
  approvedCount: number,
  secondApprovers: string[],
  htmlUrl: string,
  threadTs: string,
  slackUserMapper: Record<string, string>
): void => {
  if (approvedCount <= 1 && secondApprovers.length !== 0) {
    for (const secondApprover of secondApprovers) {
      Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        thread_ts: threadTs,
        blocks: generatePullRequestReviewerReminderMessage(
          slackUserMapper,
          secondApprover,
          htmlUrl
        )
      })
    }
  }
}

/**
 * Send reminders to change requesters if applicable.
 */
const sendChangeRequesterRemindersIfApplicable = (
  approvedCount: number,
  changesRequesters: string[],
  htmlUrl: string,
  threadTs: string,
  slackUserMapper: Record<string, string>
): void => {
  if (approvedCount === 2 && changesRequesters.length !== 0) {
    for (const changesRequester of changesRequesters) {
      Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        thread_ts: threadTs,
        blocks: generatePullRequestChangeRequesterReminderMessage(
          slackUserMapper,
          changesRequester,
          htmlUrl
        )
      })
    }
  }
}
