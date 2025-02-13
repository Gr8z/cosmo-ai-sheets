import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type {
  CellData,
  CellPosition,
  GridState,
  CellFormula,
} from '../types/grid'
import { evaluateFormula } from '@/lib/formulaParser'

enableMapSet()

const MAX_UNDO_STACK_SIZE = 100

type GridStore = {
  state: GridState
  setActiveCell: (position: CellPosition) => void
  setCellValue: (id: string, value: string | number | null) => void
  setFormula: (id: string, formula: string) => void
  copySelectedCells: () => void
  pasteCopiedCells: (targetCell: CellPosition) => void
  undo: () => void
  redo: () => void
}

const createInitialState = (): GridState => ({
  cells: new Map(),
  undoStack: [],
  redoStack: [],
})

const useGridStore = create<GridStore>()(
  immer((set) => ({
    state: createInitialState(),

    setActiveCell: (position) =>
      set((store) => {
        store.state.activeCell = position
        store.state.selection = { start: position, end: position }
      }),

    setCellValue: (id, value) =>
      set((store) => {
        const prevState = {
          cells: new Map(store.state.cells),
          activeCell: store.state.activeCell,
          selection: store.state.selection,
        }

        // Update cell value
        const cell = store.state.cells.get(id) || { id }
        store.state.cells.set(id, { ...cell, value, error: undefined })

        // Update dependent cells
        store.state.cells.forEach((cell, cellId) => {
          if (cell.formula?.dependencies.includes(id)) {
            const result = evaluateFormula(cell.formula, (ref) => {
              return store.state.cells.get(ref)?.value ?? null
            })

            if (result && typeof result === 'object' && 'error' in result) {
              store.state.cells.set(cellId, {
                ...cell,
                error: result,
                value: null,
              })
            } else {
              store.state.cells.set(cellId, {
                ...cell,
                value: typeof result === 'object' ? null : result,
                error: undefined,
              })
            }
          }
        })

        // Manage undo stack
        store.state.undoStack.push({
          type: 'SET_CELL_VALUE',
          previousState: prevState,
        })
        if (store.state.undoStack.length > MAX_UNDO_STACK_SIZE) {
          store.state.undoStack.shift()
        }
        store.state.redoStack = []
      }),

    setFormula: (id, formulaStr) =>
      set((store) => {
        const prevState = {
          cells: new Map(store.state.cells),
          activeCell: store.state.activeCell,
          selection: store.state.selection,
        }

        try {
          const cell = store.state.cells.get(id) || { id }
          const formula: CellFormula = {
            raw: formulaStr,
            parsed: formulaStr.slice(1), // Remove the '=' prefix
            dependencies:
              formulaStr
                .slice(1)
                .match(/[A-Z]+\d+/g)
                ?.filter(Boolean) || [],
          }

          const result = evaluateFormula(formula, (ref) => {
            return store.state.cells.get(ref)?.value ?? null
          })

          if (result && typeof result === 'object' && 'error' in result) {
            store.state.cells.set(id, {
              ...cell,
              formula,
              error: result,
              value: null,
            })
          } else {
            store.state.cells.set(id, {
              ...cell,
              formula,
              value: typeof result === 'object' ? null : result,
              error: undefined,
            })
          }

          store.state.undoStack.push({
            type: 'SET_FORMULA',
            previousState: prevState,
          })
          if (store.state.undoStack.length > MAX_UNDO_STACK_SIZE) {
            store.state.undoStack.shift()
          }
          store.state.redoStack = []
        } catch (error) {
          console.error('Failed to set formula:', error)
        }
      }),

    copySelectedCells: () =>
      set((store) => {
        if (!store.state.selection) return

        const selectedCells = new Map<string, CellData>()
        const { start, end } = store.state.selection

        for (let row = start.row; row <= end.row; row++) {
          for (let col = start.col; col <= end.col; col++) {
            const id = `${String.fromCharCode(65 + col)}${row + 1}`
            const cell = store.state.cells.get(id)
            if (cell) selectedCells.set(id, cell)
          }
        }

        store.state.copyBuffer = {
          range: { start, end },
          cells: selectedCells,
        }
      }),

    pasteCopiedCells: (targetCell) =>
      set((store) => {
        if (!store.state.copyBuffer) return

        const prevState = {
          cells: new Map(store.state.cells),
          activeCell: store.state.activeCell,
          selection: store.state.selection,
        }

        store.state.copyBuffer.cells.forEach((cell, id) => {
          const [col, row] = id.match(/([A-Z]+)(\d+)/)?.slice(1) || []
          if (!col || !row) return

          const colOffset = targetCell.col - (col.charCodeAt(0) - 65)
          const rowOffset = targetCell.row - (parseInt(row) - 1)

          const newCol = String.fromCharCode(
            65 + (col.charCodeAt(0) - 65 + colOffset)
          )
          const newRow = parseInt(row) + rowOffset
          const newId = `${newCol}${newRow}`

          store.state.cells.set(newId, { ...cell, id: newId })
        })

        store.state.undoStack.push({
          type: 'PASTE_CELLS',
          previousState: prevState,
        })
        if (store.state.undoStack.length > MAX_UNDO_STACK_SIZE) {
          store.state.undoStack.shift()
        }
        store.state.redoStack = []
      }),

    undo: () =>
      set((store) => {
        const lastUndo = store.state.undoStack[store.state.undoStack.length - 1]
        if (lastUndo) {
          store.state.undoStack.pop()
          store.state.cells = new Map(lastUndo.previousState.cells)
          store.state.activeCell = lastUndo.previousState.activeCell
          store.state.selection = lastUndo.previousState.selection
          store.state.redoStack.push(lastUndo)
        }
      }),

    redo: () =>
      set((store) => {
        const lastRedo = store.state.redoStack[store.state.redoStack.length - 1]
        if (lastRedo) {
          store.state.redoStack.pop()
          store.state.cells = new Map(lastRedo.previousState.cells)
          store.state.activeCell = lastRedo.previousState.activeCell
          store.state.selection = lastRedo.previousState.selection
          store.state.undoStack.push(lastRedo)
        }
      }),
  }))
)

export default useGridStore
