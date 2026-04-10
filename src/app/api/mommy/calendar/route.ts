import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// Slot indices map to time ranges:
// 0 = Morning (06:00-12:00), 1 = Afternoon (12:00-18:00),
// 2 = Evening (18:00-22:00), 3 = Late Night (22:00-02:00)
const SLOT_TIMES = [
  { start: "06:00", end: "12:00" },
  { start: "12:00", end: "18:00" },
  { start: "18:00", end: "22:00" },
  { start: "22:00", end: "02:00" },
];

export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("day_of_week, start_time, end_time, is_available")
    .eq("mommy_id", user!.id);

  // Transform rows into 7×4 boolean grid [dayOfWeek][slotIdx]
  const grid: boolean[][] = Array.from({ length: 7 }, () => Array(4).fill(false));

  for (const slot of slots ?? []) {
    const slotIdx = SLOT_TIMES.findIndex((s) => s.start === slot.start_time);
    if (slotIdx !== -1 && slot.day_of_week >= 0 && slot.day_of_week < 7) {
      grid[slot.day_of_week][slotIdx] = slot.is_available ?? true;
    }
  }

  return NextResponse.json({ slots: grid });
}

export async function PUT(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const body = await req.json();
  const grid: boolean[][] = body.slots;

  if (!Array.isArray(grid) || grid.length !== 7) {
    return NextResponse.json({ error: "Invalid grid format" }, { status: 400 });
  }

  // Delete existing slots for this mommy
  await supabase.from("availability_slots").delete().eq("mommy_id", user!.id);

  // Insert enabled slots
  const rows: {
    mommy_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }[] = [];

  for (let day = 0; day < 7; day++) {
    for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
      if (grid[day]?.[slotIdx]) {
        rows.push({
          mommy_id: user!.id,
          day_of_week: day,
          start_time: SLOT_TIMES[slotIdx].start,
          end_time: SLOT_TIMES[slotIdx].end,
          is_available: true,
        });
      }
    }
  }

  if (rows.length > 0) {
    await supabase.from("availability_slots").insert(rows);
  }

  return NextResponse.json({ success: true });
}
