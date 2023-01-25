import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'

export const generatePullRequestReviewSubmittedMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request, review} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi <@${
          githubSlackUserMapper[pull_request?.user.login]
        }>, a new <${review?.html_url}|review comment> added by <@${
          githubSlackUserMapper[githubContext.actor]
        }>`
      }
    }
  ]
}
