import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, Route, Switch, useLocation } from 'wouter'
import { NavigatedProvider, PageHeading } from './PageHeading'
import { pages } from './routes'
import { supabase } from './supabase'

const Today = lazy(() => import('./pages/Today'))
const Account = lazy(() => import('./pages/Account'))

function NotFound() {
  return <section className="account-page" aria-labelledby="page-title">
    <PageHeading>Page not found</PageHeading>
    <p className="intro">There is no page at this address. <Link href="/">Go to Today</Link>.</p>
  </section>
}

function NavLinks({ numbered, onNavigate }: { numbered?: boolean; onNavigate?: () => void }) {
  const [location] = useLocation()
  return pages.map((page, index) => <Link
    key={page.path}
    href={page.path}
    aria-current={location === page.path ? 'page' : undefined}
    onClick={onNavigate}
  >{numbered ? <small>{String(index + 1).padStart(2, '0')}</small> : null}{page.label}</Link>)
}

// Signed-in layout: skip link, top bar with tabs (desktop) or MENU dialog (phones), and the routed page.
export function AppShell() {
  const [location] = useLocation()
  const [initialLocation] = useState(location)
  const [navigated, setNavigated] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { if (location !== initialLocation) setNavigated(true) }, [location, initialLocation])

  const signOut = () => void supabase?.auth.signOut()
  const closeMenu = () => dialogRef.current?.close()

  return <div className="page-shell">
    <a className="skip-link" href="#main">Skip to main content</a>
    <header className="shell-top">
      <Link className="shell-brand" href="/" aria-label="Cycle Pro home">CYCLE<span>PRO</span></Link>
      <nav className="shell-tabs" aria-label="Main"><NavLinks /></nav>
      <button className="shell-signout" onClick={signOut}>Sign out</button>
      <button className="shell-menu-button" aria-expanded={menuOpen} aria-controls="shell-menu" onClick={() => { dialogRef.current?.showModal(); setMenuOpen(true) }}>MENU</button>
    </header>
    <dialog id="shell-menu" className="shell-menu" ref={dialogRef} aria-label="Menu" onClose={() => setMenuOpen(false)}>
      <button className="shell-menu-close" onClick={closeMenu}>CLOSE</button>
      <nav aria-label="Menu"><NavLinks numbered onNavigate={closeMenu} /></nav>
      <button className="shell-menu-signout" onClick={signOut}>Sign out</button>
    </dialog>
    <main id="main" tabIndex={-1}>
      <NavigatedProvider value={navigated}>
        <Suspense fallback={<p role="status">Loading…</p>}>
          <Switch>
            <Route path="/" component={Today} />
            <Route path="/account" component={Account} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </NavigatedProvider>
    </main>
    <footer className="footer"><span>Made for the long ride.</span><span className="footer-mark">CYCLE PRO <span>·</span> ROAD CYCLING</span></footer>
  </div>
}
