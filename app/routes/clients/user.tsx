import { faDownload, faEdit, faSignOut, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Button, Divider, FlexHeader, FlexList, ItemBox, Label, Link, MobileModal } from "~/components";
import { getClientsAndNotes } from "~/models/client.server";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  const clients = await getClientsAndNotes(user.id)
  const jsonClients = JSON.stringify(clients)
  return json({ user, jsonClients })
}


export default function User() {
  const { user, jsonClients } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonClients)
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `${user.name}-clients.json`)
    document.body.appendChild(link)
    link.click()
  }

  return (
    <FlexList pad={4}>
      <FlexList gap={2}>
        <Label>Theme</Label>
        <select name="theme" className="select select-bordered w-full" data-choose-theme>
          <option value="cupcake">Light</option>
          <option value="dracula">Dark</option>
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
        <FlexHeader>
          <Label>Backup your clients</Label>
          <Link to="upload" isOutline icon={faUpload}>Upload</Link>
        </FlexHeader>
        <ItemBox>
          <FlexList gap={2}>
            <p>You can backup your clients at any time by downloading them and saving them to your machine. Click the button below to download your client list as a json file.</p>
            <Button onClick={handleDownload} icon={faDownload} isOutline>Download JSON</Button>
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
      <MobileModal open={['delete', 'password', 'edit', 'upload'].some(path => pathname.includes(path))} onClose={() => navigate('.')}>
        <Outlet />
      </MobileModal>
    </FlexList>
  )
}