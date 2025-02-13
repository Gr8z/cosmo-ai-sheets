import { create, all } from 'mathjs'
import type { CellFormula, CellError, CellValue } from '../types/grid'

// Create a math instance with limited functionality for safety
const math = create(all, {
  // Limit maximum characters in output strings
  precision: 14,
})

// Restrict available functions for security
const allowedFunctions = {
  sqrt: math.sqrt,
  abs: math.abs,
  round: math.round,
  floor: math.floor,
  ceil: math.ceil,
}

math.import(
  {
    ...allowedFunctions,
    import: function () {
      throw new Error('Function import is disabled')
    },
    createUnit: function () {
      throw new Error('Function createUnit is disabled')
    },
    simplify: function () {
      throw new Error('Function simplify is disabled')
    },
    derivative: function () {
      throw new Error('Function derivative is disabled')
    },
  },
  { override: true }
)

const FORMULA_REGEX = /^=(.+)$/
const CELL_REFERENCE_REGEX = /([A-Z]+)(\d+)/g

export class CircularReferenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircularReferenceError'
  }
}

export function isCellReference(value: string): boolean {
  return CELL_REFERENCE_REGEX.test(value)
}

export function extractCellReferences(formula: string): string[] {
  const references = new Set<string>()
  let match

  // Reset regex lastIndex
  CELL_REFERENCE_REGEX.lastIndex = 0

  // Check for individual cell references
  while ((match = CELL_REFERENCE_REGEX.exec(formula)) !== null) {
    references.add(match[0])
  }

  return Array.from(references)
}

export function isFormula(value: string): boolean {
  return FORMULA_REGEX.test(value)
}

export function parseFormula(raw: string): CellFormula {
  if (!isFormula(raw)) {
    throw new Error('Not a valid formula')
  }

  const formulaContent = raw.slice(1) // Remove '=' prefix
  const dependencies = extractCellReferences(formulaContent)

  return {
    raw,
    parsed: formulaContent,
    dependencies,
  }
}

export function evaluateFormula(
  formula: CellFormula,
  getCellValue: (ref: string) => CellValue,
  visitedCells: Set<string> = new Set()
): CellValue | CellError {
  try {
    let expression = formula.parsed

    // Check for circular references
    for (const ref of formula.dependencies) {
      if (visitedCells.has(ref)) {
        throw new CircularReferenceError(
          `Circular reference detected at ${ref}`
        )
      }
    }

    // Replace cell references with their values
    for (const ref of formula.dependencies) {
      const value = getCellValue(ref)
      // Treat null/undefined values as 0 instead of throwing error
      if (value === null || value === undefined) {
        expression = expression.replace(ref, '0')
        continue
      }
      if (typeof value === 'object' && 'error' in value) {
        return value
      }
      expression = expression.replace(ref, value.toString())
    }

    // Evaluate the expression
    const result = math.evaluate(expression)

    // Convert the result to a number if possible
    return typeof result === 'number' ? result : result.toString()
  } catch (error) {
    if (error instanceof CircularReferenceError) {
      return {
        type: 'CIRCULAR_REFERENCE',
        message: error.message,
      }
    }

    return {
      type: 'CALCULATION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function formatCellValue(value: CellValue | CellError): string {
  if (value === null) return ''
  if (typeof value === 'object' && 'error' in value) {
    return `#ERROR: ${value.message}`
  }
  if (typeof value === 'number') {
    // Format numbers with up to 10 decimal places, removing trailing zeros
    return Number(value.toFixed(10)).toString()
  }
  return value.toString()
}
