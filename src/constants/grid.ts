import type { CSSProperties } from 'react'

// Grid dimensions
export const GRID_DIMENSIONS = { rows: 10000, cols: 10000 }

// Layout measurements
export const COLUMN_WIDTH = 120
export const ROW_HEIGHT = 30
export const HEADER_WIDTH = 50
export const SCROLLBAR_WIDTH = 17

// Virtualization settings
export const OVERSCAN_COUNT = 2

// Undo/redo settings
export const MAX_UNDO_STACK_SIZE = 100

// Cell styles
export const DEFAULT_CELL_STYLE: CSSProperties = {
  padding: '4px 8px',
  border: '1px solid #e2e8f0',
  backgroundColor: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
