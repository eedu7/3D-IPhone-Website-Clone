import './App.css'
import {Navbar} from "./components/Navbar.jsx";
import {Hero} from "./components/Hero.jsx";
import {HighLights} from "./components/HighLights.jsx";

function App() {

  return (
      <main className="bg-black">
        <Navbar />
        <Hero />
        <HighLights />
      </main>
  )
}

export default App;

