import { Header } from './components/layout/Header'
import { Button } from './components/ui/Button'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 text-white">
      <Header />
      <main className="flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to Fruitfly Finder!</h2>
          <p className="text-lg text-green-200 mb-8">
            Find all the hidden fruitflies before time runs out!
          </p>
        </div>

        {/* Tailwind test element */}
        <div className="bg-blue-500 hover:bg-blue-600 p-6 rounded-xl shadow-lg transition-colors">
          <p className="text-xl font-semibold">Tailwind CSS is working!</p>
        </div>

        <div className="flex gap-4">
          <Button>Start Game</Button>
          <Button variant="secondary">Settings</Button>
        </div>
      </main>
    </div>
  )
}

export default App
