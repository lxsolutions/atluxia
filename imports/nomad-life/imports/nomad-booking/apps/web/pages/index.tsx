



import { useState } from 'react'

export default function Home() {
  const [data, setData] = useState(null)

  async function fetchData() {
    const res = await fetch('/api/hello')
    const result = await res.json()
    setData(result)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Nomad Booking</h1>
      <button
        onClick={fetchData}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test API
      </button>
      {data && (
        <div className="mt-8 p-4 bg-white shadow-md rounded">
          <h2>API Response:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}


