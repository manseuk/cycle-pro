import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

// True once the user has navigated away from the page they landed on. Route changes move focus to the
// page heading; the first page load does not, so the browser's own focus handling is left alone.
const NavigatedContext = createContext(false)

export function PageHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const navigated = useContext(NavigatedContext)
  useEffect(() => {
    document.title = `${children} — Cycle Pro`
    if (navigated) ref.current?.focus()
  }, [children, navigated])
  return <h1 id="page-title" ref={ref} tabIndex={-1}>{children}</h1>
}

export function NavigatedProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <NavigatedContext.Provider value={value}>{children}</NavigatedContext.Provider>
}
