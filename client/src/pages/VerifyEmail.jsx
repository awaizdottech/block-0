import { useNavigate, useParams } from "react-router-dom"
import { useEffect } from "react"
import { useAxios } from "../hooks/useAxios"

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useAxios(`/user/verify-email/${token}`)

  useEffect(() => {
    if (!token) {
      navigate("/error")
      return
    }

    if (!loading && !error && data) console.log("data", data)
  }, [token, data, loading, error])

  if (error) return <div>Error: {error.message}</div>

  return loading ? (
    <p>Sorry, something unexpected went wrong...</p>
  ) : (
    <section>
      VerifyEmail
      <p>
        U need to verify ur email within 2 days of registration to continue with
        the same account. If not ur registration details will be deleted for
        security purposes.
      </p>
      <p>
        Tip: U can re-register anytime if u want to hop back on the bandwagon
        later ;P
      </p>
      {token}
    </section>
  )
}
