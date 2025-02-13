# Cosmo AI Sheets - Excel Clone

A high-performance Excel clone built with Next.js, featuring a virtualized grid with formula support.

## Features

- 🚀 High-performance virtualized grid (10,000 x 10,000 cells)
- 📝 Cell editing with formula support
- ➕ Basic mathematical operations between cells
- 🔄 Real-time formula recalculation
- ⌨️ Full keyboard navigation support (Arrow keys, Tab, Shift+Tab, Enter)
- 📋 Copy/paste functionality (Ctrl+C, Ctrl+V)
- ↩️ Undo/redo support (Ctrl+Z, Ctrl+Shift+Z)

## Supported Formulas

Start any formula with `=` to begin calculation mode. Examples:

### Basic Arithmetic

- `=A1 + B1` - Addition
- `=A1 - B1` - Subtraction
- `=A1 * B1` - Multiplication
- `=A1 / B1` - Division
- `=A1 ^ 2` - Exponentiation
- `=(A1 + B1) * C1` - Parentheses for operation order

### Math Functions

- `=sqrt(A1)` - Square root
- `=abs(A1)` - Absolute value
- `=round(A1)` - Round to nearest integer
- `=floor(A1)` - Round down
- `=ceil(A1)` - Round up

### Examples

```
=A1 + B1 * C1         // Basic arithmetic
=sqrt(A1 * 2)         // Function with arithmetic
=abs(A1 - B1)         // Function with cell reference
=round((A1 + B1) / 2) // Nested operations
```

### Error Handling

Formulas will show errors for:

- Circular references (e.g., A1 references B1 which references A1)
- Invalid formulas (syntax errors)
- Division by zero
- Empty cells in formulas are treated as 0 for calculation purposes.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Math.js for formula parsing
- Zustand for state management
- react-window for virtualization
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9.x or later

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Gr8z/cosmo-ai-sheets.git
   cd cosmo-ai-sheets
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility functions
├── store/              # Zustand store
├── types/              # TypeScript types
└── constants/          # Constants and interfaces
```

## Performance Features

### Virtualization

- Uses react-window's FixedSizeGrid for efficient cell rendering
- Only renders cells currently visible in the viewport
- Maintains smooth scrolling even with 100 million cells
- Optimized header synchronization with transform-based scrolling
- Minimal memory footprint with cell recycling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
