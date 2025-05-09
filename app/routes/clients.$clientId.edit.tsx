import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Client } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
  Field,
  FlexHeader,
  FlexList,
  Input,
  Link,
  Navbar,
  SaveButtons,
  Title,
} from "~/components";
import { updateClient } from "~/models/client.server";
import { requireUserId } from "~/session.server";
import { useMatchesData } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireUserId(request);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { clientId } = params;
  invariant(clientId, "clientId not found");

  const formData = await request.formData();
  const name = formData.get("name")?.toString();

  if (!name) {
    return json({ errors: { name: "Name is required" } });
  }
  await updateClient(clientId, { name });
  return redirect(`/clients/${clientId}`);
}

export default function EditName() {
  const { client } = useMatchesData("routes/clients.$clientId") as {
    client: Client;
  };
  const actionData = useActionData<typeof action>();
  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Edit client name</Title>
          <Link kind="ghost" isRounded to="..">
            <FontAwesomeIcon icon={faTimes} />
          </Link>
        </FlexHeader>
      </Navbar>
      <Form method="put">
        <FlexList pad={4}>
          <Field name="name" label="Name" isRequired>
            <Input
              name="name"
              placeholder={client.name}
              defaultValue={client.name}
            />
            {actionData?.errors.name ? (
              <ErrorMessage message={actionData.errors.name} />
            ) : null}
          </Field>
        </FlexList>
        <SaveButtons saveLabel="Update name" />
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
