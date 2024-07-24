import {
  faCog,
  faPlus,
  faSignOut,
  faUser,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import {
  Outlet,
  Link as RemixLink,
  Form,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { Chair } from "~/assets";
import {
  Button,
  FlexHeader,
  FlexList,
  Link,
  Loader,
  MaxWidth,
  MobileModal,
  Navbar,
  Title,
} from "~/components";
import { requireUser } from "~/session.server";
import { useSpinDelay } from "spin-delay";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  return json({ user });
}

export default function Clients() {
  const { user } = useLoaderData<typeof loader>();
  const [showMenu, setShowMenu] = useState(false);
  const navigation = useNavigation();
  const isLoading = useSpinDelay(navigation.state !== "idle");

  return (
    <main className="mt-16 h-full">
      <div className="fixed inset-x-0 top-0 z-20">
        <Navbar>
          <FlexHeader>
            <RemixLink to=".">
              <FlexList direction="row" items="center" gap={2}>
                <div className="h-full w-8">
                  {isLoading ? (
                    <FlexList items="center" justify="center" grow>
                      <Loader />
                    </FlexList>
                  ) : (
                    <Chair />
                  )}
                </div>
                <Title>{user.name}'s Clients</Title>
              </FlexList>
            </RemixLink>
            <FlexList direction="row" items="center">
              {user.email === "jathom30@gmail.com" ? (
                <Link to="admin" kind="secondary" icon={faUserTie} isCollapsing>
                  Admin
                </Link>
              ) : null}
              <Link to="new" kind="primary" icon={faPlus} isCollapsing>
                New client
              </Link>
              <Button
                onClick={() => setShowMenu(true)}
                size="md"
                isCollapsing
                icon={faUser}
                kind="ghost"
              >
                User
              </Button>
            </FlexList>
          </FlexHeader>
        </Navbar>
      </div>
      <MaxWidth>
        <Outlet />
      </MaxWidth>
      <MobileModal open={showMenu} onClose={() => setShowMenu(false)}>
        <FlexList pad={4}>
          <Link
            to="user"
            icon={faCog}
            onClick={() => setShowMenu(false)}
            isOutline
            size="md"
          >
            User settings
          </Link>
          <Form method="post" action="/logout">
            <FlexList>
              <Button type="submit" icon={faSignOut}>
                Log out
              </Button>
            </FlexList>
          </Form>
        </FlexList>
      </MobileModal>
    </main>
  );
}
