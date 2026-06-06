export interface DashboardData {
  organizationId: string;
  generatedAt: string;
  summary: {
    eventsCaptured: number;
    openTasks: number;
    activities: number;
    totalAttendees: number;
    donations: number;
    donationAmount: number;
    accompaniedProfiles: number;
  };
  rawEvents: RawEventItem[];
  tasks: TaskItem[];
  activities: ActivityItem[];
  campaigns: CampaignItem[];
  donations: DonationItem[];
  accompaniments: AccompanimentCampaign[];
}

export interface RawEventItem {
  id: string;
  content_text: string | null;
  detected_intent: string | null;
  status: string | null;
  is_deferred: boolean;
  received_at: string | null;
  created_at: string;
  sender_member_id: string | null;
  sender_contact_id: string | null;
}

export interface TaskItem {
  id: string;
  title: string | null;
  description: string | null;
  assignee_member_id: string | null;
  assignee_name: string;
  due_date: string | null;
  status: string;
  task_type: string | null;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  title: string | null;
  location: string | null;
  attendees_count: number | null;
  volunteers_count: number | null;
  program_id: string | null;
  program_name: string;
  occurred_at: string | null;
  status: string;
  is_deferred: boolean;
  qualitative_notes: string | null;
  created_at: string;
}

export interface CampaignItem {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  current_amount: number;
  goal_amount: number | null;
  currency: string;
  status: string;
  updated_at: string;
}

export interface DonationItem {
  id: string;
  campaign_id: string | null;
  campaign_name: string;
  donation_type: string;
  amount: number | null;
  currency: string;
  items: unknown;
  status: string;
  payment_link: string | null;
  created_at: string;
}

export interface AccompanimentCampaign {
  campaign_id: string;
  campaign_name: string;
  total: number;
  available: number;
  in_process: number;
  accompanied: number;
  committed_amount: number;
  promised_goods: string[];
  items: AccompanimentItem[];
}

export interface AccompanimentItem {
  beneficiary_id: string;
  match_id: string | null;
  status: "disponible" | "en proceso" | "acompañado";
  helper_label: string | null;
  modality: "dinero" | "especie" | null;
  reserved_until: string | null;
  confirmed_at: string | null;
  safe_profile: SafeProfile;
}

export interface SafeProfile {
  campaign_id: string | null;
  label: string;
  neighborhood: string;
  composition: string;
  primary_need: string;
  suggested_amount: number | null;
  goods_suggestion: string | null;
  sort_order: number;
}

export async function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  const res = await fetch("/api/dashboard", { signal });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Error ${res.status}`);
  }
  return (await res.json()) as DashboardData;
}
