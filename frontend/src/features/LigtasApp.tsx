import { AppShell, type Tab } from '@/components/layout/AppShell'
import { useRoute } from '@/utils/router'
import { AlertProvider } from '@/context/AlertContext'
import { RecordsProvider } from '@/context/RecordsContext'
import { ToastProvider } from '@/context/ToastContext'
import { ChooseIncident } from '@/pages/Incidents/ChooseIncident'
import { DocumentGuide } from '@/pages/Documents/DocumentGuide'
import { DocumentScan } from '@/pages/Documents/DocumentScan'
import { Home } from '@/pages/Home/Home'
import { Hospitals } from '@/pages/Hospitals/Hospitals'
import { Hotspots } from '@/pages/Hotspots/Hotspots'
import { IncidentDetail } from '@/pages/Incidents/IncidentDetail'
import { IncidentForm } from '@/pages/Incidents/IncidentForm'
import { NotFound } from '@/pages/NotFound'
import { Records } from '@/pages/Records/Records'
import { VisitForm } from '@/pages/Tracker/VisitForm'

function resolve(path: string[], query: URLSearchParams): { screen: React.ReactNode; tab: Tab; nav: boolean } {
  const [a, b, c, d, e] = path
  if (!a) return { screen: <Home />, tab: 'home', nav: true }
  if (a === 'hospitals' && !b) return { screen: <Hospitals query={query} />, tab: 'hospitals', nav: true }
  if (a === 'hotspots' && !b) return { screen: <Hotspots />, tab: 'hotspots', nav: true }
  if (a === 'records' && !b) return { screen: <Records />, tab: 'records', nav: true }
  if (a === 'scan') {
    const incident = query.get('incident')
    return {
      screen: <DocumentScan incidentId={incident} visitId={query.get('visit')} initialType={query.get('type')} />,
      tab: incident ? 'records' : 'home',
      nav: false,
    }
  }
  if (a === 'visits' && b === 'new') return { screen: <ChooseIncident />, tab: 'records', nav: true }
  if (a === 'documents' && b) return { screen: <DocumentGuide documentId={b} />, tab: 'records', nav: true }
  if (a === 'incidents') {
    if (b === 'new') return { screen: <IncidentForm />, tab: 'records', nav: false }
    if (b && !c) return { screen: <IncidentDetail incidentId={b} />, tab: 'records', nav: true }
    if (b && c === 'edit' && !d) return { screen: <IncidentForm incidentId={b} />, tab: 'records', nav: false }
    if (b && c === 'visits' && d === 'new') return { screen: <VisitForm incidentId={b} />, tab: 'records', nav: false }
    if (b && c === 'visits' && d && e === 'edit')
      return { screen: <VisitForm incidentId={b} visitId={d} />, tab: 'records', nav: false }
  }
  return { screen: <NotFound />, tab: 'home', nav: true }
}

function Router() {
  const { path, query, key } = useRoute()
  const { screen, tab, nav } = resolve(path, query)
  return (
    <AppShell active={tab} showBottomNav={nav}>
      <div key={key}>{screen}</div>
    </AppShell>
  )
}

export default function LigtasApp() {
  return (
    <ToastProvider>
      <RecordsProvider>
        <AlertProvider>
          <Router />
        </AlertProvider>
      </RecordsProvider>
    </ToastProvider>
  )
}
