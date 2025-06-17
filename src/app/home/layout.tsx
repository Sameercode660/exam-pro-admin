import React from 'react'
import Home from '@/components/Home';

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <Home children={children}></Home>
    </div>
  )
}

export default layout
