'use client'

import { formatCellValue } from '@/lib/formulaParser'
import { DEFAULT_CELL_STYLE } from '@/constants/grid'
import type { CellProps } from './CellProps'
import { useCell } from './useCell'

export const Cell = ({ id, position, style }: CellProps) => {
  const {
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
  } = useCell(id, position)

  const cellStyle: React.CSSProperties = {
    ...DEFAULT_CELL_STYLE,
    ...style,
    backgroundColor: isActive ? '#e5e7eb' : 'white',
    boxShadow: isActive ? '0 0 0 2px #3b82f6' : 'none',
    zIndex: isActive ? 1 : 'auto',
  }

  return (
    <div
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role='gridcell'
      tabIndex={0}
      aria-selected={isActive}
      data-row={position.row}
      data-col={position.col}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            padding: 0,
            background: 'transparent',
            outline: 'none',
          }}
        />
      ) : (
        <span style={{ color: cell?.error ? 'red' : 'inherit' }}>
          {cell?.error
            ? `#ERROR: ${cell.error.message}`
            : formatCellValue(cell?.value ?? null)}
        </span>
      )}
    </div>
  )
}

export default Cell
