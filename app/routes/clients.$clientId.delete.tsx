import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Client } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
import { deleteClient } from "~/models/client.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireUserId(request);
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const { clientId } = params;
  invariant(clientId, "clientId not found");

  await deleteClient({ id: clientId, userId });
  return redirect("/clients");
}

export default function DeleteClient() {
  const { client } = useMatchesData("routes/clients.$clientId") as {
    client: Client;
  };
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Delete {client.name}</Title>
          <Link kind="ghost" isRounded to="..">
            <FontAwesomeIcon icon={faTimes} />
          </Link>
        </FlexHeader>
      </Navbar>
      <Form method="put">
        <FlexList pad={4}>
          <p>
            Are you sure you want to delete this client? This is a perminant
            action.
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
            {isSubmitting ? "Deleting..." : "Delete client"}
          </Button>
          <Link to="..">Cancel</Link>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
