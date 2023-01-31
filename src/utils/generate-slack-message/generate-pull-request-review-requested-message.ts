import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'
import {getUserToLog} from '../get-user-to-log'

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
        text: `Hi ${getUserToLog(
          githubSlackUserMapper,
          githubContext.payload.requested_reviewer?.login
        )} :wave: A new review was requested from you for the <${
          pull_request?.html_url
        }|pull request> by ${getUserToLog(
          githubSlackUserMapper,
          githubContext.actor
        )}.`
      }
    }
  ]
}
