import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CatchContainer, ErrorContainer, FlexHeader, FlexList, ItemBox, Label, Link, Modal, Title } from "~/components";
import { getClient } from "~/models/client.server";
import { getNotes } from "~/models/note.sever";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { clientId } = params
  invariant(clientId, 'clientId not found')

  const client = await getClient({ id: clientId, userId })
  if (!client) {
    throw new Response('Client not found', { status: 404 })
  }
  const notes = await getNotes(client.id)
  return json({ client, notes })
}

export default function Client() {
  const { client, notes } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <FlexList pad={4}>
      <Label>Name</Label>
      <ItemBox>
        <FlexHeader>
          <Title>{client.name}</Title>
          <FlexList direction="row">
            <Link to="edit" isOutline kind="accent" isRounded><FontAwesomeIcon icon={faPencil} /></Link>
            <Link to="delete" kind="error" isRounded><FontAwesomeIcon icon={faTrash} /></Link>
          </FlexList>
        </FlexHeader>
      </ItemBox>
      <FlexHeader>
        <Label>Details</Label>
        <Link kind="accent" icon={faPencil} to="details">Edit details</Link>
      </FlexHeader>
      <ItemBox>
        <FlexList direction="row">
          <Label>Phone number</Label>
          <span>{client.phoneNumber ?? '--'}</span>
        </FlexList>
        <FlexList direction="row">
          <Label>Email</Label>
          <span>{client.email ?? '--'}</span>
        </FlexList>
      </ItemBox>

      <FlexHeader items="center">
        <Label>Notes</Label>
        <Link to="note" kind="primary" icon={faPlus}>New note</Link>
      </FlexHeader>
      {notes.map(note => (
        <ItemBox key={note.id}>
          <FlexHeader>
            <span>{(new Date(note.createdAt).toDateString())}</span>
            <FlexList direction="row">
              <Link kind="accent" isOutline isRounded to={`note/${note.id}`}><FontAwesomeIcon icon={faPencil} /></Link>
              <Link kind="error" isRounded to={`note/delete/${note.id}`}><FontAwesomeIcon icon={faTrash} /></Link>
            </FlexList>
          </FlexHeader>
          <FlexList gap={2}>
            {note.body.split('\n').map((section, i) => (
              <p key={i}>{section}</p>
            ))}
          </FlexList>
        </ItemBox>
      ))}
      <Modal open={['note', 'delete', 'details', 'edit'].some(path => pathname.includes(path))} onClose={() => navigate('.')}>
        <Outlet />
      </Modal>
    </FlexList>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}