import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { getDoctorSchedule } from "./schedule.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "../proto/schedule.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Chargement dynamique du .proto : le typage exact du package généré
// n'est pas connu à la compilation, d'où le `any` ici (limité à ce point
// d'entrée précis).
const scheduleProto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();

server.addService(scheduleProto.healthsync.schedules.ScheduleService.service, {
  GetDoctorSchedule: async (
    call: grpc.ServerUnaryCall<{ doctor_id: string }, unknown>,
    callback: grpc.sendUnaryData<{ schedules: unknown[] }>,
  ) => {
    try {
      const schedules = await getDoctorSchedule(call.request.doctor_id);
      callback(null, { schedules });
    } catch (error) {
      console.error("GetDoctorSchedule error:", error);
      callback({
        code: grpc.status.INTERNAL,
        message: "Failed to retrieve doctor schedule",
      });
    }
  },
});

const PORT = process.env.GRPC_PORT || "50051";

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error("Failed to bind gRPC server:", err);
    process.exit(1);
  }
  console.log(`gRPC ScheduleService listening on port ${port}`);
});
