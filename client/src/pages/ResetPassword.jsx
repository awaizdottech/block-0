import { useEffect, useState } from "react"

export default function ResetPassword() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { token } = useParams()

  useEffect(() => {}, [])

  return loading ? (
    <p>Loading...</p>
  ) : (
    <section>
      ResetPassword
      <p>{token}</p>
    </section>
  )
}
