import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  CatchContainer,
  ErrorContainer,
  ErrorMessage,
  FlexHeader,
  FlexList,
  Link,
  Navbar,
  SaveButtons,
  Title,
} from "~/components";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { createNote } from "~/models/note.sever";

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { clientId } = params;
  invariant(clientId, "clientId not found");

  const formData = await request.formData();
  const note = formData.get("note")?.toString();

  if (!note) {
    return json({ error: { note: "A valid note is required." } });
  }
  await createNote(note, clientId);
  return redirect(`/clients/${clientId}`);
}

export default function NewNote() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Navbar>
        <FlexHeader>
          <Title>New note</Title>
          <Link kind="ghost" isRounded to="..">
            <FontAwesomeIcon icon={faTimes} />
          </Link>
        </FlexHeader>
      </Navbar>
      <FlexList pad={4}>
        <textarea
          rows={6}
          className="textarea textarea-bordered"
          name="note"
          autoFocus
        />
        {actionData?.error.note ? (
          <ErrorMessage message={actionData.error.note} />
        ) : null}
      </FlexList>
      <SaveButtons saveLabel="Save note" />
    </Form>
  );
}

export function CatchBoundary() {
  return <CatchContainer />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />;
}
