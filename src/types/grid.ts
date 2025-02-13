export type CellValue = string | number | null

export type CellFormula = {
  raw: string
  parsed: string
  dependencies: string[] // Cell references like ['A1', 'B2']
}

export type CellError = {
  type:
    | 'CIRCULAR_REFERENCE'
    | 'INVALID_FORMULA'
    | 'CALCULATION_ERROR'
    | 'REFERENCE_ERROR'
  message: string
}

export type CellData = {
  id: string // e.g., 'A1', 'B2'
  value: CellValue
  formula?: CellFormula
  error?: CellError
  formatted?: string
  isEditing?: boolean
}

export type GridSelection = {
  start: { row: number; col: number }
  end: { row: number; col: number }
}

export type GridDimensions = {
  rows: number
  cols: number
  rowHeight: number
  colWidth: number
  headerHeight: number
  headerWidth: number
}

export type GridViewport = {
  startRow: number
  endRow: number
  startCol: number
  endCol: number
  visibleRows: number
  visibleCols: number
}

export type CellPosition = {
  row: number
  col: number
}

export type CellRange = {
  start: CellPosition
  end: CellPosition
}

export type GridState = {
  cells: Map<string, CellData>
  selection?: GridSelection
  activeCell?: CellPosition
  copyBuffer?: {
    range: CellRange
    cells: Map<string, CellData>
  }
  undoStack: GridUndoItem[]
  redoStack: GridUndoItem[]
}

export type GridActionPayload = {
  SET_CELL_VALUE: { id: string; value: CellValue }
  SET_FORMULA: { id: string; formula: CellFormula }
  SET_CELL_ERROR: { id: string; error: CellError }
  CLEAR_CELLS: { range: CellRange }
  PASTE_CELLS: { targetCell: CellPosition; buffer: Map<string, CellData> }
  SET_SELECTION: { selection: GridSelection }
}

export type GridAction = {
  type: keyof GridActionPayload
  payload: GridActionPayload[keyof GridActionPayload]
}

export type GridUndoItem = {
  type: 'SET_CELL_VALUE' | 'SET_FORMULA' | 'PASTE_CELLS'
  previousState: {
    cells: Map<string, CellData>
    activeCell?: CellPosition
    selection?: GridSelection
  }
}
