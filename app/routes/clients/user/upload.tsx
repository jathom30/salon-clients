import { faTimes, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSubmit } from "@remix-run/react";
import { Button, CatchContainer, ErrorContainer, FlexHeader, FlexList, Link, Navbar, Title } from "~/components";
import { requireUserId } from "~/session.server";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { bulkUpload } from "~/models/client.server";

export type ExpectedFileType = {
  name: string;
  email?: string;
  phoneNumber?: string;
  notes: {
    createdAt: string;
    body: string;
  }[]
}[]

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const file = formData.get('file')
  if (typeof file !== 'string' || !file) {
    return null
  }
  const clientsFile: ExpectedFileType = JSON.parse(file)

  await bulkUpload(clientsFile, userId)
  return redirect('/clients')
}

export default function UploadClients() {
  const [files, setFiles] = useState<string>()
  const submit = useSubmit()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) { return }
    const fileReader = new FileReader();
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = e => {
      const json = e.target?.result
      setFiles(json?.toString());
    };
  };

  const handleSubmit = () => {
    if (!files) return
    submit({ file: files }, { method: 'post' })
  }

  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Bulk upload</Title>
          <Link kind="ghost" isRounded to=".."><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <FlexList pad={4}>
        <p>Migrating from our old app? You can move your exisiting clients from there to here in just a few steps.</p>
        <ol>
          <li>1. Visit <a className="link link-accent" href="https://salon-contacts.netlify.app" target="_blank" rel="noreferrer">salon-contacts.netlify.app</a> and sign in to your account.</li>
          <li>2. Navigate to <strong>User Details</strong> and click <strong>Download JSON</strong> at the bottom of the page</li>
          <li>3. Once the json file has downloaded to your device, upload the file below.</li>
        </ol>
        <FlexList>
          <input className="file-input file-input-bordered w-full" accept="application/json" name="file" type="file" onChange={handleChange} />
          <Button isDisabled={!files} type="submit" kind="primary" icon={faUpload} onClick={handleSubmit}>Upload</Button>
        </FlexList>
      </FlexList>
    </div>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}