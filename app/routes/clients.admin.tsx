import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { FlexList, ItemBox } from "~/components";
import { getUsers } from "~/models/admin.server";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  if (user.email !== "jathom30@gmail.com") {
    return redirect("/clients");
  }

  const users = await getUsers();

  return json({ users });
}

export default function Admin() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <>
      <FlexList pad={4} gap={2}>
        <h1 className="text-2xl">Admin</h1>
        <FlexList gap={2}>
          {users.map((user) => (
            <ItemBox key={user.id}>
              <p>
                {user.name} - {user.email} - {user.client.length} clients
              </p>
            </ItemBox>
          ))}
        </FlexList>
      </FlexList>
    </>
  );
}
