import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  Button,
  CatchContainer,
  ErrorContainer,
  FlexHeader,
  FlexList,
  Link,
  Navbar,
  Title,
} from "~/components";
import { deleteNote } from "~/models/note.sever";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { noteId, clientId } = params;
  invariant(noteId, "noteId not found");
  invariant(clientId, "clientId not found");

  await deleteNote(noteId);
  return redirect(`/clients/${clientId}`);
}

export default function NewNote() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <Form method="post">
      <Navbar>
        <FlexHeader>
          <Title>Delete note?</Title>
          <Link kind="ghost" isRounded to="..">
            <FontAwesomeIcon icon={faTimes} />
          </Link>
        </FlexHeader>
      </Navbar>
      <FlexList pad={4}>
        <p>
          Are you sure you want to delete this note? You cannot get it back once
          its deleted.
        </p>
      </FlexList>
      <div className="bg-base-100 shadow-2xl flex flex-col p-4 gap-2 w-full sm:flex-row-reverse xl:rounded-md">
        <Button
          size="md"
          type="submit"
          kind="error"
          icon={faTrash}
          isSaving={isSubmitting}
        >
          {isSubmitting ? "Deleting..." : "Delete note"}
        </Button>
        <Link to="..">Cancel</Link>
      </div>
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
