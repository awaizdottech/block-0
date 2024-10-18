import { useParams } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  return (
    <section>
      VerifyEmail
      <p>
        U need to verify ur email within 2 days of registration to continue with
        the same account. If not ur registration details will be deleted for
        security purposes.
      </p>
      <p>
        Tip: U can re-register anytime if u want to hop back on the bandwagon
        later ;P
      </p>
      {token}
    </section>
  );
}
