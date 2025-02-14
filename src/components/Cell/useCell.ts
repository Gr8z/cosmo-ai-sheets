import { useState, useRef, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import useGridStore from '@/store/useGridStore'
import type { CellValue } from '@/types/grid'
import type { CellPosition } from './CellProps'

export const useCell = (id: string, position: CellPosition) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [cell, activeCell, setActiveCell, setCellValue, setFormula] =
    useGridStore(
      useShallow((state) => [
        state.state.cells.get(id),
        state.state.activeCell,
        state.setActiveCell,
        state.setCellValue,
        state.setFormula,
      ])
    )

  const isActive =
    activeCell?.row === position.row && activeCell?.col === position.col

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(cell?.formula?.raw ?? cell?.value?.toString() ?? '')
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isEditing) {
      setActiveCell(position)
    }
  }

  const handleBlur = () => {
    if (isEditing) {
      commitEdit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      commitEdit()
      setActiveCell({
        row: position.row,
        col: position.col + (e.shiftKey ? -1 : 1),
      })
    }
  }

  const commitEdit = () => {
    setIsEditing(false)
    if (editValue.startsWith('=')) {
      setFormula(id, editValue)
    } else {
      setCellValue(
        id,
        editValue === ''
          ? null
          : isNaN(Number(editValue))
          ? editValue
          : Number(editValue)
      )
    }
  }

  return {
    cell,
    isActive,
    isEditing,
    editValue,
    inputRef,
    handleDoubleClick,
    handleClick,
    handleBlur,
    handleKeyDown,
    setEditValue,
  }
}
