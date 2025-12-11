export const Timeout: number = 1000

export const getName = (name: string | undefined) => {
  return `${name}`
}

export const statusOptions = Object.entries(Status).map(([key, value]) => ({
  name: key,
  value: value,
}))

export const genders = ['M', 'F']

export const sortOrderOptions = ['asc', 'desc']

export const promoterType = ['morale', 'physique']
