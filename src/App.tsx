import { LangProvider } from './lib/i18n'
import { ThemeProvider } from './lib/theme'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Services from './components/Services'
import Work from './components/Work'
import About from './components/About'
import Contact from './components/Contact'
import Places from './components/Places'
import Footer from './components/Footer'

export default function App() {
  return (
    <ThemeProvider>
    <LangProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="page">
        <Nav />
        <Hero />
        <main id="main">
          <Services />
          <Work />
          <About />
          <Places />
          <Contact />
        </main>
      </div>
      <Footer />
    </LangProvider>
    </ThemeProvider>
  )
}
