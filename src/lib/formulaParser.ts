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
} as const

type AllowedFunction = keyof typeof allowedFunctions

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
const FUNCTION_CALL_REGEX = /\b([a-z]+)\(/i
const OPERATOR_REGEX = /[\+\-\*\/\^]/

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

function validateFunction(formula: string): void {
  const match = formula.match(FUNCTION_CALL_REGEX)
  if (match) {
    const functionName = match[1].toLowerCase() as AllowedFunction
    if (!allowedFunctions[functionName]) {
      throw new Error(
        `Function '${functionName}' is not allowed. Available functions: ${Object.keys(
          allowedFunctions
        ).join(', ')}`
      )
    }
  }
}

export function parseFormula(raw: string): CellFormula {
  if (!isFormula(raw)) {
    throw new Error('Not a valid formula')
  }

  const formulaContent = raw.slice(1) // Remove '=' prefix
  validateFunction(formulaContent)
  const dependencies = extractCellReferences(formulaContent)

  return {
    raw,
    parsed: formulaContent,
    dependencies,
  }
}

export function evaluateFormula(
  formula: CellFormula,
  getCellValue: (ref: string) => CellValue | CellError,
  visitedCells: Set<string> = new Set()
): CellValue | CellError {
  try {
    let expression = formula.parsed

    // Check for circular references
    for (const ref of formula.dependencies) {
      if (visitedCells.has(ref)) {
        return {
          type: 'CIRCULAR_REFERENCE',
          message: `Circular reference detected: ${Array.from(
            visitedCells
          ).join(' → ')} → ${ref}`,
        }
      }
    }

    // Check if formula contains operators (mathematical operation)
    const hasOperators = OPERATOR_REGEX.test(expression)

    // Replace cell references with their values
    for (const ref of formula.dependencies) {
      const value = getCellValue(ref)

      // Handle null/undefined values
      if (value === null || value === undefined) {
        if (hasOperators) {
          expression = expression.replace(ref, '0')
        } else {
          return null // If no operators, propagate null value
        }
        continue
      }

      // Handle referenced cell errors
      if (typeof value === 'object' && 'type' in value && 'message' in value) {
        return {
          type: 'REFERENCE_ERROR',
          message: `Referenced cell ${ref} contains an error: ${value.message}`,
        }
      }

      // Handle string values in mathematical operations
      if (
        hasOperators &&
        typeof value === 'string' &&
        !/^\d+\.?\d*$/.test(value)
      ) {
        return {
          type: 'CALCULATION_ERROR',
          message: `Cannot perform mathematical operations with text value '${value}' in cell ${ref}`,
        }
      }

      expression = expression.replace(ref, value.toString())
    }

    // If no operators and single reference, return the value as is (including strings)
    if (!hasOperators && formula.dependencies.length === 1) {
      const value = getCellValue(formula.dependencies[0])
      return value
    }

    // Evaluate the expression
    const result = math.evaluate(expression)

    // Handle division by zero and other math errors
    if (!Number.isFinite(result)) {
      return {
        type: 'CALCULATION_ERROR',
        message: 'Division by zero or invalid mathematical operation',
      }
    }

    // Convert the result to a number if possible
    return typeof result === 'number' ? result : result.toString()
  } catch (error) {
    if (error instanceof CircularReferenceError) {
      return {
        type: 'CIRCULAR_REFERENCE',
        message: error.message,
      }
    }

    // Handle syntax errors and other calculation errors
    return {
      type: 'CALCULATION_ERROR',
      message:
        error instanceof Error
          ? error.message.replace(/Error: /, '') // Remove "Error: " prefix for cleaner messages
          : 'Invalid formula or calculation error',
    }
  }
}

export function formatCellValue(value: CellValue | CellError): string {
  if (value === null) return ''
  if (typeof value === 'object' && 'error' in value) {
    return `#${value.type}: ${value.message}`
  }
  if (typeof value === 'number') {
    // Format numbers with up to 10 decimal places, removing trailing zeros
    return Number(value.toFixed(10)).toString()
  }
  return value.toString()
}
