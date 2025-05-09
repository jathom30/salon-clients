import { config } from "@fortawesome/fontawesome-svg-core";
import faStylesheetUrl from "@fortawesome/fontawesome-svg-core/styles.css?url";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect } from "react";
import { themeChange } from "theme-change";

import stylesheet from "~/globals.css?url";

import { getUser } from "./session.server";

// Prevent fontawesome from dynamically adding its css since we are going to include it manually
config.autoAddCss = false;

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Fascinate&family=Poppins:wght@100;400;700&display=swap",
    },
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: faStylesheetUrl },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  });
  return (
    <html lang="en" className="h-full bg-base-300">
      <head>
        <meta title="Clients" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <Meta />
        <link rel="manifest" href="/resources/manifest.webmanifest" />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
