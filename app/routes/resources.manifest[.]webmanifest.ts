import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = () => {
  // https://github.com/ShafSpecs/remix-pwa#going-deeper
  return json(
    {
      short_name: "Clients",
      name: "Clients",
      start_url: "/clients",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
      display: "standalone",
      shortcuts: [
        {
          name: "List",
          url: "/clients",
          icons: [
            {
              src: "/icons/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any monochrome",
            },
          ],
        },
      ],
      icons: [
        {
          src: "/icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          density: "2",
        },
        {
          src: "/icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          density: "4",
        },
        {
          src: "/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: "/icons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          src: "/icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          src: "/icons/favicon.ico",
          sizes: "48x48",
          type: "image/ico",
        },
        {
          src: "/icons/mstile-150x150.png",
          sizes: "150x150",
          type: "image/png",
        },
        {
          src: "/icons/safari-pinned-tab.svg",
          color: "#000000",
          type: "image/svg",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
