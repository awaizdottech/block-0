import { useParams } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  return <section>VerifyEmail {token}</section>;
}
