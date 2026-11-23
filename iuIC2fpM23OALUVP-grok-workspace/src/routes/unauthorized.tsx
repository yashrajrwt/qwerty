import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: () => <Navigate to="/" />,
});
