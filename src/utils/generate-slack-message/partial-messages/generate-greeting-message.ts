import {Context} from '@actions/github/lib/context'
import {isPrOwnerAndEventActorSame, getUserToLog} from '../../'

export const generateGreetingMessage = (
  githubContext: Context,
  githubSlackUserMapper: Record<string, string>,
  userToGreet?: string
): string => {
  if (userToGreet) {
    return `Hi ${getUserToLog(githubSlackUserMapper, userToGreet)} :wave:\n`
  }
  const {pull_request, issue, requested_reviewer} = githubContext.payload
  const pullRequestReviewerUser = requested_reviewer?.login
  const pullRequestOwnerUser = pull_request?.user.login || issue?.user.login

  if (pullRequestReviewerUser) {
    return `Hi ${getUserToLog(
      githubSlackUserMapper,
      pullRequestReviewerUser
    )} :wave:\n`
  } else {
    return !isPrOwnerAndEventActorSame(githubContext)
      ? `Hi ${getUserToLog(
          githubSlackUserMapper,
          pullRequestOwnerUser
        )} :wave:\n`
      : ''
  }
}
