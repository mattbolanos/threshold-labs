import { redirect } from "next/navigation";
import { checkLabAccess } from "@/lib/auth";

export default async function LabPage() {
  await checkLabAccess();
  redirect("/lab/lab-notes");
}
