import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {generateGreetingMessage} from './partial-messages'

export const generateReadyToMergeMessage = (
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
        )}Your <${
          pull_request?.html_url
        }|pull request>  ready to be merged :rocket:`
      }
    }
  ]
}
