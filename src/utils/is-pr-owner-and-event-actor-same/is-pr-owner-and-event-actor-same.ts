import {Context} from '@actions/github/lib/context'

export const isPrOwnerAndEventActorSame = (githubContext: Context): Boolean => {
  const {pull_request, issue} = githubContext.payload
  const owner = pull_request?.user.login || issue?.user.login

  return owner === githubContext.actor
}
