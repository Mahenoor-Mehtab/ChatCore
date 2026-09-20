"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";

export default function Page() {
  const users = useQuery((api as any).users.getMany);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <p>apps/web</p>
      {users?.map((user: any) => (
        <div key={user._id}>{user.name}</div>
      ))}
    </div>
  );
}