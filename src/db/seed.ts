import { db } from "@/db";
import { claims, itemImages, items, savedItems, user } from "@/db/schema";

const now = new Date();

const seedItems = [
  {
    id: "item_black_hp_backpack",
    title: "Black HP Laptop Backpack",
    type: "LOST" as const,
    status: "PUBLISHED" as const,
    category: "Bags",
    location: "Main Library",
    description:
      "A black HP branded backpack found near the student computer lab in the Main Library. The bag appears to be in good condition. It has multiple compartments and a padded laptop sleeve. No external ID tags or markings were found during the initial inspection.",
    referenceNumber: "UST-992841",
    reportedDate: new Date("2026-06-14T10:00:00.000Z"),
    eventDate: "2026-06-14",
    eventTime: "10:00",
    landmark: "Student computer lab",
    storageOption: null,
    hiddenVerificationDetails:
      "Owner should describe private contents, laptop serial details, or the wallpaper description.",
    image:
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "item_keys_main_library",
    title: "Bunch of Keys",
    type: "FOUND" as const,
    status: "PUBLISHED" as const,
    category: "Keys",
    location: "Main Library",
    description:
      "A bunch of keys with a dark leather keyholder was found near the reading area of the Main Library.",
    referenceNumber: "UST-100241",
    reportedDate: new Date("2026-06-14T10:00:00.000Z"),
    eventDate: "2026-06-14",
    eventTime: "10:00",
    landmark: "Reading area",
    storageOption: "Security office",
    hiddenVerificationDetails:
      "Owner should describe the number of keys and the keyholder mark.",
    image:
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "item_macbook_src",
    title: "MacBook Air",
    type: "FOUND" as const,
    status: "PUBLISHED" as const,
    category: "Electronics",
    location: "SRC Office",
    description:
      "A silver MacBook Air was handed in after being found at the SRC office reception area.",
    referenceNumber: "UST-100242",
    reportedDate: new Date("2026-06-13T11:30:00.000Z"),
    eventDate: "2026-06-13",
    eventTime: "11:30",
    landmark: "Reception area",
    storageOption: "SRC Office",
    hiddenVerificationDetails:
      "Owner should provide wallpaper or serial detail.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "item_wallet_cafeteria",
    title: "Leather Wallet",
    type: "FOUND" as const,
    status: "CLAIMED" as const,
    category: "Wallets",
    location: "Cafeteria",
    description:
      "A black leather wallet was found near the cafeteria entrance and is being held for verification.",
    referenceNumber: "UST-100243",
    reportedDate: new Date("2026-06-12T15:00:00.000Z"),
    eventDate: "2026-06-12",
    eventTime: "15:00",
    landmark: "Cafeteria entrance",
    storageOption: "Security office",
    hiddenVerificationDetails:
      "Owner should identify contents not shown publicly.",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "item_wallet_lost_library",
    title: "Black Leather Wallet",
    type: "LOST" as const,
    status: "PUBLISHED" as const,
    category: "Wallets",
    location: "Main Library - 2nd Floor",
    description:
      "A black leather wallet was reported lost around the second floor study area.",
    referenceNumber: "UST-100244",
    reportedDate: new Date("2026-06-11T09:45:00.000Z"),
    eventDate: "2026-06-11",
    eventTime: "09:45",
    landmark: "Second floor study area",
    storageOption: null,
    hiddenVerificationDetails:
      "Owner has provided private card details for verification.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "item_headphones_lawn",
    title: "Silver Sony Headphones",
    type: "FOUND" as const,
    status: "PUBLISHED" as const,
    category: "Electronics",
    location: "Student Union Lawn",
    description:
      "Silver wireless headphones were found on the student union lawn after lectures.",
    referenceNumber: "UST-100245",
    reportedDate: new Date("2026-06-10T13:20:00.000Z"),
    eventDate: "2026-06-10",
    eventTime: "13:20",
    landmark: "Student union lawn",
    storageOption: "Security office",
    hiddenVerificationDetails: "Owner should provide pairing name.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "item_private_pending_id",
    title: "Pending Student ID",
    type: "FOUND" as const,
    status: "PENDING" as const,
    category: "ID Cards",
    location: "Science Block B",
    description: "This pending record should not appear in public search.",
    referenceNumber: "UST-PRIVATE-001",
    reportedDate: now,
    eventDate: "2026-06-15",
    eventTime: "12:00",
    landmark: "Science Block B",
    storageOption: "Internal review",
    hiddenVerificationDetails: "Private pending record.",
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80",
  },
];

async function main() {
  await db.delete(savedItems);
  await db.delete(claims);
  await db.delete(itemImages);
  await db.delete(items);

  await db.insert(items).values(
    seedItems.map(({ image: _image, ...item }) => ({
      ...item,
      reportSource: "USER",
      privateOwnerNotes:
        item.status === "PENDING" ? "Internal-only note." : null,
      adminNotes: null,
      removedReason: null,
    })),
  );

  await db.insert(itemImages).values(
    seedItems.map((item) => ({
      id: `img_${item.id}`,
      itemId: item.id,
      url: item.image,
      alt: item.title,
      isPrimary: true,
    })),
  );

  const sampleUser = (await db.select().from(user).limit(1))[0];

  if (sampleUser) {
    await db.insert(claims).values({
      claimantId: sampleUser.id,
      hiddenDetails: "The wallet contains a student ID and a folded receipt.",
      id: "claim_seed_wallet",
      itemId: "item_wallet_cafeteria",
      proofDescription:
        "I lost this wallet around the cafeteria after lunch and can identify the card layout.",
      referenceNumber: "CLM-SEED-001",
      status: "SUBMITTED",
    });
  }

  console.log(`Seeded ${seedItems.length} Phase 2 item records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
