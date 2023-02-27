import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useActionData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { CatchContainer, ErrorContainer, ErrorMessage, Field, FlexHeader, FlexList, Input, Link, Navbar, SaveButtons, Title } from "~/components";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { getFields } from "~/utils/form";
import { updateClient } from "~/models/client.server";
import { useState } from "react";
import { maskingFuncs } from "~/utils/maskingFuncs";
import { useMatchesData, validateEmail } from "~/utils";
import type { Client } from "@prisma/client";

export async function loader({ request }: LoaderArgs) {
  return await requireUserId(request)
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { clientId } = params
  invariant(clientId, 'clientId not found')

  const formData = await request.formData()
  const { fields, errors } = getFields<{
    phoneNumber?: string;
    email?: string;
  }>(formData, [
    { name: 'phoneNumber', type: 'string', isRequired: false },
    { name: 'email', type: 'string', isRequired: false },
  ])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  if (fields.phoneNumber && (fields.phoneNumber?.length || '') < 12) {
    return json({
      errors: {
        phoneNumber: 'Invalid phone number', email: null
      }
    })
  }

  if (fields.email && !validateEmail(fields.email)) {
    return json({
      errors: {
        phoneNumber: null, email: 'Invaid email'
      }
    })
  }

  await updateClient(clientId, fields)
  return redirect(`/clients/${clientId}`)
}

export default function EditDetails() {
  const { client } = useMatchesData('routes/clients/$clientId') as SerializeFrom<{ client: Client }>
  const actionData = useActionData<typeof action>()
  const [phoneNumber, setPhoneNumber] = useState(client.phoneNumber || '')

  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Edit details</Title>
          <Link kind="ghost" isRounded to="details"><FontAwesomeIcon icon={faTrash} /></Link>
        </FlexHeader>
      </Navbar>
      <Form method="put">
        <FlexList pad={4}>
          <Field name="phoneNumber" label="Phone number">
            <Input
              name="phoneNumber"
              value={phoneNumber}
              onChange={e => setPhoneNumber(maskingFuncs["phone-number"](e.target.value))}
              placeholder="Client phone number..."
            />
            {actionData?.errors.phoneNumber ? <ErrorMessage message={actionData.errors.phoneNumber} /> : null}
          </Field>
          <Field name="email" label="Email">
            <Input name="email" defaultValue={client.email || undefined} placeholder="Client email..." />
            {actionData?.errors.email ? <ErrorMessage message={actionData.errors.email} /> : null}
          </Field>
        </FlexList>
        <SaveButtons saveLabel="Update details" />
      </Form>
    </div>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}