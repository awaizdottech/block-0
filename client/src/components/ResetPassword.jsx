import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Input from "./Input"
import Button from "./Button"
import { useForm } from "react-hook-form"

export default function ResetPassword() {
  const { token } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showFirstPassword, setShowFirstPassword] = useState(false)
  const [showSecondPassword, setShowSecondPassword] = useState(false)
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  let response

  const sendPasswordAndToken = async data => {
    setLoading(true)

    if (data.firstPassword !== data.secondPassword) {
      setError("Passwords dont match")
      setLoading(false)
    } else {
      // response = useAxios("post", "/user/email-action", {
      //   token,
      //   password: data.firstPassword,
      // })
      // if (!response.loading) {
      //   if (response.error) setError(response.error)
      //   if (response.data) navigate("/login")
      //   setLoading(false)
      // }
    }
  }

  return (
    <section>
      ResetPassword {console.log(error)}
      <p>{error}</p>
      {loading && <p>Loading...</p>}
      <form onSubmit={handleSubmit(sendPasswordAndToken)}>
        <Input
          label="Password:"
          className="rounded-lg text-black my-3"
          type={showFirstPassword ? "text" : "password"}
          placeholder="enter your password: "
          {...register("firstPassword", {
            required: true,
          })}
        />
        <button
          type="button"
          onClick={() =>
            setShowFirstPassword(prevShowPassword => !prevShowPassword)
          }
          className="underline self-end">
          {showFirstPassword ? "Hide" : "Show"}
        </button>

        <Input
          label="Confirm Password:"
          className="rounded-lg text-black my-3"
          type={showSecondPassword ? "text" : "password"}
          placeholder="enter your password: "
          {...register("secondPassword", {
            required: true,
          })}
        />
        <button
          type="button"
          onClick={() =>
            setShowSecondPassword(prevShowPassword => !prevShowPassword)
          }
          className="underline self-end">
          {showSecondPassword ? "Hide" : "Show"}
        </button>

        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Sign in"}
        </Button>
      </form>
    </section>
  )
}
