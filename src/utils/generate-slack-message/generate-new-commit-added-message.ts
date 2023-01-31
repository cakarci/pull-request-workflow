import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generateNewCommitAddedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `A new <${pull_request?.html_url}/commits/${
          githubContext.payload.after
        }|commit> added to the <${
          pull_request?.html_url
        }|pull request> by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}.`
      }
    }
  ]
}
