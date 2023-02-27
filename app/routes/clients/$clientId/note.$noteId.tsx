import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CatchContainer, ErrorContainer, ErrorMessage, FlexHeader, FlexList, Link, Navbar, SaveButtons, Title } from "~/components";
import { getNote, updateNote } from "~/models/note.sever";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { noteId } = params
  invariant(noteId, "noteId not found")

  const note = await getNote(noteId)
  if (!note) {
    throw new Response("Note not found", { status: 404 })
  }
  return json({ note })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { clientId, noteId } = params
  invariant(clientId, 'clientId not found')
  invariant(noteId, 'noteId not found')

  const formData = await request.formData()
  const note = formData.get('note')?.toString()

  if (!note) {
    return json({ error: { note: 'A valid note is required.' } })
  }
  await updateNote(note, noteId)
  return redirect(`/clients/${clientId}`)
}

export default function Note() {
  const { note } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <Form method="post">
      <Navbar>
        <FlexHeader>
          <Title>Edit note</Title>
          <Link kind="ghost" isRounded to=".."><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <FlexList pad={4}>
        <textarea defaultValue={note.body} rows={6} className="textarea textarea-bordered" name="note" />
        {actionData?.error.note ? <ErrorMessage message={actionData.error.note} /> : null}
      </FlexList>
      <SaveButtons saveLabel="Save note" />
    </Form>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}