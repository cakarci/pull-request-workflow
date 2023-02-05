import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'
import {generateGreetingMessage} from './partial-messages'

export const generatePullRequestReviewRequestedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${generateGreetingMessage(
          githubContext,
          githubSlackUserMapper
        )}A new review was requested from you for the <${
          pull_request?.html_url
        }|pull request> by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}.`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_Happy code reviews_ :tada:'
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: ':arrow_right: Review PR',
          emoji: true
        },
        url: `${pull_request?.html_url}/files`,
        action_id: 'button-action'
      }
    }
  ]
}
