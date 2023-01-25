import {readFile} from 'fs/promises'
interface PullRequestWorkflowInterface {
  teamName?: string
  githubUserNames: string[]
  githubSlackUserMapper: Record<string, string>
}
export const getFileContent =
  async (): Promise<PullRequestWorkflowInterface> => {
    try {
      const data = JSON.parse(
        await readFile('./.github/pull-request-workflow.json', 'utf8')
      )
      validateData(data)
      return data
    } catch (err) {
      return await Promise.reject(err)
    }
  }

const validateData = (data: PullRequestWorkflowInterface): void => {
  if (!data.githubUserNames || data.githubUserNames?.length === 0) {
    throw new Error(
      `"githubUserNames" should be defined as ["username1", "username2"] but received githubUserNames:${data.githubUserNames}`
    )
  }
  if (
    !data.githubSlackUserMapper ||
    Object.keys(data.githubSlackUserMapper)?.length === 0
  ) {
    throw new Error(
      `"githubSlackUserMapper" should be defined as {"githubUserName1":"slackMemberId1", "githubUserName2":"slackMemberId2"} but received githubSlackUserMapper:${JSON.stringify(
        data.githubSlackUserMapper
      )}`
    )
  }
}
