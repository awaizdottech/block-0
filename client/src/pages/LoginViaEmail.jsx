import { useEffect, useState } from "react"

export default function LoginViaEmail() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { token } = useParams()

  useEffect(() => {}, [])

  return loading ? (
    <p>Loading...</p>
  ) : (
    <section>
      LoginViaEmail
      <p>{token}</p>
    </section>
  )
}
