import { supabase, isSupabaseConfigured } from "../supabase";
import {
  DbPatientProfile,
  DbMedicalRecord,
  DbLabObservation,
  DbPrescription,
  DbAllergy,
  DbConsultation,
  DbConsentRecord,
  DbAccessRequest,
  DbEmergencyContact,
  DbEmergencyLog,
  DbNotification,
  DbProviderCredential,
} from "./types";

/**
 * In-memory fallback for server-side Next.js routes (where window is undefined)
 * and localStorage for client-side offline persistence.
 */
const SERVER_MEMORY_STORE = new Map<string, any>();

function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return SERVER_MEMORY_STORE.has(key) ? (SERVER_MEMORY_STORE.get(key) as T) : fallback;
  }
  try {
    const raw = localStorage.getItem(`saathi_db_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    SERVER_MEMORY_STORE.set(key, value);
    return;
  }
  try {
    localStorage.setItem(`saathi_db_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[LocalStore] Failed to write ${key}:`, err);
  }
}

// =============================================================================
// 1. PATIENT PROFILES
// =============================================================================
export const patientService = {
  async getProfile(didOrWallet: string): Promise<DbPatientProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("patient_profiles")
          .select("*")
          .or(`did.eq.${didOrWallet},wallet_address.eq.${didOrWallet}`)
          .maybeSingle();

        if (!error && data) return data as DbPatientProfile;
      } catch (err) {
        console.warn("[PatientService] Supabase read failed, checking local:", err);
      }
    }
    const local = getLocalItem<DbPatientProfile | null>("patient_profile", null);
    if (local && (local.did === didOrWallet || local.wallet_address.toLowerCase() === didOrWallet.toLowerCase())) {
      return local;
    }
    return null;
  },

  async upsertProfile(profile: DbPatientProfile): Promise<DbPatientProfile> {
    setLocalItem("patient_profile", profile);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("patient_profiles")
          .upsert(profile, { onConflict: "did" })
          .select()
          .single();

        if (!error && data) return data as DbPatientProfile;
      } catch (err) {
        console.warn("[PatientService] Supabase upsert error:", err);
      }
    }
    return profile;
  },
};

// =============================================================================
// 2. MEDICAL RECORDS
// =============================================================================
export const recordService = {
  async getRecords(patientDid: string): Promise<DbMedicalRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("medical_records")
          .select("*")
          .eq("patient_did", patientDid)
          .order("date_of_record", { ascending: false });

        if (!error && data && data.length > 0) return data as DbMedicalRecord[];
      } catch (err) {
        console.warn("[RecordService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbMedicalRecord[]>("medical_records", []);
  },

  async createRecord(record: DbMedicalRecord): Promise<DbMedicalRecord> {
    const localList = getLocalItem<DbMedicalRecord[]>("medical_records", []);
    const withId = { ...record, id: record.id || `rec-${Date.now()}` };
    setLocalItem("medical_records", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("medical_records")
          .insert(record)
          .select()
          .single();

        if (!error && data) return data as DbMedicalRecord;
      } catch (err) {
        console.warn("[RecordService] Supabase insert failed:", err);
      }
    }
    return withId;
  },

  async deleteRecord(recordId: string): Promise<boolean> {
    const localList = getLocalItem<DbMedicalRecord[]>("medical_records", []);
    setLocalItem("medical_records", localList.filter((r) => r.id !== recordId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("medical_records").delete().eq("id", recordId);
        return true;
      } catch (err) {
        console.warn("[RecordService] Supabase delete failed:", err);
      }
    }
    return true;
  },

  async uploadFile(file: File, path: string): Promise<string | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from("medical-records")
          .upload(path, file, { upsert: true });

        if (!error && data) return data.path;
      } catch (err) {
        console.warn("[RecordService] Storage upload failed:", err);
      }
    }
    return `local-storage://${path}`;
  },
};

// =============================================================================
// 3. LAB OBSERVATIONS
// =============================================================================
export const labService = {
  async getObservations(patientDid: string): Promise<DbLabObservation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("lab_observations")
          .select("*")
          .eq("patient_did", patientDid)
          .order("observed_at", { ascending: false });

        if (!error && data && data.length > 0) return data as DbLabObservation[];
      } catch (err) {
        console.warn("[LabService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbLabObservation[]>("lab_observations", []);
  },

  async createObservation(obs: DbLabObservation): Promise<DbLabObservation> {
    const localList = getLocalItem<DbLabObservation[]>("lab_observations", []);
    const withId = { ...obs, id: obs.id || `lab-${Date.now()}` };
    setLocalItem("lab_observations", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("lab_observations")
          .insert(obs)
          .select()
          .single();

        if (!error && data) return data as DbLabObservation;
      } catch (err) {
        console.warn("[LabService] Supabase insert failed:", err);
      }
    }
    return withId;
  },
};

