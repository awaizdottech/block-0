import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { superAxios } from "../helpers/superAxios"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"

export default function EmailResponse() {
  const { token } = useParams()
  const navigate = useNavigate()
  if (!token) navigate("/error")

  const [response, setResponse] = useState({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const authStatus = useSelector(state => state.auth.status)
  const location = useLocation()
  const isVerifyEmailOrLoginViaEmail =
    location.pathname.includes("verify/") ||
    location.pathname.includes("login/")

  useEffect(() => {
    const callSuperAxios = async () => {
      try {
        setResponse(
          await superAxios("post", "/user/email-action", {
            emailToken: token,
            authStatus,
          })
        )
        setLoading(false)
      } catch (error) {
        console.log(error.response.data.message)

        setError(error)
        setLoading(false)
      }
    }

    if (isVerifyEmailOrLoginViaEmail) callSuperAxios()
  }, [])

  return (
    <section>
      EmailResponse {token}
      <p>{error?.response?.data?.message}</p>
      {isVerifyEmailOrLoginViaEmail && !error && response ? (
        <Outlet context={response} />
      ) : !isVerifyEmailOrLoginViaEmail ? (
        <Outlet />
      ) : loading ? (
        <p>loading...{console.log("loading in email response")}</p>
      ) : (
        <p>Something went wrong...</p>
      )}
    </section>
  )
}
