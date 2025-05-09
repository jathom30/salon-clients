import {
  useLoaderData,
  Link as RemixLink,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { requireUserId } from "~/session.server";
import { getClients } from "~/models/client.server";
import { Button, FlexList, Link, Loader, SearchInput } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useSpinDelay } from "spin-delay";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const clients = await getClients({ userId });
  return json({ clients });
}

export default function ClientsList() {
  const { clients } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  const handleClearQuery = () => {
    setQuery("");
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <div className="sticky top-16 bg-base-300 p-4">
        <SearchInput
          value={query}
          onClear={handleClearQuery}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <FlexList pad={4} gap={2}>
        {filteredClients.length === 0 ? (
          <FlexList items="center">
            <FontAwesomeIcon size="4x" icon={faMagnifyingGlass} />
            {query ? (
              <>
                <span className="text-center">
                  No contacts found matching that name.
                </span>
                <Button kind="secondary" onClick={handleClearQuery}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <span className="text-center">
                  Looks like you don't have any clients created yet
                </span>
                <Link kind="primary" icon={faPlus} to="new">
                  Create your first
                </Link>
              </>
            )}
          </FlexList>
        ) : (
          filteredClients
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((client) => <ClientLink client={client} key={client.id} />)
        )}
      </FlexList>
    </>
  );
}

const ClientLink = ({
  client,
}: {
  client: SerializeFrom<{ id: string; name: string }>;
}) => {
  const navigation = useNavigation();
  const pathname = navigation.location?.pathname || "";
  const isLoading = useSpinDelay(
    navigation.state !== "idle" && pathname.includes(client.id),
  );
  return (
    <RemixLink
      className="flex items-center justify-between rounded bg-base-100 p-2 shadow-md outline-2 outline-offset-2 hover:outline hover:shadow-xl hover:outline-accent focus-visible:outline-offset-4 focus-visible:outline-accent"
      key={client.id}
      to={`${client.id}`}
    >
      <span>{client.name}</span> {isLoading ? <Loader /> : null}
    </RemixLink>
  );
};
