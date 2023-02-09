import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generatePullRequestReviewerReminderMessage = (
  githubSlackUserMapper: Record<string, string>,
  userToRemind: string,
  html_url: string
): (KnownBlock | Block)[] => {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi ${getUserToLog(
          githubSlackUserMapper,
          userToRemind
        )} :wave:\nThe <${html_url}|pull request> is waiting for your review.`
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
        url: `${html_url}/files`,
        action_id: 'button-action'
      }
    }
  ]
}
