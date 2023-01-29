export const getRandomItemFromArray = (
  list: string[],
  skip: string[] = []
): string => {
  const newList = skip?.length
    ? list.filter(item => !skip.includes(item))
    : list
  const randomIndex = Math.floor(Math.random() * newList.length)
  return newList[randomIndex]
}
