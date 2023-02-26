import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Breadcrumbs, FlexHeader, FlexList, ItemBox, Label, Link, Navbar, Title } from "~/components";
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

  return (
    <FlexList>
      <ItemBox>
        <FlexHeader>
          <Title>{client.name}</Title>
          <Link to="delete" kind="error" isOutline isCollapsing icon={faTrash}>Delete</Link>
        </FlexHeader>
      </ItemBox>
      <FlexList pad={4}>
        <Label>Details</Label>
        <ItemBox>
          <span>phone number</span>
          <span>email</span>
        </ItemBox>

        <FlexHeader items="center">
          <Label>Notes</Label>
          <Link to="." kind="secondary" isRounded>
            <FontAwesomeIcon icon={faPlus} />
          </Link>
        </FlexHeader>
        {notes.map(note => (
          <ItemBox key={note.id}>
            <span>{(new Date(note.createdAt).toDateString())}</span>
            <span>{note.body}</span>
          </ItemBox>
        ))}
      </FlexList>
    </FlexList>
  )
}