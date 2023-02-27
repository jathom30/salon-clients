export const passwordStrength = (password: string) => {
  const minCharacters = password.length >= 8
  const includesLetters = /[a-zA-Z]/g.test(password)
  const includesNumbers = /\d/.test(password)
  const includesSpecialCharacters = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)

  const strength = !minCharacters ? 1 : [minCharacters, includesLetters, includesNumbers, includesSpecialCharacters].reduce((acc, cur) => {
    if (!cur) return acc
    return acc += 1
  }, 0)

  return {
    tests: {
      minCharacters,
      includesLetters,
      includesNumbers,
      includesSpecialCharacters,
    },
    strength
  }
}

export const getPasswordError = (tests: ReturnType<typeof passwordStrength>['tests']) => {
  if (!tests.minCharacters) return 'Password must be at least 8 characters'
  if (!(tests.includesNumbers || tests.includesSpecialCharacters)) return 'Password must include at least 1 number and special character'
  if (!tests.includesNumbers) return 'Password must include at least 1 number'
  if (!tests.includesSpecialCharacters) return 'Password must include at least 1 special character'
  if (!tests.includesLetters) return 'Password must include at least 1 letter'
}

/**
 * @returns domain URL (without a ending slash, like: https://kentcdodds.com)
 */
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}