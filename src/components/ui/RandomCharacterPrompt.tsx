"use client"

import { useState } from "react"
import {
  genshinImpactCharacterPromptCollection,
  honkaiStarRailCharacterPromptCollection,
  touhouCharacterPromptCollection,
  type CharacterPrompt,
} from "@/data/character-prompts"

const collections = [
  touhouCharacterPromptCollection,
  genshinImpactCharacterPromptCollection,
  honkaiStarRailCharacterPromptCollection,
]

const touhouSubgroupIds = touhouCharacterPromptCollection.subgroups?.map((group) => group.id) ?? []

function getRandomPrompt(prompts: CharacterPrompt[], exclude?: CharacterPrompt | null) {
  if (prompts.length === 0) {
    return null
  }

  if (prompts.length === 1) {
    return prompts[0]
  }

  let nextPrompt = prompts[Math.floor(Math.random() * prompts.length)]

  while (nextPrompt.name === exclude?.name && nextPrompt.game === exclude.game) {
    nextPrompt = prompts[Math.floor(Math.random() * prompts.length)]
  }

  return nextPrompt
}

export default function RandomCharacterPrompt() {
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(() =>
    collections.map((collection) => collection.id),
  )
  const [selectedTouhouSubgroups, setSelectedTouhouSubgroups] = useState<string[]>(touhouSubgroupIds)

  const availablePrompts = collections.flatMap((collection) => {
    if (!selectedCollectionIds.includes(collection.id)) {
      return []
    }

    if (collection.id !== "touhou") {
      return collection.items
    }

    return collection.items.filter(
      (item) => item.subgroupId && selectedTouhouSubgroups.includes(item.subgroupId),
    )
  })

  const [prompt, setPrompt] = useState<CharacterPrompt | null>(null)

  const selectedCollections = collections.filter((collection) => selectedCollectionIds.includes(collection.id))
  const eyebrow = selectedCollections.length === 1
    ? selectedCollections[0].title
    : "Mixed Character Prompt"
  const buttonLabel = selectedCollections.length === 1
    ? selectedCollections[0].buttonLabel
    : "Random Character"
  const summaryText = selectedCollections.length === 0
    ? "Choose at least one game to start randomizing."
    : selectedCollections.map((collection) => collection.title.replace(" Character Prompt", "")).join(" + ")

  const toggleCollection = (collectionId: string) => {
    setSelectedCollectionIds((currentIds) =>
      currentIds.includes(collectionId)
        ? currentIds.filter((id) => id !== collectionId)
        : [...currentIds, collectionId],
    )
  }

  const toggleTouhouSubgroup = (subgroupId: string) => {
    setSelectedTouhouSubgroups((currentIds) =>
      currentIds.includes(subgroupId)
        ? currentIds.filter((id) => id !== subgroupId)
        : [...currentIds, subgroupId],
    )
  }

  const isTouhouSelected = selectedCollectionIds.includes("touhou")

  return (
    <section className="random-draw" aria-labelledby="random-draw-title">
      <div className="random-draw__panel">
        <div className="random-draw__content">
          <div className="random-draw__copy">
            <span className="random-draw__eyebrow">{eyebrow}</span>
            <h2 id="random-draw-title" className="random-draw__title">
              If you don&apos;t know what to draw, click it.
            </h2>
            <p className="random-draw__summary">{summaryText}</p>

            <div className="random-draw__filters">
              <div className="random-draw__filter-group">
                <span className="random-draw__filter-label">Games</span>
                <div className="random-draw__chips">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      className={`random-draw__chip ${selectedCollectionIds.includes(collection.id) ? "random-draw__chip--active" : ""}`}
                      onClick={() => toggleCollection(collection.id)}
                    >
                      {collection.title.replace(" Character Prompt", "")}
                    </button>
                  ))}
                </div>
              </div>

              {isTouhouSelected && (
                <div className="random-draw__filter-group">
                  <span className="random-draw__filter-label">Touhou Games</span>
                  <div className="random-draw__chips">
                    {touhouCharacterPromptCollection.subgroups?.map((subgroup) => (
                      <button
                        key={subgroup.id}
                        type="button"
                        className={`random-draw__chip ${selectedTouhouSubgroups.includes(subgroup.id) ? "random-draw__chip--active" : ""}`}
                        onClick={() => toggleTouhouSubgroup(subgroup.id)}
                      >
                        {subgroup.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {prompt ? (
              <>
                <p className="random-draw__game">{prompt.game}</p>
                <p className="random-draw__prompt">{prompt.name}</p>
              </>
            ) : (
              <p className="random-draw__empty">
                Click random when your filters are ready.
              </p>
            )}

            <button
              type="button"
              className="random-draw__button"
              onClick={() => setPrompt((currentPrompt) => getRandomPrompt(availablePrompts, currentPrompt))}
              disabled={availablePrompts.length === 0}
            >
              {buttonLabel}
            </button>
          </div>

          <div className="random-draw__image-wrap">
            {prompt ? (
              prompt.imageSrc ? (
                <img
                  src={prompt.imageSrc}
                  alt={prompt.name}
                  className="random-draw__image"
                />
              ) : (
                <div className="random-draw__image-empty">
                  <strong>{prompt.name}</strong>
                  <span>Image coming soon</span>
                </div>
              )
            ) : (
              <div className="random-draw__image-empty">Pick at least one game</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