// =============================================================================
// 4. PRESCRIPTIONS
// =============================================================================
export const prescriptionService = {
  async getPrescriptions(patientDid: string): Promise<DbPrescription[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_did", patientDid)
          .order("prescribed_date", { ascending: false });

        if (!error && data && data.length > 0) return data as DbPrescription[];
      } catch (err) {
        console.warn("[PrescriptionService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbPrescription[]>("prescriptions", []);
  },

  async createPrescription(rx: DbPrescription): Promise<DbPrescription> {
    const localList = getLocalItem<DbPrescription[]>("prescriptions", []);
    const withId = { ...rx, id: rx.id || `rx-${Date.now()}` };
    setLocalItem("prescriptions", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .insert(rx)
          .select()
          .single();

        if (!error && data) return data as DbPrescription;
      } catch (err) {
        console.warn("[PrescriptionService] Supabase insert failed:", err);
      }
    }
    return withId;
  },
};

// =============================================================================
// 5. ALLERGIES
// =============================================================================
export const allergyService = {
  async getAllergies(patientDid: string): Promise<DbAllergy[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("allergies")
          .select("*")
          .eq("patient_did", patientDid);

        if (!error && data && data.length > 0) return data as DbAllergy[];
      } catch (err) {
        console.warn("[AllergyService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbAllergy[]>("allergies", []);
  },

  async createAllergy(alg: DbAllergy): Promise<DbAllergy> {
    const localList = getLocalItem<DbAllergy[]>("allergies", []);
    const withId = { ...alg, id: alg.id || `alg-${Date.now()}` };
    setLocalItem("allergies", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("allergies")
          .insert(alg)
          .select()
          .single();

        if (!error && data) return data as DbAllergy;
      } catch (err) {
        console.warn("[AllergyService] Supabase insert failed:", err);
      }
    }
    return withId;
  },
};

// =============================================================================
// 6. CONSENT RECORDS
// =============================================================================
export const consentService = {
  async getPermissions(patientWallet: string): Promise<DbConsentRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("consent_records")
          .select("*")
          .ilike("patient_wallet", patientWallet);

        if (!error && data && data.length > 0) return data as DbConsentRecord[];
      } catch (err) {
        console.warn("[ConsentService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbConsentRecord[]>("consent_records", []);
  },

  async savePermission(permit: DbConsentRecord): Promise<DbConsentRecord> {
    const localList = getLocalItem<DbConsentRecord[]>("consent_records", []);
    const filtered = localList.filter((p) => p.provider_wallet.toLowerCase() !== permit.provider_wallet.toLowerCase());
    setLocalItem("consent_records", [permit, ...filtered]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("consent_records")
          .upsert(permit, { onConflict: "patient_wallet,provider_wallet" })
          .select()
          .single();

        if (!error && data) return data as DbConsentRecord;
      } catch (err) {
        console.warn("[ConsentService] Supabase upsert failed:", err);
      }
    }
    return permit;
  },

  async revokePermission(patientWallet: string, providerWallet: string): Promise<void> {
    const localList = getLocalItem<DbConsentRecord[]>("consent_records", []);
    setLocalItem(
      "consent_records",
      localList.map((p) =>
        p.provider_wallet.toLowerCase() === providerWallet.toLowerCase()
          ? { ...p, is_active: false, valid_until: new Date().toISOString() }
          : p
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("consent_records")
          .update({ is_active: false, valid_until: new Date().toISOString() })
          .ilike("patient_wallet", patientWallet)
          .ilike("provider_wallet", providerWallet);
      } catch (err) {
        console.warn("[ConsentService] Supabase revocation update failed:", err);
      }
    }
  },
};

