
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import Spline from '@splinetool/react-spline';
import { Suspense } from "react";
import { Chair } from "~/assets";
import { FlexList, Link } from "~/components";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  // redirect user if logged in
  if (userId) {
    return redirect("/clients")
  }
  return null
}

export default function Index() {
  return (
    <main className="h-full flex items-center justify-center flex-col gap-4 overflow-hidden">
      <div className="w-full h-full max-w-xs max-h-96 relative">
        <Suspense fallback={<Chair />}>
          <Spline scene="https://prod.spline.design/w8qwq3kvieiBwXxA/scene.splinecode" />
        </Suspense>
      </div>
      <h1 className="text-5xl font-bold text-primary">Salon Clients</h1>
      <FlexList direction="row">
        <Link size="md" to="login" isOutline>Login</Link>
        <Link size="md" to="join" kind="primary">Signup</Link>
      </FlexList>
    </main>
  );
}
