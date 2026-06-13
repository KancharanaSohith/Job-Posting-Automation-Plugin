import { archiveStaleRequisitions } from "../services/archive.service.js";
import { disconnectDb } from "../db/client.js";

async function main(): Promise<void> {
  const count = await archiveStaleRequisitions();
  console.log(`Archived ${count} stale requisition(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => disconnectDb());
