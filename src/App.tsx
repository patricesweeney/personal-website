import './App.css'

function App() {
  const year = new Date().getFullYear()
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">Your Name</div>
          <nav className="nav">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <h1>Data Scientist & PhD Candidate</h1>
        <p className="lead">Artificial Intelligence · Complex Systems</p>

        <section id="about" className="section">
          <h2 className="section-title">About</h2>
          <p>
            I am a data scientist and PhD candidate in computer science focusing on
            artificial intelligence and complex systems. I work across modeling,
            experimentation, and building tools that connect theory to practice.
          </p>
        </section>

        <section id="projects" className="section">
          <h2 className="section-title">Projects</h2>
          <div className="projects">
            <article className="project">
              <h3>Project Title</h3>
              <p className="muted">A short one-liner about what it does and why it matters.</p>
            </article>
            <article className="project">
              <h3>Another Project</h3>
              <p className="muted">Add your recent work, papers, tools, or datasets here.</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <div className="container muted">© {year} Your Name</div>
      </footer>
    </>
  )
}

export default App
