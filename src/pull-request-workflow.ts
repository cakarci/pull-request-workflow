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
  getFileContent,
  getRandomItemFromArray
} from './utils'
import {Message} from '@slack/web-api/dist/response/ConversationsHistoryResponse'

export const PullRequestWorkflow = async (): Promise<void> => {
  try {
    if (!github.context.eventName.startsWith('pull_request')) {
      core.warning(
        `eventName should be "pull_request*" but received: ${github.context.eventName} `
      )
      return
    }
    const {githubUserNames, githubSlackUserMapper} = await getFileContent()
    const firstReviewer = getRandomItemFromArray(githubUserNames, [
      github.context.actor
    ])
    const secondReviewer = getRandomItemFromArray(githubUserNames, [
      github.context.actor,
      firstReviewer
    ])
    core.info(JSON.stringify(github.context))
    if (
      github.context.payload.action === 'opened' &&
      github.context.eventName === 'pull_request' &&
      github.context.payload.pull_request
    ) {
      const thread = await getPullRequestThread()
      if (thread) {
        return
      }
      await githubService.requestReviewers({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: github.context.payload.pull_request.number,
        reviewers: [firstReviewer, secondReviewer]
      })
      await Slack.postMessage({
        channel: core.getInput('slack-channel-id'),
        text: github.context.payload.pull_request?.id,
        blocks: generatePullRequestOpenedMessage(
          github.context,
          githubSlackUserMapper,
          firstReviewer,
          secondReviewer
        )
      })
    } else {
      const thread = await getPullRequestThread()
      if (github.context.payload.action === 'labeled') {
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
        github.context.eventName === 'pull_request_review' &&
        github.context.payload.action === 'submitted'
      ) {
        await Slack.postMessage({
          channel: core.getInput('slack-channel-id'),
          thread_ts: thread?.ts,
          blocks:
            github.context.payload.review?.state === 'approved'
              ? generatePullRequestApprovedMessage(
                  github.context,
                  githubSlackUserMapper
                )
              : generatePullRequestReviewSubmittedMessage(
                  github.context,
                  githubSlackUserMapper
                )
        })
      }
      if (
        github.context.eventName === 'pull_request' &&
        github.context.payload.action === 'closed' &&
        github.context.payload.pull_request?.merged
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
