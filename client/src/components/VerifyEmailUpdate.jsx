import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import Input from "./Input"
import Button from "./Button"
import { useSelector } from "react-redux"
import { superAxios } from "../helpers/superAxios"

export default function VerifyEmailUpdate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { token } = useParams()
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const authStatus = useSelector(state => state.auth.status)
  let response

  const sendEmailAndToken = async data => {
    setLoading(true)

    try {
      response = await superAxios("post", "/user/email-action", {
        emailToken: token,
        authStatus,
        email: data.email,
      })
      console.log("response from verify emai update", response)

      if (response) {
        setLoading(false)
        navigate("/login")
      }
    } catch (error) {
      setLoading(false)
      setError(error)
    }
  }

  return (
    <section>
      Enter new email {console.log(error)}
      <p>{error?.response?.data?.message}</p>
      {loading && <p>Loading...</p>}
      <form onSubmit={handleSubmit(sendEmailAndToken)}>
        <Input
          type="email"
          label="Email:"
          placeholder="enter your email"
          className="rounded-lg text-black my-3"
          {...register("email", {
            required: true,
            validate: {
              matchPattern: value =>
                /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/gim.test(value) ||
                "email address must be a valid address",
            },
          })}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Sign in"}
        </Button>
      </form>
    </section>
  )
}
