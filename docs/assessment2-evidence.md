# RentShield — Assessment 2 Evidence: Component Reuse & Ethics

This document is derived exclusively from the actual current project code in this repository. Where a claim cannot be verified from the code, the phrase **"not confirmed in the current code"** is used instead of guessing.

---

## 1. Component Reuse Table

| Component | File | Number of screens using it | Screens |
|---|---|---|---|
| **PrimaryButton** | `frontend/src/components/ui/PrimaryButton.tsx` | 2 | LoginPage, ConfirmationPage |
| **FormSection** | `frontend/src/components/ui/FormSection.tsx` | 5 | LoginPage, RentalDetailsPage, QuickCheckPage, RiskResultPage, VerificationPlanPage |
| **TextInput** | `frontend/src/components/ui/TextInput.tsx` | 3 | LoginPage, RentalDetailsPage, VerificationPlanPage |
| **ArrowButton** | `frontend/src/components/ui/ArrowButton.tsx` | 4 | RentalDetailsPage, QuickCheckPage, RiskResultPage, VerificationPlanPage |
| **PrivacyNotice** | `frontend/src/components/ui/PrivacyNotice.tsx` | 5 | LoginPage, RentalDetailsPage, QuickCheckPage, VerificationPlanPage, ConfirmationPage |
| **YesNoButton** | `frontend/src/components/ui/YesNoButton.tsx` | 2 | RentalDetailsPage, QuickCheckPage |

---

## 2. Exact Screens Where Each Component Is Used

### PrimaryButton
- **LoginPage.tsx** — "Sign In" / "Create Account" submit button (`type="submit"`, `loading`, `loadingText`), and "Enter Demo" button (`variant="secondary"`).
- **ConfirmationPage.tsx** — "Try Again" retry button (`variant="secondary"`), and "Start New Check" button (`variant="secondary"`).

### FormSection
- **LoginPage.tsx** — wraps the email/password form with eyebrow "Step 1 of 5".
- **RentalDetailsPage.tsx** — wraps the rental details form with eyebrow "Step 2 of 5".
- **QuickCheckPage.tsx** — wraps the four warning-sign questions with eyebrow "Step 3 of 5".
- **RiskResultPage.tsx** — wraps the risk-level badge with eyebrow "Step 4 of 5".
- **VerificationPlanPage.tsx** — wraps the action checkboxes with eyebrow "Step 5 of 5".

### TextInput
- **LoginPage.tsx** — 2 instances: email field (`type="email"`) and password field (`type="password"` with `hint`).
- **RentalDetailsPage.tsx** — 2 instances: suburb field and weekly rent field (`type="number"` with `hint`).
- **VerificationPlanPage.tsx** — 1 instance: evidence note field (`multiline`).

### ArrowButton
- **RentalDetailsPage.tsx** — "Continue to quick check" (`onClick={handleSubmit}`).
- **QuickCheckPage.tsx** — "See my risk result" (`onClick={handleSubmit}`).
- **RiskResultPage.tsx** — "Continue to verification plan" (`variant="secondary"`, `onClick={onContinue}`).
- **VerificationPlanPage.tsx** — "Complete safety check" / "See my result (incomplete)" (`onClick={() => onComplete(localActions, note)}`).

### PrivacyNotice
- **LoginPage.tsx** — email authentication and account-linked saved checks notice.
- **RentalDetailsPage.tsx** — risk-screening and possible saving notice.
- **QuickCheckPage.tsx** — risk-screening and possible saving notice.
- **VerificationPlanPage.tsx** — evidence note saved with risk check notice (with sensitive-data warning).
- **ConfirmationPage.tsx** — saved checks associated with account and stored in Supabase notice.

### YesNoButton
- **RentalDetailsPage.tsx** — 4 instances: Yes/No pairs for "Have you viewed this property in person?" and "Were you asked to pay before viewing?".
- **QuickCheckPage.tsx** — 8 instances: Yes/No pairs for each of the four warning-sign questions (pressured to pay, no written agreement, unregulated source, unusually low rent).

---

## 3. ArrowButton Props — Full Detail

Source: `frontend/src/components/ui/ArrowButton.tsx` (adapted from 21st.dev Origin UI).

