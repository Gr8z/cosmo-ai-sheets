'use client'

import { CellError } from '@/types/grid'
import classNames from 'classnames'

const errorTypeColors = {
  CIRCULAR_REFERENCE: 'text-orange-600',
  CALCULATION_ERROR: 'text-red-600',
  REFERENCE_ERROR: 'text-yellow-600',
  INVALID_FORMULA: 'text-red-600',
} as const

interface CellErrorProps {
  error: CellError
}

export const CellErrorDisplay = ({ error }: CellErrorProps) => {
  return (
    <div className='relative group'>
      <span
        className={classNames(
          'block truncate font-medium',
          errorTypeColors[error.type]
        )}
      >
        #ERROR
      </span>
      {/* Tooltip */}
      <div className='fixed z-[9999] hidden group-hover:block'>
        <div
          className='absolute left-0 w-max max-w-xs'
          style={{
            top: 'calc(100% + 3px)',
            left: '0px',
          }}
        >
          {/* Tooltip arrow */}
          <div className='absolute -top-[6px] left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900' />
          <div className='bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg'>
            <div className='font-medium mb-1'>
              {error.type.replace(/_/g, ' ')}
            </div>
            <div className='text-gray-300 text-xs'>{error.message}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CellErrorDisplay
