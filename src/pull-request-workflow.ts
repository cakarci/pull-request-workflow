import * as core from '@actions/core'
import * as github from '@actions/github'
import {Slack} from './api/slack'
import {
  generatePullRequestApprovedMessage,
  generatePullRequestLabeledMessage,
  generatePullRequestMergedMessage,
  generatePullRequestOpenedMessage,
  generatePullRequestReviewSubmittedMessage,
  generateReadyToMergeMessage,
  generateSecondReviewerMessage,
  getFileContent,
  getPrApprovalStates,
  getRandomItemFromArray,
  requestTwoReviewers
} from './utils'
import {Message} from '@slack/web-api/dist/response/ConversationsHistoryResponse'

export const PullRequestWorkflow = async (): Promise<void> => {
  try {
    const {actor, repo, eventName, payload} = github.context
    if (!eventName.startsWith('pull_request')) {
      core.warning(
        `eventName should be "pull_request*" but received: ${eventName} `
      )
      return
    }
    const {githubUserNames, githubSlackUserMapper} = await getFileContent()
    if (
      payload.action === 'opened' &&
      eventName === 'pull_request' &&
      payload.pull_request
    ) {
      const thread = await getPullRequestThread()
      if (thread) {
        return
      }
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
        text: payload.pull_request?.id,
        blocks: generatePullRequestOpenedMessage(
          github.context,
          githubSlackUserMapper,
          firstReviewer,
          secondReviewer
        )
      })
    } else {
      const thread = await getPullRequestThread()
      if (payload.action === 'labeled') {
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
        eventName === 'pull_request_review' &&
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
        if (payload.review?.state === 'approved') {
          await Slack.postMessage({
            channel: core.getInput('slack-channel-id'),
            thread_ts: thread?.ts,
            blocks: generatePullRequestApprovedMessage(
              github.context,
              githubSlackUserMapper
            )
          })

          const {approvers, secondApprovers} = await getPrApprovalStates(
            {
              actor,
              githubUserNames,
              requestedReviewers: payload.pull_request.requested_reviewers.map(
                (r: {login: never}) => r.login
              ),
              commit_id: payload.review.commit_id
            },
            {
              owner: repo.owner,
              repo: repo.repo,
              pull_number: payload.pull_request?.number
            }
          )

          core.info(JSON.stringify({approvers, secondApprovers}))

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

          if (approvers.length >= 2) {
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

      if (
        eventName === 'pull_request' &&
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
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

const getPullRequestThread = async (): Promise<Message | undefined> => {
  const history = await Slack.conversationsHistory({
    channel: core.getInput('slack-channel-id')
  })
  return history.messages?.find(
    m => m.text === `${github.context.payload.pull_request?.id}`
  )
}
