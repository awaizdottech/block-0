import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { superAxios } from "../helpers/superAxios"
import { useEffect, useState } from "react"

export default function EmailResponse() {
  const { token } = useParams()
  const navigate = useNavigate()
  if (!token) navigate("/error")

  const [response, setResponse] = useState({})
  const location = useLocation()
  const isVerifyEmailOrLoginViaEmail =
    location.pathname.includes("verify/") ||
    location.pathname.includes("login/")

  useEffect(() => {
    const callSuperAxios = async () => {
      setResponse(await superAxios("post", "/user/email-action", { token }))
    }

    if (isVerifyEmailOrLoginViaEmail) {
      callSuperAxios()
    }
  }, [])

  return (
    <section>
      EmailResponse {token}
      {isVerifyEmailOrLoginViaEmail && response ? (
        <Outlet context={response} />
      ) : !isVerifyEmailOrLoginViaEmail ? (
        <Outlet />
      ) : (
        <p>loading...{console.log("loading in email response")}</p>
      )}
    </section>
  )
}
