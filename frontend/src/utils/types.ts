/** Rental details entered by the user on the Rental Details screen. */
export interface RentalDetails {
  suburb: string;
  weeklyRent: string;
  listingSource: string;
  viewedInPerson: boolean | null;
  paymentBeforeViewing: boolean | null;
}

/** Answers from the Quick Check warning-sign questions. */
export interface QuickCheckAnswers {
  pressuredToPay: boolean | null;
  noWrittenAgreement: boolean | null;
  unregulatedSource: boolean | null;
  unusuallyLowRent: boolean | null;
}

/** A single risk signal with explanation and recommended action. */
export interface RiskSignal {
  label: string;
  concern: "high" | "review";
  explanation: string;
  action: string;
}

/** The complete risk assessment result. */
export interface RiskResult {
  level: "low" | "review" | "high";
  headline: string;
  signals: RiskSignal[];
}

/** A single verification action in the verification plan. */
export interface VerificationAction {
  id: string;
  label: string;
  completed: boolean;
  isEssential: boolean;
}

/** A saved risk-check record returned by the backend (RiskCheckResponse). */
export interface RiskCheckRecord {
  id: string;
  user_id: string;
  suburb: string;
  weekly_rent: string;
  listing_source: string;
  viewed_in_person: boolean;
  payment_before_viewing: boolean;
  pressured_to_pay: boolean;
  no_written_agreement: boolean;
  unregulated_source: boolean;
  unusually_low_rent: boolean;
  risk_level: string;
  risk_signals: Record<string, unknown> | null;
  verification_actions: unknown[] | null;
  evidence_note: string | null;
  created_at: string;
}

/** Save state of the current risk check shown on the Confirmation screen. */
export type SaveStatus = "idle" | "saving" | "saved" | "error" | "demo";

/** Props passed to the Login page from App.tsx. */
export interface LoginPageProps {
  onComplete: (data: { email: string }) => void;
}

/** Props passed to the Rental Details page from App.tsx. */
export interface RentalDetailsPageProps {
  initialData: RentalDetails;
  onComplete: (data: RentalDetails) => void;
}

/** Props passed to the Quick Check page from App.tsx. */
export interface QuickCheckPageProps {
  initialData: QuickCheckAnswers;
  onComplete: (data: QuickCheckAnswers) => void;
}

/** Props passed to the Risk Result page from App.tsx. */
export interface RiskResultPageProps {
  riskResult: RiskResult;
  onContinue: () => void;
}

/** Props passed to the Verification Plan page from App.tsx. */
export interface VerificationPlanPageProps {
  actions: VerificationAction[];
  evidenceNote: string;
  onComplete: (actions: VerificationAction[], evidenceNote: string) => void;
}

/** Props passed to the Confirmation page from App.tsx. */
export interface ConfirmationPageProps {
  riskResult: RiskResult;
  verificationActions: VerificationAction[];
  rentalDetails: RentalDetails;
  onStartNew: () => void;
  saveStatus: SaveStatus;
  saveMessage: string;
  savedChecks: RiskCheckRecord[];
  onRetrySave: () => void;
}
