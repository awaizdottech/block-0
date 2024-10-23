import { useEffect, useState } from "react"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {}, [])

  return loading ? <p>Loading...</p> : <section>Home</section>
}
