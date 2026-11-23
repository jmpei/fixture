// Story 1: a coordinator sets up a league with divisions, venues and time slots.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import {
  LeagueInputError,
  addDivision,
  addTimeSlot,
  addVenue,
  createLeague,
  getLeagueSetup,
} from "@/server/leagues";

const at = (iso: string) => new Date(iso);

beforeEach(async () => {
  await prisma.league.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("league setup", () => {
  it("creates a league in Vancouver time and reads back its divisions, venues and slots", async () => {
    const league = await createLeague({ name: "Winter Basketball" });
    expect(league.timeZone).toBe("America/Vancouver");

    await addDivision({ leagueId: league.id, name: "Open" });
    const gym = await addVenue({ leagueId: league.id, name: "West Gym" });
    await addTimeSlot({
      leagueId: league.id,
      venueId: gym.id,
      startsAt: at("2027-01-13T02:00:00Z"),
      endsAt: at("2027-01-13T03:00:00Z"),
    });

    const setup = await getLeagueSetup(league.id);
    expect(setup?.name).toBe("Winter Basketball");
    expect(setup?.divisions.map((d) => d.name)).toEqual(["Open"]);
    expect(setup?.venues.map((v) => v.name)).toEqual(["West Gym"]);
    expect(setup?.venues[0].timeSlots).toHaveLength(1);
  });

  it("returns null for a league that doesn't exist", async () => {
    expect(await getLeagueSetup("missing")).toBeNull();
  });

  it("rejects a blank league, division or venue name", async () => {
    await expect(createLeague({ name: "  " })).rejects.toThrow(LeagueInputError);
    const league = await createLeague({ name: "Winter Basketball" });
    await expect(addDivision({ leagueId: league.id, name: "" })).rejects.toThrow(LeagueInputError);
    await expect(addVenue({ leagueId: league.id, name: "" })).rejects.toThrow(LeagueInputError);
  });
});

describe("addTimeSlot", () => {
  async function leagueWithGym() {
    const league = await createLeague({ name: "Winter Basketball" });
    const gym = await addVenue({ leagueId: league.id, name: "West Gym" });
    return { league, gym };
  }
  const slot = (leagueId: string, venueId: string, start: string, end: string) =>
    addTimeSlot({ leagueId, venueId, startsAt: at(start), endsAt: at(end) });

  it("rejects a slot that ends before or when it starts", async () => {
    const { league, gym } = await leagueWithGym();
    await expect(slot(league.id, gym.id, "2027-01-13T03:00:00Z", "2027-01-13T02:00:00Z")).rejects.toThrow(
      "A time slot must end after it starts",
    );
    await expect(slot(league.id, gym.id, "2027-01-13T02:00:00Z", "2027-01-13T02:00:00Z")).rejects.toThrow(
      LeagueInputError,
    );
  });

  it("rejects a venue from another league", async () => {
    const { gym } = await leagueWithGym();
    const other = await createLeague({ name: "Spring Soccer" });
    await expect(slot(other.id, gym.id, "2027-01-13T02:00:00Z", "2027-01-13T03:00:00Z")).rejects.toThrow(
      "That venue isn't in this league",
    );
  });

  it("rejects a slot that overlaps another slot at the same venue", async () => {
    const { league, gym } = await leagueWithGym();
    await slot(league.id, gym.id, "2027-01-13T02:00:00Z", "2027-01-13T03:00:00Z");
    await expect(slot(league.id, gym.id, "2027-01-13T02:30:00Z", "2027-01-13T03:30:00Z")).rejects.toThrow(
      "overlaps",
    );
    await expect(slot(league.id, gym.id, "2027-01-13T01:00:00Z", "2027-01-13T04:00:00Z")).rejects.toThrow(
      LeagueInputError,
    );
  });

  it("allows back-to-back slots and the same time at another venue", async () => {
    const { league, gym } = await leagueWithGym();
    const east = await addVenue({ leagueId: league.id, name: "East Field" });
    await slot(league.id, gym.id, "2027-01-13T02:00:00Z", "2027-01-13T03:00:00Z");
    await slot(league.id, gym.id, "2027-01-13T03:00:00Z", "2027-01-13T04:00:00Z");
    await slot(league.id, east.id, "2027-01-13T02:00:00Z", "2027-01-13T03:00:00Z");
    const setup = await getLeagueSetup(league.id);
    expect(setup?.venues.flatMap((v) => v.timeSlots)).toHaveLength(3);
  });
});
