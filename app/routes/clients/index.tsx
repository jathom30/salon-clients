import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
  Link as RemixLink,
  useNavigation,
} from "@remix-run/react";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { requireUserId } from "~/session.server";
import { getClients } from "~/models/client.server";
import { Button, FlexList, Link, Loader, SearchInput } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useSpinDelay } from "spin-delay";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const q = url.searchParams.get("query");

  const params = {
    userId,
    ...(q ? { q } : null),
  };

  const clients = await getClients(params);
  return json({ clients });
}

export default function ClientsList() {
  const { clients } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query"));

  const handleClearQuery = () => {
    setQuery("");
    setSearchParams({});
  };

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
        {clients.length === 0 ? (
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
          clients
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
    navigation.state !== "idle" && pathname.includes(client.id)
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
