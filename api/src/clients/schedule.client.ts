import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "../../../grpc-service/proto/schedule.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Chargement dynamique du .proto : typage exact du package non connu à la
// compilation, d'où le `any` ici (limité à ce point d'entrée précis).
const scheduleProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface ScheduleEntry {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

/**
 * Client gRPC vers le service Schedules (grpc-service).
 * Récupère le planning récurrent d'un médecin.
 * Destiné à être utilisé par le futur module Rendez-vous pour vérifier
 * la disponibilité d'un médecin avant de confirmer une réservation.
 */
export const getDoctorSchedule = (
  doctorId: string,
  address: string = process.env.GRPC_SCHEDULE_SERVICE_URL || "localhost:50051",
): Promise<ScheduleEntry[]> => {
  return new Promise((resolve, reject) => {
    const client = new scheduleProto.healthsync.schedules.ScheduleService(
      address,
      grpc.credentials.createInsecure(),
    );

    client.GetDoctorSchedule(
      { doctor_id: doctorId },
      (error: grpc.ServiceError | null, response: { schedules: ScheduleEntry[] }) => {
        client.close();
        if (error) {
          return reject(error);
        }
        resolve(response.schedules);
      },
    );
  });
};
