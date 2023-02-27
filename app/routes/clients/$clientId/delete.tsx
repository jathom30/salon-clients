import { CatchContainer, ErrorContainer } from "~/components"

export default function DeleteClient() {
  return (
    <span>DELETE CLIENT</span>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}