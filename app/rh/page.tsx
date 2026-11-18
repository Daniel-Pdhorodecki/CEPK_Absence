import { redirect } from "next/navigation";

export default function LegacyRhRedirectPage() {
  redirect("/admin");
}
