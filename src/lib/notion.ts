import { Client } from "@notionhq/client";

/** Use NOTION_SECRET and NOTION_DATABASE_ID from env. Database ID is required for API calls. */
function getNotionClient(): { client: Client; databaseId: string } | null {
  const secret = process.env.NOTION_SECRET;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!secret || !databaseId) return null;

  return {
    client: new Client({ auth: secret }),
    databaseId,
  };
}

export type AppointmentRecord = {
  id: string;
  createdAtISO: string;
  artistSlug: string;
  name: string;
  contact: string;
  placement: string;
  size: string;
  styleNotes: string;
  budget?: string;
  timeline?: string;
  referenceImageSavedPath?: string;
};

/**
 * Create a page in the Notion database using NOTION_DATABASE_ID.
 * Property names must match your Notion database columns (e.g. "Name", "Contact", "Artist").
 */
export async function createAppointmentPageInNotion(
  record: AppointmentRecord,
): Promise<{ id: string } | null> {
  const notion = getNotionClient();
  if (!notion) return null;

  const { client, databaseId } = notion;

  try {
    const response = await client.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [{ text: { content: record.name } }],
        },
        Contact: {
          rich_text: [{ text: { content: record.contact } }],
        },
        Artist: {
          rich_text: [{ text: { content: record.artistSlug } }],
        },
        Placement: {
          rich_text: [{ text: { content: record.placement } }],
        },
        Size: {
          rich_text: [{ text: { content: record.size } }],
        },
        "Style notes": {
          rich_text: [{ text: { content: record.styleNotes } }],
        },
        Budget: {
          rich_text: [{ text: { content: record.budget ?? "" } }],
        },
        Timeline: {
          rich_text: [{ text: { content: record.timeline ?? "" } }],
        },
        "Request ID": {
          rich_text: [{ text: { content: record.id } }],
        },
        Created: {
          date: { start: record.createdAtISO },
        },
      },
    });

    return { id: response.id };
  } catch (err) {
    console.error("[Notion] createAppointmentPageInNotion failed:", err);
    return null;
  }
}
