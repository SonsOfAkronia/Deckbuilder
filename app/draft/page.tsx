'use client'

import { useEffect, useState } from 'react'

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

export default function DraftPage() {
  const [allCards, setAllCards] = useState<CardData[]>([])
  const [draftPool, setDraftPool] = useState<CardData[]>([])
  const [selectedCards, setSelectedCards] = useState<CardData[]>([])
  const [packSize, setPackSize] = useState(10)
  const [draftStarted, setDraftStarted] = useState(false)

  const getValidCards = (cards: CardData[]) =>
    cards.filter(
      (card) =>
        card.type?.toLowerCase() !== 'token' &&
        !(card.type?.toLowerCase() === 'tape' && card.name?.toLowerCase().includes('basic'))
    )

  const generatePack = (size: number, exclude: CardData[] = []) => {
    const pool = getValidCards(allCards).filter(
      (card) => !exclude.some((c) => c.name === card.name)
    )
    return [...pool].sort(() => 0.5 - Math.random()).slice(0, size)
  }

  useEffect(() => {
    fetch('/cards.json')
      .then((res) => res.json())
      .then((cards: CardData[]) => {
        setAllCards(cards)
      })
  }, [])

  const startDraft = () => {
    setSelectedCards([])
    setPackSize(10)
    setDraftStarted(true)
    setDraftPool(generatePack(10))
  }

  const handleSelectCard = (card: CardData) => {
    const newSelected = [...selectedCards, card]
    setSelectedCards(newSelected)

    if (newSelected.length >= 40) {
      setDraftPool([])
      return
    }

    const nextPackSize = packSize > 1 ? packSize - 1 : 10
    setPackSize(nextPackSize)
    setDraftPool(generatePack(nextPackSize, newSelected))
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 flex gap-6">
      {/* Draft Area */}
      <section className="flex-1">
        <h1 className="text-3xl font-bold mb-4">LolCow Draft Mode</h1>

        {!draftStarted && (
          <button
            onClick={startDraft}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-6 py-3 rounded shadow"
          >
            START DRAFT
          </button>
        )}

        {draftStarted && draftPool.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-400">
              Pick 1 card per pack. New packs get smaller until reset.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {draftPool.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectCard(card)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-auto rounded shadow"
                  />
                  <p className="text-sm mt-1 truncate">{card.name}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {draftStarted && draftPool.length === 0 && selectedCards.length >= 40 && (
          <p className="text-xl font-bold mt-6">Draft complete! Deckbuilder coming soon.</p>
        )}
      </section>

      {/* Drafted Card List */}
      <aside className="w-64 bg-gray-800 p-4 rounded-lg h-fit sticky top-6">
        <h2 className="text-xl font-semibold mb-2">Drafted ({selectedCards.length}/40)</h2>
        <ul className="space-y-1 text-sm max-h-[80vh] overflow-y-auto pr-1">
          {selectedCards.map((card, index) => (
            <li key={index} className="truncate border-b border-gray-700 py-1">
              {card.name}
            </li>
          ))}
        </ul>
      </aside>
    </main>
  )
}
