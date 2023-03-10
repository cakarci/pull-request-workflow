import {listPullRequestsParameters} from '../../api/github/list-pull-requests'
import {githubService} from '../../api/github'
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
export const pullRequestReminder = async (
  {
    githubUserNames,
    githubSlackUserMapper,
    remindAfter
  }: PullRequestReminderParameters,
  {owner, repo, state = 'open'}: listPullRequestsParameters
): Promise<void> => {
  if (!remindAfter) {
    return
  }
  const pulls = await githubService.listPullRequests({owner, repo, state})
  if (pulls.length === 0) {
    return
  }
  for (const {
    number,
    updated_at,
    requested_reviewers,
    user,
    html_url
  } of pulls) {
    if (isTimeToRemind(updated_at, remindAfter)) {
      const thread = await getPullRequestThread({
        repoName: repo,
        prNumber: number
      })

      if (!thread?.ts) {
        return
      }

      const {APPROVED, CHANGES_REQUESTED, SECOND_APPROVERS} =
        await getPullRequestReviewStateUsers(
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

      if (APPROVED.length === 2 && CHANGES_REQUESTED.length === 0) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks: generatePullRequestAuthorReminderMessage(
            githubSlackUserMapper,
            user?.login as string,
            html_url
          )
        })
      }

      if (APPROVED.length <= 1 && SECOND_APPROVERS.length !== 0) {
        for (const secondApprover of SECOND_APPROVERS) {
          await Slack.postMessage({
            channel: core.getInput('slack-channel-id'),
            thread_ts: thread?.ts,
            blocks: generatePullRequestReviewerReminderMessage(
              githubSlackUserMapper,
              secondApprover,
              html_url
            )
          })
        }
      }

      if (APPROVED.length === 2 && CHANGES_REQUESTED.length !== 0) {
        for (const changesRequester of CHANGES_REQUESTED) {
          await Slack.postMessage({
            channel: core.getInput('slack-channel-id'),
            thread_ts: thread?.ts,
            blocks: generatePullRequestChangeRequesterReminderMessage(
              githubSlackUserMapper,
              changesRequester,
              html_url
            )
          })
        }
      }
    }
  }
}

const isTimeToRemind = (updatedAt: string, remindAfter: number): boolean => {
  const today = new Date().getTime()
  const updatedAtDate = new Date(updatedAt).getTime()
  const hoursInMilliSecond = 3600000 * remindAfter
  return today - hoursInMilliSecond > updatedAtDate
}
