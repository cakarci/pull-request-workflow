import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generatePullRequestAuthorReminderMessage = (
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
        )} :wave:\nThe <${html_url}|pull request> is ready to be merged and waiting your action.`
      }
    }
  ]
}
