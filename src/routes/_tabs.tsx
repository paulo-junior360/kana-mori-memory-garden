import { createFileRoute, Outlet } from "@tanstack/react-router";

import { BottomNav } from "@/components/kana/bottom-nav";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
