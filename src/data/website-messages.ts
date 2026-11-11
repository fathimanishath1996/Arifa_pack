import type { ContactMessage } from "@/lib/website-types";

const HOUR = 3_600_000;

/** Sample enquiries so the inbox is not empty in the demo. Real ones come from the website form. */
export function createMockMessages(now: number): ContactMessage[] {
  return [
    {
      id: "message-1",
      name: "Fatima Al Mansoori",
      email: "fatima@goldenspoon.ae",
      subject: "Aluminium containers for catering",
      message: "We run a catering service in Sharjah and need 5,000 aluminium containers per month. Please share your price list and minimum order quantity.",
      receivedAt: new Date(now - 3 * HOUR).toISOString(),
      isRead: false,
    },
    {
      id: "message-2",
      name: "Rahul Menon",
      email: "rahul@freshbites.ae",
      subject: "Custom printed containers",
      message: "Can you print our logo on microwave containers? We are launching a ready-to-eat meal line next quarter.",
      receivedAt: new Date(now - 26 * HOUR).toISOString(),
      isRead: false,
    },
    {
      id: "message-3",
      name: "Sara Khan",
      email: "sara.khan@citymart.ae",
      subject: "Cling film supply",
      message: "Looking for a regular supplier of cling film rolls for our supermarket branches in Ajman.",
      receivedAt: new Date(now - 3 * 24 * HOUR).toISOString(),
      isRead: true,
    },
  ];
}
