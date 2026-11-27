import { getShopItem } from "@/data/shop";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

/** Avatar with the frame and character equipped in the shop. */
export function UserAvatar({
  className,
  avatarId,
  frameId,
}: {
  className?: string;
  avatarId?: string;
  frameId?: string;
}) {
  const { state } = useAppStore();
  const avatar = getShopItem(avatarId ?? state.equipped.avatar);
  const frame = getShopItem(frameId ?? state.equipped.moldura);
  const isDefault = !avatar || avatar.id === "avatar-padrao";
  return (
    <div className={cn("grid size-28 place-items-center rounded-full p-3", frame?.frameClass ?? "bg-lavender", className)}>
      <div className="grid size-full place-items-center rounded-full bg-card">
        {isDefault ? (
          <svg viewBox="0 0 40 40" className="size-[45%] text-foreground" aria-hidden>
            <circle cx="14" cy="16" r="2.4" fill="currentColor" />
            <circle cx="26" cy="16" r="2.4" fill="currentColor" />
            <path d="M13 24c3.5 4 10.5 4 14 0" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <span className="text-[2.6em] leading-none" aria-label={avatar.name}>
            {avatar.icon}
          </span>
        )}
      </div>
    </div>
  );
}
