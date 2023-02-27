const numbersOnlyMasking = (
  value: string,
  splitAt: number,
  joinWith: string,
  maxNumbers?: number,
  breakPatternAt?: number,
): string => {
  // removes any non-numeric characters
  const numbersOnly = value.replace(/[^0-9]+/g, '')
  // regex splits string by specified length using 'splitAt' param
  const splitRegex = new RegExp(`.{1,${splitAt}}`, 'g')
  // array of string split
  const splitOn = numbersOnly.match(splitRegex)

  // if the pattern is to be broken
  if (breakPatternAt && numbersOnly.length > breakPatternAt) {
    // keep starting pattern
    const keepPattern = numbersOnly.substring(0, breakPatternAt)
    // return numbers for rest of value without pattern
    const breakPattern = numbersOnly.substring(breakPatternAt)
    // join them to return full value
    const joinedPattern =
      keepPattern.match(splitRegex)?.join(joinWith) + breakPattern

    // if broken pattern and max length
    if (maxNumbers && numbersOnly.length > maxNumbers) {
      // return substring of max + 2 to account for missing pattern char
      return joinedPattern.substring(0, maxNumbers + 2)
    }
    return joinedPattern
  }

  // if length exceeds max, remove any new characters
  if (splitOn) {
    if (maxNumbers && numbersOnly.length > maxNumbers) {
      return splitOn.join(joinWith).substring(0, maxNumbers + 1)
    }

    // join group at specified length with specified character
    if (numbersOnly.length > splitAt) {
      return splitOn.join(joinWith)
    }
  }
  return numbersOnly
}

export const maskingFuncs = {
  'credit-card': (value: string) => numbersOnlyMasking(value, 4, ' '),
  'zip-code': (value: string) => numbersOnlyMasking(value, 5, '-', 9),
  'expiration-date': (value: string) => numbersOnlyMasking(value, 2, '/', 4),
  'phone-number': (value: string) => numbersOnlyMasking(value, 3, '-', 10, 7),
}