
import { Link } from "~/components";

export default function Index() {
  return (
    <main>
      <Link to="login">Login</Link>
      <Link to="join">Signup</Link>
    </main>
  );
}
