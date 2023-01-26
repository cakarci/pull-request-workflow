import * as core from '@actions/core'
import * as github from '@actions/github'
import {githubService} from './api/github'
import {Slack} from './api/slack'
import {
  generatePullRequestApprovedMessage,
  generatePullRequestLabeledMessage,
  generatePullRequestMergedMessage,
  generatePullRequestOpenedMessage,
  generatePullRequestReviewSubmittedMessage,
  generateSecondReviewerMessage,
  getFileContent,
  getRandomItemFromArray
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
    const firstReviewer = getRandomItemFromArray(githubUserNames, [actor])
    const secondReviewer = getRandomItemFromArray(githubUserNames, [
      actor,
      firstReviewer
    ])
    if (
      payload.action === 'opened' &&
      eventName === 'pull_request' &&
      payload.pull_request
    ) {
      const thread = await getPullRequestThread()
      if (thread) {
        return
      }
      await githubService.requestReviewers({
        owner: repo.owner,
        repo: repo.repo,
        pull_number: payload.pull_request.number,
        reviewers: [firstReviewer, secondReviewer]
      })
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
        payload.action === 'submitted'
      ) {
        const reviewers = await githubService.getReviewers({
          owner: repo.owner,
          repo: repo.repo,
          pull_number: payload.pull_request?.number as number
        })
        core.info(JSON.stringify(reviewers))
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
          await Slack.postMessage({
            channel: core.getInput('slack-channel-id'),
            thread_ts: thread?.ts,
            blocks: generateSecondReviewerMessage(
              github.context,
              githubSlackUserMapper
            )
          })
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
