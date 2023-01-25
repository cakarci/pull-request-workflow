import {Context} from '@actions/github/lib/context'
import {Block, KnownBlock} from '@slack/types'

export const generatePullRequestLabeledMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>
): (KnownBlock | Block)[] => {
  const {label, pull_request} = githubContext.payload
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `A new label \`${label?.name}\` added to the <${
          pull_request?.html_url
        }|pull request> by <@${githubSlackUserMapper[githubContext.actor]}>.`
      }
    }
  ]
}
