// utils/deckEncoder.ts

type CardData = {
  name: string
  type?: string
  subtype?: string
  tape_cost?: number
  aura?: string
  rarity?: string
  attack?: number
  health?: number
  flavor_text?: string
  effect?: string
  imageUrl?: string
  expansion?: string
  keywords?: string[]
  artist?: string
}

type Deck = {
  main: CardData[]
  tape: CardData[]
  side: CardData[]
}

// Turn deck into a compact string (for URL)
export function encodeDeck(deck: Deck): string {
  const json = JSON.stringify(deck)
  return btoa(encodeURIComponent(json))
}

// Turn compact string back into deck
export function decodeDeck(encoded: string): Deck | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}
