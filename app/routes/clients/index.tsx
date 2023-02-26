import { Form, useLoaderData, useSearchParams, useSubmit, Link as RemixLink } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { requireUserId } from "~/session.server";
import { getClients } from "~/models/client.server";
import { FlexList, SearchInput } from "~/components";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)

  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const params = {
    userId,
    ...(q ? { q } : null)
  }

  const clients = await getClients(params)
  return json({ clients })
}

export default function ClientsList() {
  const { clients } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('query'))

  const handleClearQuery = () => {
    setQuery('')
    setSearchParams({})
  }
  return (
    <>
      <div className="sticky top-16 p-4 bg-base-300">
        <Form method="get" onChange={e => submit(e.currentTarget)}>
          <SearchInput value={query} onClear={handleClearQuery} onChange={e => setQuery(e.target.value)} />
        </Form>
      </div>
      <FlexList pad={4}>
        {clients.map(client => (
          <RemixLink className="btn justify-start" key={client.id} to={`${client.id}`}>{client.name}</RemixLink>
        ))}
      </FlexList>
    </>
  )
}