import {PullRequestWorkflow} from './pull-request-workflow'

export async function run(): Promise<void> {
  await PullRequestWorkflow()
}
run()
