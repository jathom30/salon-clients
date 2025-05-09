import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

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
import { createNote } from "~/models/note.sever";
import { requireUserId } from "~/session.server";

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
        <textarea rows={6} className="textarea textarea-bordered" name="note" />
        {actionData?.error.note ? (
          <ErrorMessage message={actionData.error.note} />
        ) : null}
      </FlexList>
      <SaveButtons saveLabel="Save note" />
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
