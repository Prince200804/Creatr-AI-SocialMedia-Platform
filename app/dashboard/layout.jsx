import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardUI from "./_components/dashboard-ui";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <DashboardUI>{children}</DashboardUI>;
}

