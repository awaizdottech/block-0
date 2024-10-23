import { useEffect, useState } from "react"

export default function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {}, [])

  return loading ? <p>Loading...</p> : <section>LandingPage</section>
}
