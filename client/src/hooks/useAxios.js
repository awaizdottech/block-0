import axios from "axios"
import { useState, useEffect } from "react"
import { conf } from "../conf/conf"
// import axiosRetry from 'axios-retry';
// axiosRetry(axios, { retries: 3 });

const axiosInstance = axios.create({
  baseURL: conf.backendURL,
  headers: { "Content-Type": "application/json" }, // default for post requests without files i.e, simple objects
  // timeout: 15000,
})

export const useAxios = (url, method = "get", body = {}, overRides = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    let isMounted = true // track mounted state to avoid setting state after unmount

    let request
    if (method !== "get" && method !== "delete") {
      request = axiosInstance[method](url, body, overRides).then(response => {
        if (isMounted) {
          setData(response.data)
          setLoading(false)
        }
      })
    } else {
      request = axiosInstance[method](url).then(response => {
        if (isMounted) {
          setData(response.data)
          setLoading(false)
        }
      })
    }

    request.catch(err => {
      if (isMounted) {
        setError(err)
        setLoading(false)
      }
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
    })

    return () => {
      isMounted = false // cleanup on unmount
    }
  }, [])

  return { data, loading, error }
}

// state update > bidy, overrides, >use effect
