'use client'

import { Cell } from '../Cell/Cell'
import { FixedSizeGrid } from 'react-window'
import {
  COLUMN_WIDTH,
  ROW_HEIGHT,
  SCROLLBAR_WIDTH,
  HEADER_WIDTH,
  GRID_DIMENSIONS,
  OVERSCAN_COUNT,
} from '@/constants/grid'
import { useGrid } from './useGrid'
import { useRef } from 'react'

export const Grid = () => {
  const { getColumnLabel, handleKeyDown, renderCell } = useGrid()
  const columnHeaderRef = useRef<HTMLDivElement>(null)
  const rowHeaderRef = useRef<HTMLDivElement>(null)

  const handleScroll = ({
    scrollLeft,
    scrollTop,
  }: {
    scrollLeft: number
    scrollTop: number
  }) => {
    if (columnHeaderRef.current) {
      columnHeaderRef.current.style.transform = `translateX(-${scrollLeft}px)`
    }
    if (rowHeaderRef.current) {
      rowHeaderRef.current.style.transform = `translateY(-${scrollTop}px)`
    }
  }

  return (
    <div
      className='w-screen h-screen flex flex-col overflow-hidden outline-none'
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Column Headers */}
      <div className='flex h-[30px]'>
        <div
          className='border-r border-b border-gray-200 flex-shrink-0 bg-gray-50'
          style={{ width: HEADER_WIDTH }}
        />
        <div
          className='overflow-hidden'
          style={{
            width: `calc(100% - ${HEADER_WIDTH}px)`,
            height: ROW_HEIGHT,
            marginRight: SCROLLBAR_WIDTH,
          }}
        >
          <div
            ref={columnHeaderRef}
            className='flex'
            style={{
              width: GRID_DIMENSIONS.cols * COLUMN_WIDTH,
              height: '100%',
              willChange: 'transform',
            }}
          >
            {Array.from({ length: GRID_DIMENSIONS.cols }, (_, index) => (
              <div
                key={`col-${index}`}
                className='flex-shrink-0 border-r border-b border-t border-gray-200 bg-gray-50 flex items-center justify-center select-none'
                style={{
                  width: COLUMN_WIDTH,
                  height: '100%',
                  borderLeftWidth: index === 0 ? '1px' : '0',
                }}
              >
                {getColumnLabel(index)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Row Headers */}
        <div
          className='flex-shrink-0 overflow-hidden'
          style={{ width: HEADER_WIDTH, marginBottom: SCROLLBAR_WIDTH }}
        >
          <div
            ref={rowHeaderRef}
            style={{
              height: GRID_DIMENSIONS.rows * ROW_HEIGHT,
              willChange: 'transform',
            }}
          >
            {Array.from({ length: GRID_DIMENSIONS.rows }, (_, index) => (
              <div
                key={`row-${index}`}
                className='border-b border-r border-gray-200 bg-gray-50 flex items-center justify-center select-none'
                style={{
                  height: ROW_HEIGHT,
                  borderLeftWidth: '1px',
                  borderTopWidth: index === 0 ? '1px' : '0',
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Virtualized Grid */}
        <div className='overflow-hidden flex-1'>
          <FixedSizeGrid
            className='Grid'
            columnCount={GRID_DIMENSIONS.cols}
            columnWidth={COLUMN_WIDTH}
            height={window.innerHeight - ROW_HEIGHT - SCROLLBAR_WIDTH}
            rowCount={GRID_DIMENSIONS.rows}
            rowHeight={ROW_HEIGHT}
            width={window.innerWidth - HEADER_WIDTH - SCROLLBAR_WIDTH}
            overscanColumnCount={OVERSCAN_COUNT}
            overscanRowCount={OVERSCAN_COUNT}
            onScroll={handleScroll}
          >
            {({ columnIndex, rowIndex, style }) => (
              <Cell
                key={`${rowIndex}-${columnIndex}`}
                id={renderCell(rowIndex, columnIndex).id}
                position={{ row: rowIndex, col: columnIndex }}
                style={{
                  ...style,
                  width: COLUMN_WIDTH,
                  borderTopWidth: rowIndex === 0 ? '1px' : '0',
                  borderLeftWidth: columnIndex === 0 ? '1px' : '0',
                }}
              />
            )}
          </FixedSizeGrid>
        </div>
      </div>
    </div>
  )
}

export default Grid
