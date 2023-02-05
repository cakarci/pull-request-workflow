import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'
import {generateGreetingMessage} from './partial-messages'

export const generatePullRequestCommentAddedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {comment} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${generateGreetingMessage(
          githubContext,
          githubSlackUserMapper
        )}A new <${comment?.html_url}|comment> added by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}`
      }
    }
  ]
}
