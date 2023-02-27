import { faDownload, faEdit, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Button, Divider, FlexHeader, FlexList, ItemBox, Label, Link, Modal } from "~/components";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function User() {
  const { user } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()


  return (
    <FlexList pad={4}>
      <FlexList gap={2}>
        <Label>Theme</Label>
        <select name="theme" className="select select-bordered w-full" data-choose-theme>
          <option value="">Default</option>
          <option value="cupcake">Light</option>
          <option value="halloween">Dark</option>
        </select>
      </FlexList>

      <FlexList gap={2}>
        <FlexHeader>
          <Label>User Details</Label>
          <Link to="edit" isRounded isOutline><FontAwesomeIcon icon={faEdit} /></Link>
        </FlexHeader>
        <ItemBox>
          <FlexList gap={2}>
            <Label>Name</Label>
            <span>{user.name}</span>
          </FlexList>

          <FlexList gap={2}>
            <Label>Email</Label>
            <span>{user.email}</span>
          </FlexList>
        </ItemBox>
      </FlexList>

      <Divider />

      <FlexList gap={2}>
        <FlexHeader>
          <Label>Security</Label>
          <Link to="password" isRounded isOutline><FontAwesomeIcon icon={faEdit} /></Link>
        </FlexHeader>
        <ItemBox>
          <FlexList gap={2}>
            <Label>Password</Label>
            <span>********</span>
          </FlexList>
        </ItemBox>
      </FlexList>

      <Divider />

      <FlexList gap={2}>
        <Label>Backup your clients</Label>
        <ItemBox>
          <FlexList gap={2}>
            <p>You can backup your clients at any time by downloading them and saving them to your machine. Click the button below to download your client list as a csv file.</p>
            <Button icon={faDownload} isOutline>Download CSV</Button>
          </FlexList>
        </ItemBox>
      </FlexList>

      <Divider />

      <Form action="/logout" method="post">
        <FlexList>
          <Button size="md" type="submit" icon={faSignOut}>Sign out</Button>
        </FlexList>
      </Form>

      <Divider />

      <FlexList gap={2}>
        <Label isDanger>Danger zone</Label>
        <ItemBox>
          <FlexList gap={2}>
            <Label>Delete your account</Label>
            <span>Deleting your account is a perminant action and cannot be undone.</span>
            <Link to="delete" kind="error">Delete account</Link>
          </FlexList>
        </ItemBox>
      </FlexList>
      <Modal open={['delete', 'password', 'edit'].some(path => pathname.includes(path))} onClose={() => navigate('.')}>
        <Outlet />
      </Modal>
    </FlexList>
  )
}