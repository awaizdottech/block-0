import { useEffect, useState } from "react"

export default function VerifyEmailUpdate() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { token } = useParams()

  useEffect(() => {}, [])

  return loading ? (
    <p>Loading...</p>
  ) : (
    <section>
      VerifyEmailUpdate
      <p>{token}</p>
    </section>
  )
}
