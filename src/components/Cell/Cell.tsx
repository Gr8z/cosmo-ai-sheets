'use client'

import { formatCellValue } from '@/lib/formulaParser'
import type { CellProps } from './CellProps'
import { useCell } from './useCell'
import classNames from 'classnames'

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

  return (
    <div
      className={classNames(
        'border-r border-b border-slate-200 bg-white overflow-hidden',
        'absolute top-0 left-0',
        {
          'bg-gray-200': isActive,
          'ring-2 ring-blue-500 z-10': isActive,
        }
      )}
      style={{
        ...style,
        padding: '4px 8px',
      }}
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
          className='w-full h-full border-none p-0 bg-transparent outline-none'
        />
      ) : (
        <span
          className={classNames('block truncate', {
            'text-red-500': cell?.error,
          })}
        >
          {cell?.error
            ? `#ERROR: ${cell.error.message}`
            : formatCellValue(cell?.value ?? null)}
        </span>
      )}
    </div>
  )
}

export default Cell
