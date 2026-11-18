import { redirect } from "next/navigation";

export default async function GuildAliasRedirect({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  redirect(`/dashboard/${encodeURIComponent(guildId)}`);
}
