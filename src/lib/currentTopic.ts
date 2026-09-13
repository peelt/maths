/**
 * The topic the student says they are covering in class.
 *
 * The dashboard used to lead with whatever the review scheduler thought was
 * most overdue, under the heading "Due for review". That was the wrong thing
 * to put first. A revision site that opens by telling a student what they owe
 * is a site that accumulates debt in their head, and for the reader this one
 * is built for, a pile of overdue work is the thing that ends the session
 * before it starts.
 *
 * So the student names what they are actually doing, and that leads. Spaced
 * repetition still runs underneath — it is what makes anything stick — but it
 * offers rather than demands.
 *
 * Stored per device alongside the appearance and exam-pace preferences, for
 * the same reasons: it has to be readable without a network round trip, and it
 * is a working preference rather than part of the account.
 */

export const CURRENT_TOPIC_KEY = "practice.currentTopic";

/**
 * Read the stored topic.
 *
 * Validated against the real topic list rather than trusted: a slug that no
 * longer exists — a renamed topic, an edited localStorage — would otherwise
 * send the student to a 404 from the front page.
 */
export function readCurrentTopic(
  storage: Pick<Storage, "getItem"> | undefined,
  isKnownSlug: (slug: string) => boolean,
): string | null {
  try {
    const slug = storage?.getItem(CURRENT_TOPIC_KEY);
    return slug && isKnownSlug(slug) ? slug : null;
  } catch {
    // Private browsing and blocked site data both throw. An unreadable
    // preference is not a reason to fail to render the dashboard.
    return null;
  }
}

/** Store a topic, or clear it when passed null. */
export function writeCurrentTopic(
  storage: Pick<Storage, "setItem" | "removeItem"> | undefined,
  slug: string | null,
): void {
  try {
    if (slug === null) storage?.removeItem(CURRENT_TOPIC_KEY);
    else storage?.setItem(CURRENT_TOPIC_KEY, slug);
  } catch {
    // The session continues; the choice just does not persist.
  }
}
