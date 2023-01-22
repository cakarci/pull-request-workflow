import {
  ChatPostMessageArguments,
  ChatPostMessageResponse,
  WebClient
} from '@slack/web-api'

type PostMessage = ({
  channel,
  ...rest
}: ChatPostMessageArguments) => Promise<ChatPostMessageResponse>

export const postMessage = (slackClient: WebClient): PostMessage => {
  return async ({channel, ...rest}) => {
    try {
      return await slackClient.chat.postMessage({
        channel,
        ...rest
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
