import {Message} from '@slack/web-api/dist/response/ConversationsHistoryResponse'
import {Slack} from '../../api/slack'
import * as core from '@actions/core'

export const getPullRequestThread = async ({
  repoName,
  prNumber
}: {
  repoName: string | undefined
  prNumber: number | undefined
}): Promise<Message | undefined> => {
  const history = await Slack.conversationsHistory({
    channel: core.getInput('slack-channel-id')
  })
  return history.messages?.find(m => m.text === `${repoName}-${prNumber}`)
}
