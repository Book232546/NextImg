export type CharacterPrompt = {
  name: string
  game: string
  imageSrc?: string
  subgroupId?: string
}

export type CharacterPromptCollection = {
  id: string
  title: string
  buttonLabel: string
  subtitle: string
  subgroups?: {
    id: string
    label: string
  }[]
  items: CharacterPrompt[]
}
