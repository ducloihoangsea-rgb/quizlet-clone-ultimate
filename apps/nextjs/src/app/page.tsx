import { auth } from "@acme/auth";
import { redirect } from "next/navigation";
import Hero from "~/components/home/hero";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/latest");
  }

  return <Hero />;
}
