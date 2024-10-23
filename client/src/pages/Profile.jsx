import { useEffect, useState } from "react"

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {}, [])

  return loading ? <p>Loading...</p> : <section>Profile</section>
}
