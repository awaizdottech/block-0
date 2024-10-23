import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAxios } from "../hooks/useAxios"

export default function VerifyEmail() {
  const [shouldRender, setShouldRender] = useState(false)
  const { token } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useAxios(`/user/verify-email/${token}`)

  useEffect(() => {
    if (!token) {
      navigate("/error")
      return
    }
    console.log("shouldRender", shouldRender)
    console.log("data", data)

    if (!loading && !error && data && !shouldRender) setShouldRender(true) // Set to true after data is successfully fetched
  }, [token, data, loading, error, shouldRender])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return !shouldRender ? (
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
