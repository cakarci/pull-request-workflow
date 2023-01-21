import {readFile} from 'fs/promises'
interface PullRequestWorkflowInterface {
  reviewers: string[]
  slack: Record<string, string>
}
export const getFileContent =
  async (): Promise<PullRequestWorkflowInterface> => {
    try {
      return JSON.parse(
        await readFile('./.github/pull-request-workflow.json', 'utf8')
      )
    } catch (err) {
      return await Promise.reject(err)
    }
  }
