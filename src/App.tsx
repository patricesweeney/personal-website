import './App.css'
import { Link, Route, Routes } from 'react-router-dom'

function App() {
  const year = new Date().getFullYear()
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">Patrick Sweeney</div>
          <nav className="nav">
            <Link to="/">About</Link>
            <Link to="/projects">Projects</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section id="about" className="section">
                  <h2 className="section-title">About</h2>
                  <div className="grid grid-12">
                    <div className="span-12">
                      <p>
                        I work at the intersection of research and industry, applying complex-systems reasoning to real-world decision architectures.
                      </p>
                      <p>
                        My academic focus examines how multi-agent intelligence and adaptive systems shape collective behaviour.
                      </p>
                      <p>
                        My industry practice translates those principles into data-driven growth strategies across product, pricing, and go-to-market domains.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="industry" className="section">
                  <h2 className="section-title">Industry</h2>
                  <div className="grid grid-12">
                    <div className="span-12">
                      <p className="meta">Data Scientist – Growth and Commercial Strategy</p>
                      <p>
                        I build analytical frameworks that link product evolution, market dynamics, and customer behaviour.
                      </p>
                      <p>
                        My work integrates statistical modelling, experimentation, and causal inference to optimize pricing, marketing, and sales systems.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="research" className="section">
                  <h2 className="section-title">Research</h2>
                  <div className="grid grid-12">
                    <div className="span-12">
                      <p className="meta">Doctoral Candidate, Computer Science</p>
                      <p className="meta">University of Sydney – Centre for Complex Systems</p>
                      <p>
                        Research focus: artificial intelligence, complex systems, and multi-agent coordination.
                      </p>
                      <p>
                        I study emergent patterns in distributed decision systems, exploring how local intelligence yields global order.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="contact" className="section">
                  <h2 className="section-title">Contact / Links</h2>
                  <p>
                    <a href="/">Email</a> · <a href="/">LinkedIn</a> · <a href="/">Google Scholar</a> · <a href="/">GitHub</a>
                  </p>
                </section>
              </>
            }
          />
          <Route
            path="/projects"
            element={
              <>
                <section className="section">
                  <h2 className="section-title">Projects</h2>
                  <p className="muted">Project list coming soon.</p>
                </section>
              </>
            }
          />
        </Routes>
      </main>

      <footer>
        <div className="container muted">© {year} Patrick Sweeney</div>
      </footer>
    </>
  )
}

export default App
