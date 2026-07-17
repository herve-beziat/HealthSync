import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getDoctorSchedule } from "../../src/clients/schedule.client.js";
import { prisma } from "../../src/utils/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GRPC_TEST_PORT = "50052";
const GRPC_TEST_ADDRESS = `localhost:${GRPC_TEST_PORT}`;

const testDoctorId = "550e8400-e29b-41d4-a716-446655440099";
const testDoctorEmail = "doctor.grpc.contract@test.com";

let grpcProcess: ChildProcessWithoutNullStreams;

describe("Contract test — client REST vs ScheduleService (gRPC)", () => {
  beforeAll(async () => {
    // Nettoyage préventif
    await prisma.doctor_schedules.deleteMany({ where: { doctor_id: testDoctorId } });
    await prisma.users.deleteMany({ where: { email: testDoctorEmail } });

    // Fixture : un médecin avec un créneau récurrent le lundi 9h-12h
    await prisma.users.create({
      data: {
        id: testDoctorId,
        email: testDoctorEmail,
        password_hash: "dummy_hash",
        firstname: "Grpc",
        lastname: "ContractTest",
        phone: "0600000099",
        date_of_birth: new Date("1980-01-01"),
        role: "medecin",
      },
    });

    await prisma.doctor_schedules.create({
      data: {
        doctor_id: testDoctorId,
        day_of_week: 1,
        start_time: new Date("1970-01-01T09:00:00z"),
        end_time: new Date("1970-01-01T12:00:00z"),
        slot_duration: 30,
      },
    });

    // Démarre le vrai serveur gRPC (grpc-service) en sous-processus, branché
    // sur la base de test — pas le conteneur Docker (qui, lui, pointe sur
    // la base de dev et le port 50051, déjà occupés).
    grpcProcess = spawn("npx", ["tsx", "src/server.ts"], {
      cwd: path.resolve(__dirname, "../../../grpc-service"),
      shell: true,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        GRPC_PORT: GRPC_TEST_PORT,
      },
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("gRPC service did not start in time")),
        15000,
      );
      grpcProcess.stdout.on("data", (data) => {
        if (data.toString().includes("listening on port")) {
          clearTimeout(timeout);
          resolve();
        }
      });
      grpcProcess.stderr.on("data", (data) => {
        console.error("[grpc-service stderr]", data.toString());
      });
    });
  });

  afterAll(async () => {
    grpcProcess.kill();
    await prisma.doctor_schedules.deleteMany({ where: { doctor_id: testDoctorId } });
    await prisma.users.deleteMany({ where: { email: testDoctorEmail } });
  });

  it("should retrieve the doctor's recurring schedule via gRPC", async () => {
    const schedules = await getDoctorSchedule(testDoctorId, GRPC_TEST_ADDRESS);

    expect(schedules).toHaveLength(1);
    expect(schedules[0]).toMatchObject({
      day_of_week: 1,
      slot_duration_minutes: 30,
    });
    expect(schedules[0].start_time).toContain("09:00");
    expect(schedules[0].end_time).toContain("12:00");
  });

  it("should return an empty array for a doctor with no schedule", async () => {
    const schedules = await getDoctorSchedule(
      "00000000-0000-0000-0000-000000000000",
      GRPC_TEST_ADDRESS,
    );
    expect(schedules).toEqual([]);
  });
});
