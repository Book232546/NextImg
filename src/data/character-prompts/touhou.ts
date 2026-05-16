import type { CharacterPromptCollection } from "./types"

export const touhouCharacterPromptCollection: CharacterPromptCollection = {
  id: "touhou",
  title: "Touhou Character Prompt",
  buttonLabel: "Random Touhou Character",
  subtitle: "Choose Touhou characters from one or multiple mainline games.",
  subgroups: [
    { id: "th06", label: "Touhou 6" },
    { id: "th07", label: "Touhou 7" },
    { id: "th08", label: "Touhou 8" },
    { id: "th09", label: "Touhou 9" },
    { id: "th10", label: "Touhou 10" },
  ],
  items: [
    {
      name: "Cirno",
      game: "Touhou 6: Embodiment of Scarlet Devil",
      imageSrc: "/images/touhou/cirno.png",
      subgroupId: "th06",
    },
    {
      name: "Patchouli Knowledge",
      game: "Touhou 6: Embodiment of Scarlet Devil",
      imageSrc: "/images/touhou/patchouli.png",
      subgroupId: "th06",
    },
    {
      name: "Alice Margatroid",
      game: "Touhou 7: Perfect Cherry Blossom",
      imageSrc: "/images/touhou/alice.png",
      subgroupId: "th07",
    },
    {
      name: "Youmu Konpaku",
      game: "Touhou 7: Perfect Cherry Blossom",
      imageSrc: "/images/touhou/youmu.png",
      subgroupId: "th07",
    },
    {
      name: "Reisen Udongein Inaba",
      game: "Touhou 8: Imperishable Night",
      imageSrc: "/images/touhou/reisen.png",
      subgroupId: "th08",
    },
    {
      name: "Fujiwara no Mokou",
      game: "Touhou 8: Imperishable Night",
      imageSrc: "/images/touhou/mokou.png",
      subgroupId: "th08",
    },
    {
      name: "Aya Shameimaru",
      game: "Touhou 9: Phantasmagoria of Flower View",
      imageSrc: "/images/touhou/aya.png",
      subgroupId: "th09",
    },
    {
      name: "Sanae Kochiya",
      game: "Touhou 10: Mountain of Faith",
      imageSrc: "/images/touhou/sanae.png",
      subgroupId: "th10",
    },
    {
      name: "Suwako Moriya",
      game: "Touhou 10: Mountain of Faith",
      imageSrc: "/images/touhou/suwako.png",
      subgroupId: "th10",
    },
  ],
}
