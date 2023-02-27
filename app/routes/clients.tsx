import { faCog, faPlus, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { Outlet, Link as RemixLink, Form, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { Chair } from "~/assets";
import { Button, FlexHeader, FlexList, Link, MaxWidth, Modal, Navbar, Title } from "~/components";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function Clients() {
  const { user } = useLoaderData<typeof loader>()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <main className="mt-16 h-full">
      <div className="fixed top-0 inset-x-0 z-20">
        <Navbar>
          <FlexHeader>
            <RemixLink to=".">
              <FlexList direction="row" items="center" gap={2}>
                <div className="h-full w-8">
                  <Chair />
                </div>
                <Title>{user.name}'s Clients</Title>
              </FlexList>
            </RemixLink>
            <FlexList direction="row" items="center">
              <Link to="new" kind="primary" icon={faPlus} isCollapsing>New client</Link>
              <Button onClick={() => setShowMenu(true)} size="md" isCollapsing icon={faUser} kind="ghost">User</Button>
            </FlexList>
          </FlexHeader>
        </Navbar>
      </div>
      <MaxWidth>
        <Outlet />
      </MaxWidth>
      <Modal open={showMenu} onClose={() => setShowMenu(false)}>
        <FlexList pad={4}>
          <Link to="user" icon={faCog} onClick={() => setShowMenu(false)} isOutline size="md">User settings</Link>
          <Form method="post" action="/logout">
            <FlexList>
              <Button type="submit" icon={faSignOut}>Log out</Button>
            </FlexList>
          </Form>
        </FlexList>
      </Modal>
    </main>
  )
}