

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Nomad Life
        </h1>
        <p className="text-xl text-center text-muted-foreground">
          Unified platform for Stays, Flights, Vehicles, and Drivers
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🏠 Stays</h2>
            <p className="text-muted-foreground">14-180 night stays with NomadScore</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">✈️ Flights</h2>
            <p className="text-muted-foreground">FlexHop flexible date searches</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🚗 Vehicles</h2>
            <p className="text-muted-foreground">P2P mid/long-term rentals</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🚕 Drivers</h2>
            <p className="text-muted-foreground">Save & re-book trusted drivers</p>
          </div>
        </div>
      </div>
    </main>
  )
}

