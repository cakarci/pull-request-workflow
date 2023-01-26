import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

export const generatePullRequestMergedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `The <${
          pull_request?.html_url
        }|pull request> is merged by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}.`
      }
    }
  ]
}
