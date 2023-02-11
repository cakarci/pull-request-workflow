import {readFile} from 'fs/promises'
interface PullRequestWorkflowInterface {
  teamName?: string
  githubUserNames: string[]
  githubSlackUserMapper: Record<string, string>
  remindAfter?: number
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
  if (data.remindAfter && typeof data.remindAfter !== 'number') {
    throw new Error(`"remindAfter" should be a number`)
  }

  if (data.remindAfter && data.remindAfter <= 0) {
    throw new Error(`"remindAfter" should be greater than 0`)
  }

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
      `"githubSlackUserMapper" should be defined as {"githubUserName1":"slackMemberId1", "githubUserName2":"slackMemberId2", "githubUserName3":"slackMemberId3"} but received githubSlackUserMapper:${JSON.stringify(
        data.githubSlackUserMapper
      )}`
    )
  }
  if (
    data.githubUserNames?.length < 3 ||
    Object.keys(data.githubSlackUserMapper)?.length < 3
  ) {
    throw new Error(
      `In "githubUserNames" or "githubSlackUserMapper", at least 3 users should be added`
    )
  }
}
