import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {generateGreetingMessage} from './partial-messages'

export const generateSecondReviewerMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>,
  secondReviewer: string
): (KnownBlock | Block)[] => {
  const {pull_request} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${generateGreetingMessage(
          githubContext,
          githubSlackUserMapper,
          secondReviewer
        )}You are assigned as a *second code reviewer*,`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `• Please ensure all the review comments from the  *first code reviewer* have been addressed properly \n• If required, please add your own review comments as well`
        }
      ]
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
