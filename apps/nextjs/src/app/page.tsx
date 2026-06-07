import { auth } from "@acme/auth";
import { redirect } from "next/navigation";
import Hero from "~/components/home/hero";
import LatestStudySets from "~/components/home/latest-study-sets";
import PopularStudySets from "~/components/home/popular-study-sets";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/latest");
  }

  return (
    <>
      <Hero />
      <PopularStudySets />
      <LatestStudySets />
    </>
  );
}
