import { Cabinet, Drawer, Laptop, Terminal } from '@lucasmarkes/hairline/react'

const FIGURES = { web: Laptop, systems: Drawer, servers: Cabinet, idle: Terminal } as const

export type FigureId = keyof typeof FIGURES

/** One hairline figure per service group; the terminal plays while nothing is chosen. */
export default function ServiceFigure({ id, label }: { id: FigureId; label: string }) {
  const Figure = FIGURES[id]
  return <Figure intensity={0.7} play={id === 'idle'} label={label} />
}
