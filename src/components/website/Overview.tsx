"use client";

import { ArrowRight, FilePen, Mail, Package, Users } from "lucide-react";
import Link from "next/link";
import { resetDemo, unpublishedSections, useWebsiteStore } from "@/store/website-store";
import { showToast } from "@/components/Toaster";
import { CONTENT_NAV, MESSAGES_NAV } from "@/components/website/website-nav";
import { Avatar, PageHeader, Panel, StatCard, enterDelay } from "@/components/website/website-ui";

const LATEST_MESSAGE_LIMIT = 3;
const formatDateTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** CMS home in the CRM "Today" layout: number cards, website sections, and the latest enquiries on a black card. */
export function Overview() {
  const store = useWebsiteStore();
  const { draft, messages } = store;
  const changed = new Set(unpublishedSections(store));
  const unreadCount = messages.filter((message) => !message.isRead).length;
  const latestMessages = [...messages].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, LATEST_MESSAGE_LIMIT);
  const restore = () => {
    if (!window.confirm("Restore the original arifapack.com content and sample messages? Your edits will be lost.")) return;
    resetDemo();
    showToast("Demo content restored");
  };
  const subtitle = store.publishedAt ? `Last published ${formatDateTime(store.publishedAt)}` : "Showing the original website content";

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader title="Website Panel" subtitle={subtitle} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={1} icon={Mail} label="Unread messages" value={unreadCount} />
        <StatCard index={2} icon={FilePen} label="Unpublished sections" value={changed.size} />
        <StatCard index={3} icon={Package} label="Products on website" value={`${draft.products.filter((item) => item.isVisible).length} / ${draft.products.length}`} />
        <StatCard index={4} icon={Users} label="Team members" value={draft.leadership.members.filter((item) => item.isVisible).length} />
      </div>

      <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-3">
        <Panel title="Website sections" count={changed.size > 0 ? changed.size : undefined} index={5} className="lg:col-span-2">
          <ul className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
            {CONTENT_NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 transition-all duration-200 hover:translate-x-1 hover:bg-white/70 hover:shadow-sm ${changed.has(item.key) ? "border-black" : "border-neutral-200 hover:border-neutral-400"}`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ring-2 ring-white transition-colors ${changed.has(item.key) ? "bg-black text-white" : "bg-neutral-200 text-neutral-700 group-hover:bg-black group-hover:text-white"}`}>
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    {changed.has(item.key) && <span className="block text-xs font-medium">Draft</span>}
                  </span>
                  <ArrowRight className="size-4 shrink-0 -translate-x-1 text-neutral-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <section className="animate-enter lift panel-dark p-6" style={enterDelay(6)}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium tracking-tight">Latest messages</h2>
            <Link href={MESSAGES_NAV.href} className="press inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black hover:bg-neutral-200">
              Inbox <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-5 space-y-2">
            {latestMessages.map((message) => (
              <li key={message.id}>
                <Link href={MESSAGES_NAV.href} className="flex items-center gap-3 rounded-full border border-white/15 py-1.5 pr-4 pl-1.5 transition-all duration-200 hover:translate-x-1 hover:border-white/40 hover:bg-white/10">
                  <Avatar name={message.name} size="md" inverted={!message.isRead} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{message.name}</span>
                    <span className="block truncate text-xs text-white/60">{message.subject || message.message}</span>
                  </span>
                  {!message.isRead && <span className="size-2 shrink-0 rounded-full bg-white" aria-label="Unread" />}
                </Link>
              </li>
            ))}
          </ul>
          {latestMessages.length === 0 && <p className="mt-5 text-sm text-white/50">No messages yet.</p>}
        </section>
      </div>
      <button onClick={restore} className="press rounded-full px-3 py-1.5 text-xs text-neutral-500 hover:bg-white/70 hover:text-black">
        Restore original demo content
      </button>
    </div>
  );
}
