import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useNavigation } from "@remix-run/react";
import type {
  ActionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
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
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { deleteClient } from "~/models/client.server";
import { useMatchesData } from "~/utils";
import type { Client } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireUserId(request);
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const { clientId } = params;
  invariant(clientId, "clientId not found");

  await deleteClient({ id: clientId, userId });
  return redirect("/clients");
}

export default function DeleteClient() {
  const { client } = useMatchesData(
    "routes/clients/$clientId",
  ) as SerializeFrom<{ client: Client }>;
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Delete {client.name}</Title>
          <Link kind="ghost" isRounded to="details">
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

export function CatchBoundary() {
  return <CatchContainer />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />;
}
