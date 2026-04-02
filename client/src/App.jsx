import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar.jsx'
import SearchPage from './pages/SearchPage.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import DocumentDetail from './pages/DocumentDetail.jsx'

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f7f7f3;
    min-height: 100vh;
  }

  .app-main {
    max-width: 780px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }
`

function App() {
  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/"            element={<SearchPage />} />
          <Route path="/documents"   element={<DocumentsPage />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
        </Routes>
      </main>
    </>
  )
}

export default App