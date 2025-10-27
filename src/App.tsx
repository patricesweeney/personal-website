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
                    <a href="mailto:patricksweeney018@gmail.com">Email</a>
                    ·
                    <a href="https://www.linkedin.com/in/patrickfsweeney" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    ·
                    <a href="https://scholar.google.com/citations?user=Ex-3lBEAAAAJ&hl=en&oi=ao" target="_blank" rel="noopener noreferrer">Google Scholar</a>
                    ·
                    <a href="https://github.com/patricesweeney" target="_blank" rel="noopener noreferrer">GitHub</a>
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
                <div className="grid grid-12">
                  <div className="span-12">
                    <p className="meta">Bayesian Truth Serum</p>
                    <p className="muted">
                      <a href="https://bayesiantruthserum.com" target="_blank" rel="noopener noreferrer">bayesiantruthserum.com</a>
                    </p>
                    <p>
                      Bayesian Truth Serum is a method for eliciting honest answers to subjective questions by rewarding responses that are both uncommon and surprisingly well-predicted by others. It leverages Bayesian inference to identify answers that reflect genuine private beliefs rather than conformity or guessing.
                    </p>
                    <p>
                      Based on Dražen Prelec’s paper
                      {' '}
                      <a href="https://www.science.org/doi/10.1126/science.1095722" target="_blank" rel="noopener noreferrer">A Bayesian Truth Serum for Subjective Data</a>.
                      {' '}Implemented as an open source project.
                    </p>
                  </div>
                </div>
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
