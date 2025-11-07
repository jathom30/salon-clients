import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  Link as RemixLink,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  CatchContainer,
  ErrorContainer,
  FlexHeader,
  FlexList,
  ItemBox,
  Label,
  Link,
  MobileModal,
  Title,
} from "~/components";
import { getClient } from "~/models/client.server";
import { getNotes } from "~/models/note.sever";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { clientId } = params;
  invariant(clientId, "clientId not found");

  const client = await getClient({ id: clientId, userId });
  if (!client) {
    throw new Response("Client not found", { status: 404 });
  }
  const notes = await getNotes(client.id);
  return { client, notes };
}

const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Client() {
  const { client, notes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <FlexList pad={4}>
      <ItemBox>
        <FlexHeader>
          <Title>{client.name}</Title>
          <FlexList direction="row">
            <Link to="edit" isOutline isRounded>
              <FontAwesomeIcon icon={faPencil} />
            </Link>
            <Link to="delete" kind="error" isRounded>
              <FontAwesomeIcon icon={faTrash} />
            </Link>
          </FlexList>
        </FlexHeader>
      </ItemBox>
      <ItemBox>
        <FlexHeader>
          <h5 className="text-sm  font-bold uppercase">Contact Details</h5>
          <Link isOutline icon={faPencil} to="details">
            Edit details
          </Link>
        </FlexHeader>
        <FlexList direction="row">
          <Label>Phone number</Label>
          <span>{client.phoneNumber ?? "--"}</span>
        </FlexList>
        <FlexList direction="row">
          <Label>Email</Label>
          <span>{client.email ?? "--"}</span>
        </FlexList>
      </ItemBox>

      <FlexHeader items="center">
        <h5 className="text-sm font-bold uppercase">Notes</h5>
        <div className="flex gap-2">
          <Link to="note/new" kind="primary" icon={faPlus}>
            New note
          </Link>
        </div>
      </FlexHeader>
      {notes.map((note) => (
        <ItemBox key={note.id}>
          <div className="border-b border-b-gray-300 pb-2 mb-2">
            <FlexHeader>
              <div className="flex flex-col gap-1 text-xs text-base-content">
                <span>Created: {formatDate(note.createdAt)}</span>
                {formatDate(note.createdAt) !== formatDate(note.updatedAt) ? (
                  <span>Updated: {formatDate(note.updatedAt)}</span>
                ) : null}
              </div>
              <FlexList direction="row">
                <Link isOutline isRounded to={`note/${note.id}`}>
                  <FontAwesomeIcon icon={faPencil} />
                </Link>
                {notes.length > 1 ? (
                  <Link
                    kind="error"
                    isOutline
                    isRounded
                    to={`note/delete/${note.id}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Link>
                ) : null}
              </FlexList>
            </FlexHeader>
          </div>
          <RemixLink
            to={`note/${note.id}`}
            className="rounded outline-secondary outline-offset-4 hover:outline"
          >
            <FlexList gap={2}>
              {note.body.split("\n").map((section, i) => (
                <p key={i}>{section}</p>
              ))}
            </FlexList>
          </RemixLink>
        </ItemBox>
      ))}
      <MobileModal
        open={["note", "delete", "details", "edit"].some((path) =>
          pathname.includes(path),
        )}
        onClose={() => navigate(".")}
      >
        <Outlet />
      </MobileModal>
    </FlexList>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
