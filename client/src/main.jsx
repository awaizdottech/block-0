import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { Provider } from "react-redux"
import { store } from "./store/store.js"
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom"
import {
  AuthLayout,
  VerifyEmail,
  ResetPassword,
  LoginViaEmail,
  VerifyEmailUpdate,
} from "./components"
import {
  EmailResponse,
  Error404,
  Home,
  LandingPage,
  Login,
  Profile,
  Signup,
} from "./pages"

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    errorElement: <Error404 />,
    children: [
      { path: "", element: <LandingPage /> },
      {
        path: "u",
        element: (
          <AuthLayout authRequired>
            <Outlet />
          </AuthLayout>
        ),
        children: [
          { path: "", element: <Home /> },
          { path: "profile", element: <Profile /> },
        ],
      },
      {
        path: "login",
        element: (
          <AuthLayout authRequired={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "signup",
        element: (
          <AuthLayout authRequired={false}>
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: "email",
        element: <EmailResponse />,
        children: [
          { path: "verify/:token", element: <VerifyEmail /> },
          { path: "reset-password/:token", element: <ResetPassword /> },
          { path: "login/:token", element: <LoginViaEmail /> },
          {
            path: "verify-update/:token",
            element: <VerifyEmailUpdate />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
