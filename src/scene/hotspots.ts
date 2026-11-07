/**
 * The things in the room a visitor can open. Kept free of three.js so the
 * page can list them (and render their cards) before the scene loads.
 */
export const CARD_SPOTS = ['charbel', 'server', 'books', 'board', 'clock', 'window', 'phone', 'print'] as const
export type CardSpot = (typeof CARD_SPOTS)[number]

/** Small toys: they react in the room, no card. */
export const TOY_SPOTS = ['lamp', 'mug', 'plant', 'beanbag'] as const
export type ToySpot = (typeof TOY_SPOTS)[number]

export type SpotId = 'monitor' | CardSpot | ToySpot

export const isCardSpot = (id: SpotId | null): id is CardSpot => !!id && (CARD_SPOTS as readonly string[]).includes(id)
