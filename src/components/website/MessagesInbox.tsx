"use client";

import { Mail, MailOpen, Reply, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { deleteMessage, setMessageRead, useWebsiteStore } from "@/store/website-store";
import { showToast } from "@/components/Toaster";
import { Avatar, PageHeader, RowCheckbox, SegmentedControl, enterDelay, initialsOf } from "@/components/website/website-ui";
import { setSelectionToolbar } from "@/components/website/toolbar-store";

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "UNREAD", label: "Unread" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];
const formatReceived = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Enquiries from the website form: list on the left, the chosen message in the dark panel on the right. */
export function MessagesInbox() {
  const { messages } = useWebsiteStore();
  const [filter, setFilter] = useState<FilterId>("ALL");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const needle = query.trim().toLowerCase();
  const visibleMessages = messages
    .filter((message) => filter === "ALL" || !message.isRead)
    .filter((message) => !needle || `${message.name} ${message.email} ${message.subject} ${message.message}`.toLowerCase().includes(needle))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  const activeMessage = visibleMessages.find((message) => message.id === activeId) ?? visibleMessages[0];
  const selected = visibleMessages.filter((message) => selectedIds.has(message.id));
  const isAllSelected = visibleMessages.length > 0 && selected.length === visibleMessages.length;
  const unreadCount = messages.filter((message) => !message.isRead).length;

  // Opening a message marks it as read.
  useEffect(() => {
    if (activeMessage && !activeMessage.isRead && activeId === activeMessage.id) setMessageRead(activeMessage.id, true);
  }, [activeMessage, activeId]);

  // Ticked messages get bulk actions in the top toolbar.
  useEffect(() => {
    if (selected.length === 0) return setSelectionToolbar(null);
    const clear = () => setSelectedIds(new Set());
    const mark = (isRead: boolean) => {
      selected.forEach((message) => setMessageRead(message.id, isRead));
      showToast(`${selected.length} marked as ${isRead ? "read" : "unread"}`);
      clear();
    };
    setSelectionToolbar({
      count: selected.length,
      onClear: clear,
      actions: [
        { label: "Mark read", icon: MailOpen, onClick: () => mark(true) },
        { label: "Mark unread", icon: Mail, onClick: () => mark(false) },
        {
          label: "Delete",
          icon: Trash2,
          onClick: () => {
            if (!window.confirm(`Delete ${selected.length} selected messages?`)) return;
            selected.forEach((message) => deleteMessage(message.id));
            showToast(`${selected.length} deleted`);
            clear();
          },
        },
      ],
    });
  }, [selected]);
  useEffect(() => () => setSelectionToolbar(null), []);

  const toggleSelected = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const remove = (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    deleteMessage(id);
    showToast("Message deleted");
  };

  return (
    <div>
      <PageHeader title="Messages" subtitle={`${unreadCount} unread · from the website contact form`}>
        <SegmentedControl
          options={FILTERS}
          value={filter}
          onChange={(next) => {
            setFilter(next);
            setSelectedIds(new Set());
          }}
          label="Filter messages"
        />
      </PageHeader>

      <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="animate-enter lift panel pb-4" style={enterDelay(1)}>
          <header className="flex items-center gap-3 px-6 pt-5 pb-3">
            <RowCheckbox checked={isAllSelected} onChange={() => setSelectedIds(isAllSelected ? new Set() : new Set(visibleMessages.map((message) => message.id)))} label="Select all" />
            <h2 className="flex items-center gap-2 text-lg font-medium tracking-tight">
              {filter === "ALL" ? "All messages" : "Unread"}
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-black px-2 text-xs font-semibold text-white tabular-nums transition-transform hover:scale-110">{visibleMessages.length}</span>
            </h2>
          </header>
          <ul className="space-y-2 px-4">
            {visibleMessages.map((message) => {
              const isActive = message.id === activeMessage?.id;
              return (
                <motion.li key={message.id} layout transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                  <div className={`group flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-2.5 transition-all duration-200 hover:translate-x-1 hover:bg-white/70 hover:shadow-sm ${isActive ? "border-black bg-white/70 shadow-sm" : "border-neutral-200 hover:border-neutral-400"}`}>
                    <span>
                      <RowCheckbox checked={selectedIds.has(message.id)} onChange={() => toggleSelected(message.id)} label={`Select message from ${message.name}`} />
                    </span>
                    <button onClick={() => setActiveId(message.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-current={isActive}>
                      <Avatar name={message.name} size="md" inverted={!message.isRead} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-sm ${message.isRead ? "font-medium" : "font-semibold"}`}>{message.name}</span>
                          {!message.isRead && <span className="size-2 shrink-0 rounded-full bg-black" aria-label="Unread" />}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">{message.subject || "(No subject)"}</span>
                      </span>
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
          {visibleMessages.length === 0 && (
            <p className="flex items-center gap-2 px-6 pt-1 pb-2 text-sm text-neutral-400">
              <MailOpen className="size-4" /> {needle ? "No messages match your search" : "No messages here"}
            </p>
          )}
        </section>

        <section className="animate-enter lift panel-dark p-5 md:p-6 lg:sticky lg:top-4" style={enterDelay(2)}>
          <label className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 transition-colors focus-within:bg-white/15 hover:bg-white/15">
            <Search className="size-4 text-white/60" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search in messages" className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50" />
          </label>

          <AnimatePresence mode="wait">
            {activeMessage ? (
              <motion.div key={activeMessage.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-medium tracking-tight">{activeMessage.subject || "(No subject)"}</h2>
                  <span className="text-xs text-white/50">{formatReceived(activeMessage.receivedAt)}</span>
                </div>
                <div className="mt-5 flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-black">{initialsOf(activeMessage.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{activeMessage.name}</p>
                    <a href={`mailto:${activeMessage.email}`} className="text-xs text-white/50 hover:text-white hover:underline">
                      {activeMessage.email}
                    </a>
                    <p className="mt-3 rounded-3xl rounded-tl-md bg-white/10 p-4 text-sm leading-relaxed whitespace-pre-line transition-colors hover:bg-white/[0.14]">{activeMessage.message}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(`Re: ${activeMessage.subject}`)}`} className="press inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200">
                    <Reply className="size-3.5" /> Reply
                  </a>
                  <button onClick={() => setMessageRead(activeMessage.id, false)} className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-white/75 hover:bg-white/10 hover:text-white">
                    <Mail className="size-3.5" /> Mark unread
                  </button>
                  <button onClick={() => remove(activeMessage.id)} className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-white/75 hover:bg-white/10 hover:text-white">
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ) : (
              <p className="mt-10 text-center text-sm text-white/50">Select a message to read it.</p>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
