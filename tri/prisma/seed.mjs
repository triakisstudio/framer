// Seeds a demo world so you can see reconnections light up immediately.
//
//   Demo login:  demo@tri.app  /  password123
//
// The demo account follows a mix of people — some already on Tri (they glow),
// some not yet.
import pkg from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function makeUser({ email, igUsername, displayName, bio }) {
  const passwordHash = await bcrypt.hash("password123", 10);
  return prisma.user.upsert({
    where: { igUsername },
    update: { displayName, bio },
    create: { email, igUsername, displayName, passwordHash, bio },
  });
}

async function setFollows(owner, usernames) {
  await prisma.follow.deleteMany({ where: { ownerId: owner.id } });
  await prisma.follow.createMany({
    data: usernames.map((u) => ({ ownerId: owner.id, targetUsername: u })),
  });
}

async function main() {
  const me = await makeUser({
    email: "demo@tri.app",
    igUsername: "demo_me",
    displayName: "Demo User",
    bio: "Just trying to find my people again.",
  });

  // A handful of friends who are already on Tri.
  const onTri = [
    { email: "alice@tri.app", igUsername: "alice", displayName: "Alice Rivera", bio: "Ceramics & coffee." },
    { email: "bob@tri.app", igUsername: "bob_b", displayName: "Bob Brown", bio: "Trail runner." },
    { email: "cara@tri.app", igUsername: "cara.k", displayName: "Cara Kim", bio: "Film photographer." },
    { email: "dev@tri.app", igUsername: "devleon", displayName: "Dev Leon", bio: "Builds tiny apps." },
  ];
  const created = [];
  for (const u of onTri) created.push(await makeUser(u));

  // Demo follows these Tri friends plus a pile of people not on Tri yet.
  const notYet = [
    "old_school_friend", "marathon_mike", "the_pottery_barn", "jane.doe",
    "city_cyclist", "book_club_nora", "sunset_chaser", "gym_buddy_sam",
    "neighbor_tom", "uni_roommate", "festival_friends", "coworker_lin",
  ];
  await setFollows(me, [...onTri.map((u) => u.igUsername), ...notYet]);

  // Some of the Tri friends followed the demo user back on Instagram.
  await setFollows(created[0], ["demo_me", "bob_b", "cara.k"]);
  await setFollows(created[1], ["demo_me", "alice"]);
  await setFollows(created[2], ["alice", "devleon"]);

  console.log("Seeded. Log in as demo@tri.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