// =============================================================================
// 7. ACCESS REQUESTS
// =============================================================================
export const requestService = {
  async getRequests(patientDid: string): Promise<DbAccessRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("access_requests")
          .select("*")
          .eq("patient_did", patientDid)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) return data as DbAccessRequest[];
      } catch (err) {
        console.warn("[RequestService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbAccessRequest[]>("access_requests", []);
  },

  async createRequest(req: DbAccessRequest): Promise<DbAccessRequest> {
    const localList = getLocalItem<DbAccessRequest[]>("access_requests", []);
    const withId = { ...req, id: req.id || `req-${Date.now()}` };
    setLocalItem("access_requests", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("access_requests")
          .insert(req)
          .select()
          .single();

        if (!error && data) return data as DbAccessRequest;
      } catch (err) {
        console.warn("[RequestService] Supabase insert failed:", err);
      }
    }
    return withId;
  },

  async updateRequestStatus(id: string, status: "Approved" | "Rejected"): Promise<void> {
    const localList = getLocalItem<DbAccessRequest[]>("access_requests", []);
    setLocalItem("access_requests", localList.map((r) => (r.id === id ? { ...r, status } : r)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("access_requests").update({ status }).eq("id", id);
      } catch (err) {
        console.warn("[RequestService] Supabase status update failed:", err);
      }
    }
  },
};

// =============================================================================
// 8. GUARDIANS & EMERGENCY
// =============================================================================
export const emergencyService = {
  async getGuardians(patientDid: string): Promise<DbEmergencyContact[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("emergency_contacts")
          .select("*")
          .eq("patient_did", patientDid);

        if (!error && data && data.length > 0) return data as DbEmergencyContact[];
      } catch (err) {
        console.warn("[EmergencyService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbEmergencyContact[]>("emergency_contacts", []);
  },

  async addGuardian(guardian: DbEmergencyContact): Promise<DbEmergencyContact> {
    const localList = getLocalItem<DbEmergencyContact[]>("emergency_contacts", []);
    const withId = { ...guardian, id: guardian.id || `guard-${Date.now()}` };
    setLocalItem("emergency_contacts", [...localList, withId]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("emergency_contacts")
          .insert(guardian)
          .select()
          .single();

        if (!error && data) return data as DbEmergencyContact;
      } catch (err) {
        console.warn("[EmergencyService] Supabase insert failed:", err);
      }
    }
    return withId;
  },

  async removeGuardian(id: string): Promise<void> {
    const localList = getLocalItem<DbEmergencyContact[]>("emergency_contacts", []);
    setLocalItem("emergency_contacts", localList.filter((g) => g.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("emergency_contacts").delete().eq("id", id);
      } catch (err) {
        console.warn("[EmergencyService] Supabase delete failed:", err);
      }
    }
  },

  async getEmergencyLogs(patientDid: string): Promise<DbEmergencyLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("emergency_access_logs")
          .select("*")
          .eq("patient_did", patientDid)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) return data as DbEmergencyLog[];
      } catch (err) {
        console.warn("[EmergencyService] Supabase logs query failed:", err);
      }
    }
    return getLocalItem<DbEmergencyLog[]>("emergency_logs", []);
  },

  async recordBreakGlass(log: DbEmergencyLog): Promise<DbEmergencyLog> {
    const localList = getLocalItem<DbEmergencyLog[]>("emergency_logs", []);
    const withId = { ...log, id: log.id || `em-${Date.now()}` };
    setLocalItem("emergency_logs", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("emergency_access_logs")
          .insert(log)
          .select()
          .single();

        if (!error && data) return data as DbEmergencyLog;
      } catch (err) {
        console.warn("[EmergencyService] Supabase insert log failed:", err);
      }
    }
    return withId;
  },
};

// =============================================================================
// 9. NOTIFICATIONS
// =============================================================================
export const notificationService = {
  async getNotifications(recipientAddress: string): Promise<DbNotification[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .ilike("recipient_address", recipientAddress)
          .order("created_at", { ascending: false });

        if (!error && data) return data as DbNotification[];
      } catch (err) {
        console.warn("[NotificationService] Supabase query failed:", err);
      }
    }
    return getLocalItem<DbNotification[]>("notifications", []);
  },

  async sendNotification(notif: DbNotification): Promise<DbNotification> {
    const localList = getLocalItem<DbNotification[]>("notifications", []);
    const withId = { ...notif, id: notif.id || `notif-${Date.now()}` };
    setLocalItem("notifications", [withId, ...localList]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .insert(notif)
          .select()
          .single();

        if (!error && data) return data as DbNotification;
      } catch (err) {
        console.warn("[NotificationService] Supabase insert failed:", err);
      }
    }
    return withId;
  },

  async markAsRead(id: string): Promise<void> {
    const localList = getLocalItem<DbNotification[]>("notifications", []);
    setLocalItem("notifications", localList.map((n) => (n.id === id ? { ...n, is_read: true } : n)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      } catch (err) {
        console.warn("[NotificationService] Mark as read failed:", err);
      }
    }
  },
};
