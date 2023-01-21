export const getRandomListItems = (list: string[], skip: string): string[] => {
  const newList = list.filter(item => item !== skip)
  const firstRandomIndex = Math.floor(Math.random() * newList.length)
  const lastList = newList.splice(firstRandomIndex, 1)
  const secondRandomIndex = Math.floor(Math.random() * lastList.length)
  return [list[firstRandomIndex], list[secondRandomIndex]]
}
