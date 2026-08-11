import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth";

export default async function LabPage() {
  await checkAuth();
  redirect("/lab/lab-notes");
}
