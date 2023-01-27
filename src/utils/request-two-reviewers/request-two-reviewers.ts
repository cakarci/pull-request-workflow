import {getRandomItemFromArray} from '../get-random-item-from-array'
import {githubService} from '../../api/github'

export const requestTwoReviewers = async (
  skip: string,
  githubUserNames: string[],
  {owner, repo, pull_number}: {owner: string; repo: string; pull_number: number}
): Promise<string[]> => {
  const firstReviewer = getRandomItemFromArray(githubUserNames, [skip])
  const secondReviewer = getRandomItemFromArray(githubUserNames, [
    skip,
    firstReviewer
  ])
  await githubService.requestReviewers({
    owner,
    repo,
    pull_number,
    reviewers: [firstReviewer, ...(secondReviewer && [secondReviewer])]
  })

  return [firstReviewer, secondReviewer]
}