| Prop | TypeScript Type | Default Value | Where RentShield passes it | Effect |
|---|---|---|---|---|
| `children` | `React.ReactNode` | *(required)* | All 4 screens — the button label text ("Continue to quick check", "See my risk result", etc.) | Renders as the button's visible text content, placed before the arrow icon. |
| `onClick` | `() => void` | `undefined` | All 4 screens — e.g. `handleSubmit`, `onContinue`, or `onComplete` | Invoked when the user clicks the button. Drives form submission or navigation. |
| `disabled` | `boolean` | `false` | **Not passed** by any current screen (not confirmed in the current code) | When `true`, the button is non-interactive, styled with `cursor-not-allowed opacity-60`, and uses muted colors. |
| `variant` | `"primary" \| "secondary"` | `"primary"` | RiskResultPage passes `variant="secondary"`; other 3 screens omit it (default `primary`). | `primary`: solid dark-navy background (`#1B2A4A`). `secondary`: outlined teal border (`#2A9D8F`) with transparent background. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | **Not passed** by any current screen (not confirmed in the current code) | Sets the HTML `type` attribute of the `<button>` element. |
| `className` | `string` | `""` | **Not passed** by any current screen (not confirmed in the current code) | Appends additional Tailwind CSS classes to the button element. |

---

## 4. How the 21st.dev / Origin UI ArrowButton Was Integrated

The **ArrowButton** component (`frontend/src/components/ui/ArrowButton.tsx`) is adapted from the **21st.dev Origin UI "Button with animated arrow"** community component.

**Source:** `https://21st.dev/community/components/originui/button/button-with-animated-arrow`

**Integration approach:**
1. The component was **rewritten as a local React component** in `frontend/src/components/ui/ArrowButton.tsx` — it is not installed as a package dependency. The `lucide-react` `ArrowRight` icon provides the animated arrow.
2. The arrow icon uses Tailwind's `group-hover:translate-x-0.5` utility to shift 0.5rem right on hover, wrapped in a `group` class on the `<button>` element. This replicates the original 21st.dev hover animation.
3. The component is tagged in the DOM with `data-component="21st-dev-arrow-button"` for traceability, as documented in the source comment.
4. The visual styling (colors, border radius, focus rings) was **customised to the RentShield design system** (navy `#1B2A4A` primary, teal `#2A9D8F` secondary) rather than using the original Origin UI default styles.
5. The component accepts RentShield-specific props (`variant`, `disabled`, `type`, `className`) that extend the original 21st.dev API while preserving the animated-arrow behaviour.

---

## 5. Field-Specific Ethics Table

| Field | What it captures | Ethical consideration | Code handling |
|---|---|---|---|
| **Suburb** | Geographic location of the rental property | Location data can indirectly identify a person. Users are asked for the suburb of a property they are *considering*, not their home address. | Collected via `TextInput` (RentalDetailsPage). Stored as `suburb varchar(120)` in `risk_checks`. `PrivacyNotice` on RentalDetailsPage discloses saving. |
| **Weekly rent** | Asking price of the rental | Financial information. The threshold for "unusually low" ($150/week) is a hard-coded heuristic that may not reflect all Victorian markets. | Collected via `TextInput type="number"` (RentalDetailsPage). Checked against `LOW_RENT_THRESHOLD = 150` in `riskCalculator.ts`. |
| **Listing source** | Platform where the listing was found (Domain, realestate.com.au, Facebook Marketplace, Gumtree, WeChat, Other) | Could reflect a user's socio-economic circumstances or platform preferences. The unregulated-source rule may stigmatise certain platforms. | Collected via `<select>` dropdown (RentalDetailsPage). Unregulated sources checked in `riskCalculator.ts` against `["Facebook Marketplace", "Gumtree", "WeChat", "Other"]`. |
| **Payment-before-viewing answer** | Whether payment was requested before inspecting the property (Yes/No) | Sensitive — indicates the user may have been targeted by a scam. Answering "Yes" triggers a **high-concern** signal. | Collected via `YesNoButton` (RentalDetailsPage). Maps to `paymentBeforeViewing` → `payment_before_viewing` column. |
| **Pressure-to-pay answer** | Whether the user felt pressured to pay quickly (Yes/No) | Sensitive — indicates potential coercion or exploitation. Answering "Yes" triggers a **high-concern** signal. | Collected via `YesNoButton` (QuickCheckPage). Maps to `pressuredToPay` → `pressured_to_pay` column. |
| **Written-agreement answer** | Whether a written lease/agreement exists (Yes/No) | Sensitive — indicates legal vulnerability. Answering "No" triggers a **high-concern** signal. | Collected via `YesNoButton` (QuickCheckPage). Maps to `noWrittenAgreement` → `no_written_agreement` column. |
| **Risk signals** | Structured list of triggered warning signs with explanations and recommended actions | Transparent and rule-based — each signal includes a plain-English explanation and actionable advice. No black-box scoring. | Generated by `calculateRisk()` in `riskCalculator.ts`. Stored as `risk_signals jsonb`. Displayed in RiskResultPage with full explanations. |
| **Verification actions** | Checklist of safety actions (inspect property, get written agreement, verify landlord, etc.) | Empowers users to take protective action. Essential vs. non-essential labels help users prioritise. | Generated by `generateVerificationActions()` in `riskCalculator.ts`. Stored as `verification_actions jsonb`. Displayed as checkboxes in VerificationPlanPage. |
| **Evidence note** | Free-text note by the user about what they have verified | Could contain highly sensitive personal information. The UI warns users not to enter names, phone numbers, passwords, or bank details. | Collected via `TextInput multiline` (VerificationPlanPage). Stored as `evidence_note varchar(4000)`. `PrivacyNotice` and `hint` both warn against sensitive data. Max length 4000 chars enforced by Pydantic `RiskCheckCreate`. |
| **User ID and timestamp** | `user_id` (Supabase Auth UUID) and `created_at` (auto-generated timestamp) | Identity linkage is necessary for account-scoped saved checks. The timestamp enables history ordering. No additional personal metadata is collected. | `user_id` is set server-side from the verified Bearer token (`current_user["id"]` in `backend/main.py`), **never from the request body**. `created_at` is auto-generated by Postgres `default now()`. |

