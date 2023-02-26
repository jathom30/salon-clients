import { faPlus, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { Outlet, Link as RemixLink, Form } from "@remix-run/react";
import { Button, FlexHeader, FlexList, Link, MaxWidth, Navbar, Title } from "~/components";

export default function Clients() {
  return (
    <main className="mt-16 h-full">
      <div className="fixed top-0 inset-x-0 z-20">
        <Navbar>
          <FlexHeader>
            <RemixLink to=".">
              <Title>Clients</Title>
            </RemixLink>
            <FlexList direction="row" items="center">
              <Link to="new" kind="primary" icon={faPlus} isCollapsing>New client</Link>
              <Form method="post" action="/logout">
                <Button size="md" isCollapsing icon={faSignOut} kind="ghost">Logout</Button>
              </Form>
            </FlexList>
          </FlexHeader>
        </Navbar>
      </div>
      <MaxWidth>
        <Outlet />
      </MaxWidth>
    </main>
  )
}