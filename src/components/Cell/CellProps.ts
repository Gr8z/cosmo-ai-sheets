import type { CSSProperties } from 'react'

export interface CellPosition {
  row: number
  col: number
}

export interface CellProps {
  id: string
  position: CellPosition
  style?: CSSProperties
}