---

## 6. Privacy, False-Positive, Data-Minimisation and Security Decisions

### Privacy
- **PrivacyNotice component** is shown on all five data-collection screens (Login, Rental Details, Quick Check, Verification Plan, Confirmation) with truthful, context-specific messages.
- The misleading "stored locally" claim in VerificationPlanPage was **corrected** to accurately state that the evidence note is saved with the risk check and associated with the user's account.
- Users are explicitly warned not to enter names, phone numbers, passwords, bank details, or other sensitive personal information in the evidence note.
- The app's footer disclaimer (App.tsx) states it is a student prototype that does not provide legal advice, authenticate landlords, or guarantee listing accuracy.

### False Positives
- The risk calculator uses **fixed, transparent rules** — not machine learning or opaque scoring. Each signal has a clear explanation so users understand *why* a flag was raised.
- The "How this result is calculated" section on RiskResultPage explicitly states the result is **not proof of fraud** and should not replace due diligence or professional guidance.
- Duplicate signals are deduplicated: if both the listing-source dropdown and the Quick Check question flag an unregulated source, only one signal is created (`riskCalculator.ts` lines 101–116).
- The low-rent threshold ($150/week) is documented in the code as a heuristic based on typical shared-room listings, acknowledging it may not reflect all markets.

### Data Minimisation
- Only fields necessary for the risk screening are collected: suburb, rent, listing source, and six boolean answers. No phone numbers, full addresses, landlord names, or financial account details are requested.
- The evidence note is optional (`Optional[str]` in `RiskCheckCreate`).
- The `user_id` is derived from the authentication token server-side — it is never accepted from the client request body, preventing identity spoofing.
- The frontend never stores Supabase API keys — only the user's session token in `localStorage` (`rentshield.session`).

### Security
- **Authentication:** All risk-check endpoints require a valid Bearer token verified via Supabase Auth (`verify_token()` in `backend/supabase_client.py`).
- **Token handling:** The `verify_token()` function catches all exceptions and raises a generic `TokenVerificationError` — internal error details (which could contain credentials) are never exposed.
- **Secrets:** Supabase credentials are loaded from environment variables only. `.env` is in `.gitignore`. No secrets are logged. The `logger.exception()` call in `create_risk_check()` logs only `user_id`, never the payload, token, or key.
- **RLS:** The Supabase client prefers `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS for trusted server). The SQL migration includes RLS policies (`auth.uid() = user_id`) for defense-in-depth if the anon key is ever used.
- **Input validation:** Pydantic models enforce `min_length` and `max_length` on all string fields and type constraints on booleans, preventing oversized or malformed data from reaching the database.

---

## 7. Disclaimer

> **The RentShield risk result is a screening indicator only. It is not proof of fraud and does not constitute legal advice.** The assessment is based entirely on the user's own answers, checked against fixed, transparent rules. It should not replace independent due diligence, professional legal guidance, or verification through official channels (e.g. Consumer Affairs Victoria, the Residential Tenancies Bond Authority, or a licensed real estate agent).