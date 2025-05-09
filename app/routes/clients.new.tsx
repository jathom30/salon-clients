import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";

import {
  ErrorMessage,
  Field,
  FlexList,
  Input,
  SaveButtons,
} from "~/components";
import { createClient } from "~/models/client.server";
import { createNote } from "~/models/note.sever";
import { requireUserId } from "~/session.server";
import { validateEmail } from "~/utils";
import { getFields } from "~/utils/form";
import { maskingFuncs } from "~/utils/maskingFuncs";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const { fields, errors } = getFields<{
    name: string;
    phoneNumber?: string;
    email?: string;
    note: string;
  }>(formData, [
    { name: "name", type: "string", isRequired: true },
    { name: "phoneNumber", type: "string", isRequired: false },
    { name: "email", type: "string", isRequired: false },
    { name: "note", type: "string", isRequired: true },
  ]);

  if (Object.keys(errors).length) {
    return json({ errors });
  }

  if (fields.phoneNumber && (fields.phoneNumber?.length || 0) < 12) {
    return json({
      errors: {
        phoneNumber: "Invalid phone number",
        email: null,
        name: null,
        note: null,
      },
    });
  }

  if (fields.email && !validateEmail(fields.email)) {
    return json({
      errors: {
        phoneNumber: null,
        email: "Invaid email",
        name: null,
        note: null,
      },
    });
  }

  const client = await createClient({
    name: fields.name,
    phoneNumber: fields.phoneNumber || null,
    email: fields.email || null,
    userId,
  });
  await createNote(fields.note, client.id);
  return redirect(`/clients/${client.id}`);
}

export default function NewClient() {
  const actionData = useActionData<typeof action>();
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <Form method="post">
      <FlexList pad={4}>
        <Field name="name" label="Client name" isRequired>
          <Input name="name" />
          {actionData?.errors.name ? (
            <ErrorMessage message={actionData.errors.name} />
          ) : null}
        </Field>
        <Field name="phoneNumber" label="Phone number">
          <Input
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(maskingFuncs["phone-number"](e.target.value))
            }
          />
          {actionData?.errors.phoneNumber ? (
            <ErrorMessage message={actionData.errors.phoneNumber} />
          ) : null}
        </Field>
        <Field name="email" label="Email">
          <Input name="email" />
          {actionData?.errors.email ? (
            <ErrorMessage message={actionData.errors.email} />
          ) : null}
        </Field>
        <Field name="note" label="Note" isRequired>
          <textarea name="note" className="textarea w-full" rows={5} />
          {actionData?.errors.note ? (
            <ErrorMessage message={actionData.errors.note} />
          ) : null}
        </Field>
      </FlexList>
      <SaveButtons saveLabel="Save" />
    </Form>
  );
}
