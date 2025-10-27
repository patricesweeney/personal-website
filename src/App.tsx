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
                        I work at the intersection of computer science and economics, based out of Sydney, Australia.
                      </p>
                      <p>
                        In industry, I’m a data scientist helping early-stage SaaS companies grow revenue.
                      </p>
                      <p>
                        My academic research centers on Bayesian reinforcement learning and algorithmic game theory—how agents learn, adapt, and make decisions in complex environments.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="industry" className="section">
                  <h2 className="section-title">Industry</h2>
                  <div className="grid grid-12">
                    <div className="span-12">
                      <p className="meta">Dovetail — Data Scientist, Growth</p>
                      <p>
                        Work with product, sales, and marketing to help the company win and keep more customers.
                      </p>
                      <p className="meta">Simon-Kucher &amp; Partners — Consultant</p>
                      <p>
                        Advised tech firms on how to build, price, and sell their products for sustainable growth.
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
                      
                    </div>
                  </div>
                </section>

                <section id="contact" className="section">
                  <h2 className="section-title">Contact</h2>
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
