# Design

## Idea

The name as a monument: "Charbel Nasseh" runs margin to margin under a live 3D model of his desk,
with a photograph of Beirut set into the space between the two words. The desk is where the
websites and servers get built, so the room is the portfolio's centrepiece and its one live thing:
click the monitor (or "Use my terminal") and type real commands.

The room follows the time in Beirut: the wall clock shows the real hour, the window sky changes,
and the desk lamp switches on in the evening.

## The room

Every object is a place to go: hover shows its name and what it does, a click flies the camera to it and opens
a card beside it (a bottom sheet on phones). The same objects are listed as buttons beside the room, so everything
works from the keyboard. The character types, nods to his music, sips coffee, uses the mouse, stretches, thinks,
turns to face the visitor and waves when greeted. A still poster of the room shows until the live scene starts.

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Ground `--bg` | `#ffffff` | `#141514` |
| Surface `--surface` | `#f3f3f3` | `#1c1e1d` |
| Ink `--ink` | `#232323` | `#ededed` |
| Muted `--muted` | `#6b6b6b` | `#a3a3a3` |
| Accent `--accent` | `#a1ffcb` | `#a1ffcb` |

Mint is used as whole fields only: the primary button, the "Say hello" band, the rug, the headphones.

## Type

One family, Switzer (400/500/600); IBM Plex Sans Arabic for Arabic. Display at 10.6vw, tracking -0.045em.
Steps: small, body, lead, head, display. No monospace except inside the working terminal.

## Rules kept

No eyebrows, gradients, glass, shadows at rest (the terminal dialog is the only shadow), icon cards,
or index numbers. Square image corners; buttons fully round. Equal outer margins everywhere.

## Motion

Signature: the photograph in the name opens like a shutter. Sections rise in, staggered.
Work titles tear at the seam while scrolling. Everything respects `prefers-reduced-motion`.
