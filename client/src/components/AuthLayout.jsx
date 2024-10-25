import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function AuthLayout({ children, authRequired = true }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  // const authStatus = useSelector((state) => state.auth.status);
  const authStatus = true //temp

  useEffect(() => {
    if (authRequired && authStatus !== authRequired) {
      // auth isnt done when required
      navigate("/login")
    } else if (!authRequired && authStatus !== authRequired) {
      // auth is done when not required (means user landed on login or signup page)
      navigate("/u")
    }
    setLoading(false)
  }, [authStatus, navigate, authRequired])
  return loading ? <p>Loading...</p> : <>{children}</>
}
