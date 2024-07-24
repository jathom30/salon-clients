import {
  Form,
  useLoaderData,
  useNavigation,
  useSubmit,
  Link as RemixLink,
} from "@remix-run/react";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { FlexList, Loader, SearchInput } from "~/components";
import { getAllClients } from "~/models/client.server";
import { requireUser } from "~/session.server";
import { useSpinDelay } from "spin-delay";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  if (user.email !== "jathom30@gmail.com") {
    throw new Response("Unauthorized", { status: 401 });
  }

  const clients = await getAllClients();

  return json({ clients });
}

export default function Admin() {
  const { clients } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [query, setQuery] = useState("");

  const handleClearQuery = () => {
    setQuery("");
  };

  const filteredClients = clients.filter((client) => {
    const nameMatch = client.name.toLowerCase().includes(query.toLowerCase());
    const userNameMatch = client.user.name
      .toLowerCase()
      .includes(query.toLowerCase());
    const emailMatch = client.user.email.includes(query.toLowerCase());
    return nameMatch || userNameMatch || emailMatch;
  });

  return (
    <>
      <div className="sticky top-16 bg-base-300 p-4">
        <Form method="get" onChange={(e) => submit(e.currentTarget)}>
          <SearchInput
            value={query}
            onClear={handleClearQuery}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form>
      </div>
      <FlexList pad={4} gap={2}>
        {filteredClients.map((client) => (
          <ClientLink client={client} key={client.id} />
        ))}
      </FlexList>
    </>
  );
}

const ClientLink = ({
  client,
}: {
  client: SerializeFrom<Awaited<ReturnType<typeof getAllClients>>[number]>;
}) => {
  const navigation = useNavigation();
  const pathname = navigation.location?.pathname || "";
  const isLoading = useSpinDelay(
    navigation.state !== "idle" && pathname.includes(client.id)
  );
  return (
    <RemixLink
      className="flex items-center justify-between rounded bg-base-100 p-2 shadow-md outline-2 outline-offset-2 hover:outline hover:shadow-xl hover:outline-accent focus-visible:outline-offset-4 focus-visible:outline-accent"
      key={client.id}
      to={`/clients/${client.id}`}
    >
      <span>
        {client.name} - {client.user.name} - {client.user.email}
      </span>{" "}
      {isLoading ? <Loader /> : null}
    </RemixLink>
  );
};
