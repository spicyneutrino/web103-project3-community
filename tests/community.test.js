import test from "node:test";
import assert from "node:assert/strict";
import { countdown } from "../client/src/components/time.js";
import { app } from "../server/app.js";
import { pool } from "../server/config/database.js";
import { seedDatabase } from "../server/config/reset.js";
const now = Date.parse("2026-10-12T12:00:00Z");
test("countdown distinguishes future, under a minute, and past events", () => {
  assert.equal(countdown("2026-10-14T15:20:00Z", now), "Starts in 2d 3h 20m");
  assert.equal(
    countdown(new Date(now + 30000), now),
    "Starts in less than a minute",
  );
  assert.equal(countdown(new Date(now), now), "Past event");
});
test("Render PostgreSQL API and repeatable seed", async (t) => {
  await seedDatabase(pool);
  await seedDatabase(pool);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (path) => {
    const r = await fetch(base + path);
    return { status: r.status, body: await r.json() };
  };
  const locations = await request("/locations");
  assert.equal(locations.status, 200);
  assert.equal(locations.body.length, 4);
  const all = await request("/events");
  assert.equal(all.body.length, 12);
  for (const l of locations.body) {
    const detail = await request(`/locations/${l.slug}`);
    assert.equal(detail.body.id, l.id);
    const events = await request(`/events?location=${l.slug}`);
    assert.equal(events.body.length, 3);
    assert.ok(events.body.every((e) => e.location_id === l.id));
  }
  assert.equal((await request("/locations/unknown")).status, 404);
  assert.equal(
    (await request("/events?location=%27%20OR%201%3D1")).status,
    400,
  );
  assert.deepEqual((await request("/events?location=unknown")).body, []);
  assert.equal((await request("/health")).body.database, "PostgreSQL");
  assert.equal((await request("/missing")).status, 404);
});
