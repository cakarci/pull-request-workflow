import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'

export const generatePullRequestReviewSubmittedMessage = (
  githubContext: Context,
  slack: Record<string, string>
): (KnownBlock | Block)[] => {
  const {pull_request, review} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi <@${slack[pull_request?.user.login]}>, a new <${
          review?.html_url
        }|review comment> added by <@${slack[githubContext.actor]}>`
      }
    }
  ]
}
