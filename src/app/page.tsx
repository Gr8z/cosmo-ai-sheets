'use client'

import dynamic from 'next/dynamic'

// Dynamically import the Grid component to avoid SSR issues with window/document
const Grid = dynamic(() => import('@/components/Grid/Grid'), {
  ssr: false,
  loading: () => (
    <div className='w-screen h-screen flex items-center justify-center'>
      <div className='text-lg'>Loading spreadsheet...</div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className='w-screen h-screen overflow-hidden'>
      <Grid />
    </main>
  )
}
