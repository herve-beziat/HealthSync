import { Context } from "hono";
import { DoctorScheduleSchema } from "./doctor_schedules.dto.js";
import * as scheduleService from "./doctor_schedules.service.js";
import { Prisma } from "@prisma/client";
import { canUpdateDoctor } from "../../utils/user.js";

export const getSchedulesByDoctor = async (c: Context) => {
  const doctorId = c.req.param("doctorId");
  if (!doctorId) return c.json({ error: "Doctor not found" }, 404);
  try {
    const schedules = await scheduleService.getSchedulesByDoctorId(doctorId);
    return c.json({ schedules }, 200);
  } catch (error) {
    return c.json({ error: "Failed to retrieve doctor schedules" }, 500);
  }
};

export const createSchedule = async (c: Context) => {
  try {
    const body = await c.req.json();
    const parsed = DoctorScheduleSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const schedule = await scheduleService.createSchedule(parsed.data);
    return c.json({ schedule }, 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return c.json(
        { error: "Doctor not found (Foreign key constraint failed)" },
        400,
      );
    }
    return c.json({ error: "Failed to create doctor schedule" }, 500);
  }
};

export const updateSchedule = async (c: Context) => {
  const id = parseInt(c.req.param("id")!);
  if (isNaN(id)) {
    return c.json({ error: "Invalid schedule ID" }, 400);
  }
  try {
    const body = await c.req.json();
    const parsed = DoctorScheduleSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }

    const schedule = await scheduleService.createSchedule(parsed.data);
    return c.json({ schedule }, 200);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: "Schedule not found" }, 404);
    }
    console.error("Error updating schedule:", error);
    return c.json({ error: "Failed to update doctor schedule" }, 500);
  }
};

export const deleteSchedule = async (c: Context) => {
  const id = parseInt(c.req.param("id")!);

  if (isNaN(id)) {
    return c.json({ error: "Invalid schedule ID" }, 400);
  }

  try {
    const schedule = await scheduleService.deleteSchedule(id);
    return c.json({ message: "Schedule deleted successfully", schedule }, 200);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: "Schedule not found" }, 404);
    }
    return c.json({ error: "Failed to delete schedule" }, 500);
  }
};
