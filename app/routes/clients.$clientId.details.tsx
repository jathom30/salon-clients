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
import { useState } from "react";
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
import { useMatchesData, validateEmail } from "~/utils";
import { getFields } from "~/utils/form";
import { maskingFuncs } from "~/utils/maskingFuncs";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireUserId(request);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { clientId } = params;
  invariant(clientId, "clientId not found");

  const formData = await request.formData();
  const { fields, errors } = getFields<{
    phoneNumber?: string;
    email?: string;
  }>(formData, [
    { name: "phoneNumber", type: "string", isRequired: false },
    { name: "email", type: "string", isRequired: false },
  ]);

  if (Object.keys(errors).length) {
    return json({ errors });
  }

  if (fields.phoneNumber && (fields.phoneNumber?.length || 0) < 12) {
    return json({
      errors: {
        phoneNumber: "Invalid phone number",
        email: null,
      },
    });
  }

  if (fields.email && !validateEmail(fields.email)) {
    return json({
      errors: {
        phoneNumber: null,
        email: "Invaid email",
      },
    });
  }

  await updateClient(clientId, fields);
  return redirect(`/clients/${clientId}`);
}

export default function EditDetails() {
  const { client } = useMatchesData("routes/clients.$clientId") as {
    client: Client;
  };
  const actionData = useActionData<typeof action>();
  const [phoneNumber, setPhoneNumber] = useState(client.phoneNumber || "");

  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Edit details</Title>
          <Link kind="ghost" isRounded to="..">
            <FontAwesomeIcon icon={faTimes} />
          </Link>
        </FlexHeader>
      </Navbar>
      <Form method="put">
        <FlexList pad={4}>
          <Field name="phoneNumber" label="Phone number">
            <Input
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(maskingFuncs["phone-number"](e.target.value))
              }
              placeholder="Client phone number..."
            />
            {actionData?.errors.phoneNumber ? (
              <ErrorMessage message={actionData.errors.phoneNumber} />
            ) : null}
          </Field>
          <Field name="email" label="Email">
            <Input
              name="email"
              defaultValue={client.email || undefined}
              placeholder="Client email..."
            />
            {actionData?.errors.email ? (
              <ErrorMessage message={actionData.errors.email} />
            ) : null}
          </Field>
        </FlexList>
        <SaveButtons saveLabel="Update details" />
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
