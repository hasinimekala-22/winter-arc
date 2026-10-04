import './App.css'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import {
  ensureTodayHistory
} from './services/historyIntegrity'
import Sidebar from './components/Sidebar'
import AppErrorBoundary
  from './components/AppErrorBoundary'
import Dashboard from './pages/Dashboard'
import Academics from './pages/Academics'
import Exams from './pages/Exams'
import Skills from './pages/Skills'
import Projects from './pages/Projects'
import Aptitude from './pages/Aptitude'
import AutoCAD from './pages/AutoCAD'
import Habits from './pages/Habits'
import Library from './pages/Library'
import Analytics from './pages/Analytics'
import Arc from './pages/Arc'
import CommandCenter from './pages/CommandCenter'

import {
  migrateOldData
} from './services/migrateData'


function App() {

  migrateOldData()

  ensureTodayHistory()

  return (

  <AppErrorBoundary>

    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <main className="main-content">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/academics"
              element={<Academics />}
            />

            <Route
              path="/exams"
              element={<Exams />}
            />

            <Route
              path="/skills"
              element={<Skills />}
            />

            <Route
              path="/projects"
              element={<Projects />}
            />

            <Route
              path="/aptitude"
              element={<Aptitude />}
            />

            <Route
              path="/autocad"
              element={<AutoCAD />}
            />

            <Route
              path="/habits"
              element={<Habits />}
            />

            <Route
              path="/library"
              element={<Library />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/arc"
              element={<Arc />}
            />

            <Route
              path="/command"
              element={<CommandCenter />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>

  </AppErrorBoundary>

)
}


export default App