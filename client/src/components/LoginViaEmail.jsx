import { useOutletContext } from "react-router-dom"

export default function LoginViaEmail() {
  const data = useOutletContext()
  console.log("data from LoginViaEmail", data)

  return (
    <section>
      login via email {console.log("loading finished from LoginViaEmail")}
    </section>
  )
}
