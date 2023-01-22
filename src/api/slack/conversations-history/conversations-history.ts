import {
  ConversationsHistoryArguments,
  ConversationsHistoryResponse,
  WebClient
} from '@slack/web-api'

type SearchMessages = ({
  ...args
}: ConversationsHistoryArguments) => Promise<ConversationsHistoryResponse>

export const conversationsHistory = (
  slackClient: WebClient
): SearchMessages => {
  return async ({...args}) => {
    try {
      return await slackClient.conversations.history({
        ...args
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
