import { useEffect, useState } from "react"

export default function Signup() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {}, [])

  return loading ? <p>Loading...</p> : <section>Signup</section>
}
