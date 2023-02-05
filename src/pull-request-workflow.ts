import * as core from '@actions/core'
import * as github from '@actions/github'
import {Slack} from './api/slack'
import {
  generateNewCommitAddedMessage,
  generatePullRequestCommentAddedMessage,
  generatePullRequestLabeledMessage,
  generatePullRequestMergedMessage,
  generatePullRequestOpenedMessage,
  generatePullRequestReviewRequestedMessage,
  generatePullRequestReviewSubmittedMessage,
  generateReadyToMergeMessage,
  generateSecondReviewerMessage,
  getFileContent,
  getPrApprovalStates,
  getRandomItemFromArray,
  requestTwoReviewers
} from './utils'
import {Message} from '@slack/web-api/dist/response/ConversationsHistoryResponse'
import {allowedEventNames, GithubEventNames} from './constants'

export const PullRequestWorkflow = async (): Promise<void> => {
  try {
    const {actor, repo, eventName, payload} = github.context
    if (!allowedEventNames.includes(eventName as GithubEventNames)) {
      core.warning(
        `eventName should be ${allowedEventNames.join(
          ','
        )} but received: ${eventName} `
      )
      return
    }
    const {githubUserNames, githubSlackUserMapper} = await getFileContent()
    if (
      eventName === GithubEventNames.PULL_REQUEST &&
      payload.action === 'opened' &&
      payload.pull_request
    ) {
      const [firstReviewer, secondReviewer] = await requestTwoReviewers(
        [actor],
        githubUserNames,
        {
          owner: repo.owner,
          repo: repo.repo,
          pull_number: payload.pull_request.number
        }
      )
      await Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        text: `${github.context.payload.repository?.name}-${payload.pull_request?.number}`,
        blocks: generatePullRequestOpenedMessage(
          github.context,
          githubSlackUserMapper,
          firstReviewer,
          secondReviewer
        )
      })
    } else {
      const thread = await getPullRequestThread()
      if (!thread?.ts) {
        core.warning(
          `The Slack thread is not found for the pull request ${payload.pull_request?.number}. Please make sure that your Slack integration `
        )
        return
      }
      if (
        eventName === GithubEventNames.PULL_REQUEST &&
        payload.action === 'labeled'
      ) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks: generatePullRequestLabeledMessage(
            github.context,
            githubSlackUserMapper
          )
        })
      }

      if (
        eventName === GithubEventNames.PULL_REQUEST &&
        payload.action === 'closed' &&
        payload.pull_request?.merged
      ) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks: generatePullRequestMergedMessage(
            github.context,
            githubSlackUserMapper
          )
        })
      }

      if (
        eventName === GithubEventNames.PULL_REQUEST &&
        payload.action === 'synchronize' &&
        payload.pull_request
      ) {
        if (payload.before !== payload.after) {
          await Slack.postMessage({
            channel: core.getInput('slack-channel-id'),
            thread_ts: thread?.ts,
            blocks: generateNewCommitAddedMessage(
              github.context,
              githubSlackUserMapper
            )
          })
        }
      }

      if (
        eventName === GithubEventNames.PULL_REQUEST &&
        payload.action === 'review_requested' &&
        payload.pull_request
      ) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks: generatePullRequestReviewRequestedMessage(
            github.context,
            githubSlackUserMapper
          )
        })
      }

      if (
        eventName === GithubEventNames.ISSUE_COMMENT &&
        payload.action === 'created'
      ) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks: generatePullRequestCommentAddedMessage(
            github.context,
            githubSlackUserMapper
          )
        })
      }
      if (
        eventName === GithubEventNames.PULL_REQUEST_REVIEW &&
        payload.action === 'submitted' &&
        payload.pull_request
      ) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks: generatePullRequestReviewSubmittedMessage(
            github.context,
            githubSlackUserMapper
          )
        })
        const {approvers, changeRequesters, secondApprovers} =
          await getPrApprovalStates(
            {
              prAuthor: github.context.payload.pull_request?.user.login,
              githubUserNames,
              requestedReviewers: payload.pull_request.requested_reviewers.map(
                (r: {login: never}) => r.login
              )
            },
            {
              owner: repo.owner,
              repo: repo.repo,
              pull_number: payload.pull_request?.number
            }
          )

        core.info(
          JSON.stringify({
            approvers,
            changeRequesters,
            secondApprovers
          })
        )

        if (payload.review?.state === 'approved') {
          if (approvers.length === 1) {
            await Slack.postMessage({
              channel: core.getInput('slack-channel-id'),
              thread_ts: thread?.ts,
              blocks: generateSecondReviewerMessage(
                github.context,
                githubSlackUserMapper,
                getRandomItemFromArray(secondApprovers)
              )
            })
          }

          if (approvers.length >= 2 && changeRequesters.length === 0) {
            await Slack.postMessage({
              channel: core.getInput('slack-channel-id'),
              thread_ts: thread?.ts,
              blocks: generateReadyToMergeMessage(
                github.context,
                githubSlackUserMapper
              )
            })
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

const getPullRequestThread = async (): Promise<Message | undefined> => {
  const history = await Slack.conversationsHistory({
    channel: core.getInput('slack-channel-id')
  })
  const repoName = github.context.payload.repository?.name
  const number =
    github.context.payload.pull_request?.number ||
    github.context.payload.issue?.number
  return history.messages?.find(m => m.text === `${repoName}-${number}`)
}
