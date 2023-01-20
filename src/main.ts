import {PullRequestService} from './pull-request-service'

export async function run(): Promise<void> {
  await PullRequestService()
}
run()
