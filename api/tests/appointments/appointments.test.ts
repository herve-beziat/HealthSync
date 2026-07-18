import { describe, expect, it, beforeAll, afterAll } from "vitest";
import app from "../../src/index.js";
import { prisma } from "../../src/utils/prisma.js";
import argon2 from "argon2";

describe("Appointments CRUD Endpoints", () => {
    const patientData = {
        firstname: "Alice",
        lastname: "Smith",
        email: "alice.smith@example.com",
        phone: "0601020304",
        date_of_birth: "1990-01-01",
        role: "patient",
        password_hash: "hash_patient",
    }

    const doctorData = {
        firstname: "Bob",
        lastname: "Johnson",
        email: "bob.johnson@example.com",
        phone: "0601020305",
        date_of_birth: "1985-05-15",
        role: "doctor",
        password_hash: "hash_doctor",
    }

    const adminData = {
        firstname: "Admin",
        lastname: "User",
        email: "admin.user@example.com",
        phone: "0601020306",
        date_of_birth: "1980-01-01",
        role: "admin",
        password_hash: "hash_admin",
    }

    const specialtyData = {
        name: "Cardiology",
    }

    const scheduleData = {
        doctor_id: "",
        day_of_week: 1, // Lundi
        start_time: "09:00",
        end_time: "17:00",
        slot_duration: 30,
    }    

    const appointmentData = {
        doctor_id: "",
        patient_id: "",
        start_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        end_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        status: "scheduled",
    }

    let patientId: string;
    let doctorId: string;
    let adminId: string;
    let specialtyId: number;
    let scheduleId: number;
    let appointmentId: number;
    let patientToken: string;
    let doctorToken: string;
    let adminToken: string;

    beforeAll(async () => {
        await prisma.appointments.deleteMany({});
        await prisma.doctor_schedules.deleteMany({});
        await prisma.users.deleteMany({});
        await prisma.specialties.deleteMany({});
        await prisma.doctor_specialties.deleteMany({});
        await prisma.refresh_tokens.deleteMany({});
    })
    // Fonction a testée
    // Ajout d'un rendez-vous (patient)
    // Modification du status par le docteur, status et horraire
    // Suppresion par le patient (annulée)
    // tentative d'ajout sur un creneaux deja occupeé.
})