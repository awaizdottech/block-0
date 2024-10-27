import { useOutletContext } from "react-router-dom"

export default function VerifyEmail() {
  const data = useOutletContext()
  console.log("data from verify email", data)

  return (
    <section>
      VerifyEmail {console.log("loading finished from verify email")}
      <p>
        U need to verify ur email within 2 days of registration to continue with
        the same account. If not ur registration details will be deleted for
        security purposes.
      </p>
      <p>
        Tip: U can re-register anytime if u want to hop back on the bandwagon
        later ;P
      </p>
      <p>
        features that require email can be done one at a time as links in the
        emails preceeding the latest one gets invalidated. In simple terms,
        generating multiple emails then trying to complete then trying to use
        them wont work. so, generate one email for one feature, complete that
        task then move on to the next feature if u wish
      </p>
    </section>
  )
}
