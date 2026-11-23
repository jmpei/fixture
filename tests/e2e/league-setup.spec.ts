// Story 1: a coordinator creates a league, adds a venue and a time slot, and an overlapping
// slot is rejected with the reason while the entered values stay in the form.
import { expect, test, type Page } from "@playwright/test";

// Before hydration a form posts natively and the page comes back with its defaults,
// so wait for the client bundle before typing.
const ready = (page: Page) => page.waitForLoadState("networkidle");

test("sets up a league and rejects an overlapping time slot", async ({ page }) => {
  await page.goto("/leagues/new");
  await ready(page);
  const newLeague = page.getByRole("form", { name: "New league" });
  await newLeague.getByLabel("League name").fill("Winter Basketball");
  await newLeague.getByRole("button", { name: "Create league" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Winter Basketball");
  await ready(page);

  const venueForm = page.getByRole("form", { name: "Add venue" });
  await venueForm.getByLabel("Venue name").fill("West Gym");
  await venueForm.getByRole("button", { name: "Add venue" }).click();
  await expect(page.getByRole("heading", { name: "West Gym" })).toBeVisible();
  await expect(venueForm.getByLabel("Venue name")).toHaveValue("");

  const slotForm = page.getByRole("form", { name: "Add time slot" });
  await slotForm.getByLabel("Date").fill("2027-01-12");
  await slotForm.getByRole("button", { name: "Add time slot" }).click();
  const slots = page.getByRole("list", { name: "West Gym time slots" });
  await expect(slots).toContainText("2027-01-12 19:00–20:00");

  await slotForm.getByLabel("Date").fill("2027-01-12");
  await slotForm.getByLabel("Start").fill("19:30");
  await slotForm.getByLabel("End").fill("20:30");
  await slotForm.getByRole("button", { name: "Add time slot" }).click();
  await expect(slotForm.getByRole("status")).toHaveText("That time overlaps another slot at West Gym");
  await expect(slotForm.getByLabel("Start")).toHaveValue("19:30");
  await expect(slotForm.getByLabel("End")).toHaveValue("20:30");
  await expect(slots.getByRole("listitem")).toHaveCount(1);
});
