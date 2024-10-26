import axios from "axios"
import { conf } from "../conf/conf"
import axiosRetry from "axios-retry"

const axiosInstance = axios.create({
  baseURL: conf.backendURL,
  headers: { "Content-Type": "application/json" }, // default for post requests without files i.e, simple objects
  timeout: 15000,
})

axiosRetry(axiosInstance, { retries: 2 })

export const superAxios = async (
  method = "get",
  url,
  body = {},
  overRides = {}
) => {
  console.log("axios called")

  try {
    if (method !== "get" && method !== "delete")
      return await axiosInstance[method](url, body, overRides, {
        withCredentials: true,
      })
    else return await axiosInstance[method](url, { withCredentials: true })
  } catch (err) {
    if (err.code === "ECONNABORTED")
      console.error("Request timeout:", err.message)

    if (err.response)
      console.error("Server responded with a status:", err.response.status)
    else if (err.request)
      console.error(
        "Request was made but no response was received:",
        err.request
      )
    else
      console.error(
        "Something happened in setting up the request:",
        err.message
      )
    throw err
  }
}
