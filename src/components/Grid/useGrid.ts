import { useCallback } from 'react'
import { useShallow } from 'zustand/shallow'
import useGridStore from '@/store/useGridStore'
import { GRID_DIMENSIONS } from '@/constants/grid'
import type { CellPosition } from '../Cell/CellProps'

export const useGrid = () => {
  const [setActiveCell, copySelectedCells, pasteCopiedCells, undo, redo] =
    useGridStore(
      useShallow((state) => [
        state.setActiveCell,
        state.copySelectedCells,
        state.pasteCopiedCells,
        state.undo,
        state.redo,
      ])
    )

  const getColumnLabel = useCallback((index: number) => {
    let label = ''
    let num = index
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label
      num = Math.floor(num / 26) - 1
    }
    return label
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const activeCell = useGridStore.getState().state.activeCell
      if (!activeCell) return

      let newRow = activeCell.row
      let newCol = activeCell.col

      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            copySelectedCells()
            break
          case 'v':
            pasteCopiedCells(activeCell)
            break
          case 'z':
            if (e.shiftKey) redo()
            else undo()
            break
          case 'y':
            redo()
            break
        }
      }

      // Handle navigation
      switch (e.key) {
        case 'ArrowUp':
          newRow = Math.max(0, activeCell.row - 1)
          break
        case 'ArrowDown':
          newRow = Math.min(GRID_DIMENSIONS.rows - 1, activeCell.row + 1)
          break
        case 'ArrowLeft':
          newCol = Math.max(0, activeCell.col - 1)
          break
        case 'ArrowRight':
          newCol = Math.min(GRID_DIMENSIONS.cols - 1, activeCell.col + 1)
          break
        case 'Tab':
          newCol = Math.min(
            GRID_DIMENSIONS.cols - 1,
            activeCell.col + (e.shiftKey ? -1 : 1)
          )
          e.preventDefault()
          break
        case 'Enter':
          newRow = Math.min(
            GRID_DIMENSIONS.rows - 1,
            activeCell.row + (e.shiftKey ? -1 : 1)
          )
          e.preventDefault()
          break
      }

      if (newRow !== activeCell.row || newCol !== activeCell.col) {
        setActiveCell({ row: newRow, col: newCol } as CellPosition)
      }
    },
    [setActiveCell, copySelectedCells, pasteCopiedCells, undo, redo]
  )

  const renderCell = useCallback(
    (rowIndex: number, columnIndex: number) => ({
      id: `${getColumnLabel(columnIndex)}${rowIndex + 1}`,
    }),
    [getColumnLabel]
  )

  return {
    getColumnLabel,
    handleKeyDown,
    renderCell,
  }
}
