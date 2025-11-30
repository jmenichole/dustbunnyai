import { create } from "zustand";

interface Email {
  id: string;
  subject: string;
  from: string;
  date: Date;
  category?: string;
  cleaned: boolean;
}

interface InboxStore {
  emails: Email[];
  selectedEmails: string[];
  filter: string;
  setEmails: (emails: Email[]) => void;
  toggleEmailSelection: (emailId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setFilter: (filter: string) => void;
}

export const useInboxStore = create<InboxStore>((set) => ({
  emails: [],
  selectedEmails: [],
  filter: "all",
  setEmails: (emails) => set({ emails }),
  toggleEmailSelection: (emailId) =>
    set((state) => ({
      selectedEmails: state.selectedEmails.includes(emailId)
        ? state.selectedEmails.filter((id) => id !== emailId)
        : [...state.selectedEmails, emailId],
    })),
  selectAll: () =>
    set((state) => ({
      selectedEmails: state.emails.map((e) => e.id),
    })),
  clearSelection: () => set({ selectedEmails: [] }),
  setFilter: (filter) => set({ filter }),
}));
