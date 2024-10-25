import { useOutletContext } from "react-router-dom"

export default function LoginViaEmail() {
  const { data, loading, error } = useOutletContext()
  console.log("data from LoginViaEmail", data)

  if (error) return <div>Error: {error.message}</div>

  return loading ? (
    <p>
      Sorry, something unexpected went wrong...
      {console.log("loading from LoginViaEmail")}
    </p>
  ) : (
    <section>
      VerifyEmail {console.log("loading finished from LoginViaEmail")}
    </section>
  )
}
