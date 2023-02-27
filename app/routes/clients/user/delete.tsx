import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useNavigation } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Button, FlexHeader, FlexList, Link, Navbar, Title } from "~/components";
import { requireUser, requireUserId } from "~/session.server";
import { deleteUserByEmail } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
  return await requireUserId(request)
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request)
  await deleteUserByEmail(user.email)
  redirect('/')
}

export default function DeleteUser() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state !== 'idle'
  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Delete account</Title>
          <Link kind="ghost" isRounded to="details"><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <Form method="put">
        <FlexList pad={4}>
          <p>Are you sure you want to delete your account? This will delete all client data as well. This is a perminent action.</p>
        </FlexList>
        <div className="bg-base-100 shadow-2xl flex flex-col p-4 gap-2 w-full sm:flex-row-reverse xl:rounded-md">
          <Button size="md" type="submit" kind="error" icon={faTrash} isSaving={isSubmitting}>{isSubmitting ? 'Deleting...' : 'Delete client'}</Button>
          <Link to="..">Cancel</Link>
        </div>
      </Form>
    </div>
  )
}