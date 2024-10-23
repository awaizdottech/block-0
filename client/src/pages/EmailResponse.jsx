import { Outlet, useLocation, useParams } from "react-router-dom"

export default function EmailResponse() {
  const { token } = useParams()
  const location = useLocation()
  console.log(location)

  return (
    <section>
      EmailResponse {token}
      <Outlet />
    </section>
  )
}
