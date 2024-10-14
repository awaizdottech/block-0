import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input } from "../components";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const login = async (data) => {
    setError(""); //errors should be gone before submitting
    setLoading(true);
    try {
      const session = await authService.login(data);
      if (session) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          dispatch(authLogin({ userData }));
          appwriteService.getPosts().then((posts) => {
            if (posts) {
              dispatch(addPosts({ posts }));
            }
          });
        }
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col max-md:items-stretch items-center grow justify-center">
      <h2 className="text-4xl mb-5 londrina-shadow-regular">
        Log in to your account
      </h2>
      <p className="mb-5">
        Dont have an account?{" "}
        <Link to="/signup">
          <span className="underline">Sign up</span>
        </Link>
      </p>
      {error && <p className="mb-8">{error}</p>}
      <form
        onSubmit={handleSubmit(login)}
        className="bg-[#242629] flex flex-col rounded-xl p-16 max-md:px-6 max-md:mx-9"
      >
        <Input
          type="email"
          label="Email:"
          placeholder="enter your email"
          className="rounded-lg text-black my-3"
          {...register("email", {
            required: true,
            validate: {
              matchPattern: (value) =>
                /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/gim.test(value) ||
                "email address must be a valid address",
            },
          })}
        />
        <Input
          className="rounded-lg text-black my-3"
          label="Password:"
          type={showPassword ? "text" : "password"}
          placeholder="enter your password: "
          {...register("password", {
            required: true,
          })}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="underline self-end"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        <Button
          type="submit"
          className={`mt-6 ${loading ? "flex justify-center" : null}`}
          disabled={loading}
        >
          {loading ? <SmallLoadingSVG /> : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
