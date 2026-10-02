import { AppDataProvider, useAppData } from './AppData'
import { AppShell } from './AppShell'
import { AuthScreen } from './AuthScreen'

function Root() {
  const { ready, session, recovery } = useAppData()
  if (!ready) return <main className="page-shell"><p role="status">Loading your account…</p></main>
  // Signed-out (or mid password recovery): the auth layout renders at whatever URL was opened.
  if (!session || recovery) return <AuthScreen />
  return <AppShell />
}

export default function App() {
  return <AppDataProvider><Root /></AppDataProvider>
}
