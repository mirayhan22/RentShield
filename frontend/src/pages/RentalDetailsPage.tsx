import { useState } from "react";
import type { RentalDetailsPageProps, RentalDetails } from "../utils/types";
import FormSection from "../components/ui/FormSection";
import TextInput from "../components/ui/TextInput";
import ArrowButton from "../components/ui/ArrowButton";

/**
 * Rental details form: suburb, weekly rent, listing source,
 * viewed in person, payment before viewing.
 * Uses: FormSection, TextInput, ArrowButton
 */
export default function RentalDetailsPage({
  initialData,
  onComplete,
}: RentalDetailsPageProps) {
  const [suburb, setSuburb] = useState(initialData.suburb);
  const [weeklyRent, setWeeklyRent] = useState(initialData.weeklyRent);
  const [listingSource, setListingSource] = useState(initialData.listingSource);
  const [viewedInPerson, setViewedInPerson] = useState<boolean | null>(
    initialData.viewedInPerson
  );
  const [paymentBeforeViewing, setPaymentBeforeViewing] = useState<boolean | null>(
    initialData.paymentBeforeViewing
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!suburb.trim()) newErrors.suburb = "Suburb is required";
    if (!weeklyRent.trim()) {
      newErrors.weeklyRent = "Weekly rent is required";
    } else {
      const rentNum = parseFloat(weeklyRent);
      if (isNaN(rentNum) || rentNum <= 0) {
        newErrors.weeklyRent = "Please enter a valid rent amount";
      }
    }
    if (!listingSource) newErrors.listingSource = "Please select a listing source";
    if (viewedInPerson === null)
      newErrors.viewedInPerson = "Please answer this question";
    if (paymentBeforeViewing === null)
      newErrors.paymentBeforeViewing = "Please answer this question";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (validate()) {
      const data: RentalDetails = {
        suburb: suburb.trim(),
        weeklyRent: weeklyRent.trim(),
        listingSource,
        viewedInPerson,
        paymentBeforeViewing,
      };
      onComplete(data);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FormSection
        eyebrow="Step 2 of 5"
        title="Rental details"
        description="Enter the details of the property you are considering. This helps us assess the risk level."
      >
        <div className="flex flex-col gap-4">
          <TextInput
            id="rental-suburb"
            label="Suburb"
            value={suburb}
            onChange={(val) => {
              setSuburb(val);
              if (errors.suburb) setErrors((p) => ({ ...p, suburb: "" }));
            }}
            placeholder="e.g. Carlton, Footscray, Bendigo"
            error={errors.suburb}
            required
          />

          <TextInput
            id="rental-weekly-rent"
            label="Weekly rent (AUD)"
            value={weeklyRent}
            onChange={(val) => {
              setWeeklyRent(val);
              if (errors.weeklyRent) setErrors((p) => ({ ...p, weeklyRent: "" }));
            }}
            type="number"
            placeholder="e.g. 250"
            hint="Enter the amount in Australian dollars per week"
            error={errors.weeklyRent}
            required
          />

          {/* Listing source dropdown */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="listing-source"
              className="text-sm font-medium text-[#1B2A4A]"
            >
              Where did you find this listing?
              <span className="ml-1 text-[#E76F51]" aria-label="required">
                *
              </span>
            </label>
            <select
              id="listing-source"
              value={listingSource}
              onChange={(e) => {
                setListingSource(e.target.value);
                if (errors.listingSource)
                  setErrors((p) => ({ ...p, listingSource: "" }));
              }}
              className={`w-full rounded-lg border px-4 py-3 text-sm text-[#1B2A4A] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/40 ${
                errors.listingSource
                  ? "border-[#E76F51] bg-red-50"
                  : "border-[#D1D5DB] bg-white hover:border-[#9CA3AF]"
              }`}
            >
              <option value="">Select a source</option>
              <option value="Domain">Domain</option>
              <option value="realestate.com.au">realestate.com.au</option>
              <option value="Real Estate Agent">Real Estate Agent</option>
              <option value="Facebook Marketplace">Facebook Marketplace</option>
              <option value="Gumtree">Gumtree</option>
              <option value="WeChat">WeChat</option>
              <option value="Other">Other</option>
            </select>
            {errors.listingSource && (
              <p className="text-xs font-medium text-[#E76F51]" role="alert">
                {errors.listingSource}
              </p>
            )}
          </div>

          {/* Yes/No toggle: Viewed in person? */}
          <div
            className={`flex flex-col gap-1.5 rounded-lg border p-3 transition-colors duration-150 ${
              errors.viewedInPerson
                ? "border-[#E76F51] bg-red-50"
                : "border-transparent bg-transparent"
            }`}
          >
            <span className="text-sm font-medium text-[#1B2A4A]">
              Have you viewed this property in person?
              <span className="ml-1 text-[#E76F51]" aria-label="required">
                *
              </span>
            </span>
            <div className="flex gap-3">
              <YesNoButton
                label="Yes"
                selected={viewedInPerson === true}
                onClick={() => {
                  setViewedInPerson(true);
                  if (errors.viewedInPerson)
                    setErrors((p) => ({ ...p, viewedInPerson: "" }));
                }}
              />
              <YesNoButton
                label="No"
                selected={viewedInPerson === false}
                onClick={() => {
                  setViewedInPerson(false);
                  if (errors.viewedInPerson)
                    setErrors((p) => ({ ...p, viewedInPerson: "" }));
                }}
              />
            </div>
            {errors.viewedInPerson && (
              <p className="text-xs font-medium text-[#E76F51]" role="alert">
                {errors.viewedInPerson}
              </p>
            )}
          </div>

          {/* Yes/No toggle: Payment before viewing? */}
          <div
            className={`flex flex-col gap-1.5 rounded-lg border p-3 transition-colors duration-150 ${
              errors.paymentBeforeViewing
                ? "border-[#E76F51] bg-red-50"
                : "border-transparent bg-transparent"
            }`}
          >
            <span className="text-sm font-medium text-[#1B2A4A]">
              Were you asked to pay before viewing?
              <span className="ml-1 text-[#E76F51]" aria-label="required">
                *
              </span>
            </span>
            <div className="flex gap-3">
              <YesNoButton
                label="Yes"
                selected={paymentBeforeViewing === true}
                onClick={() => {
                  setPaymentBeforeViewing(true);
                  if (errors.paymentBeforeViewing)
                    setErrors((p) => ({ ...p, paymentBeforeViewing: "" }));
                }}
              />
              <YesNoButton
                label="No"
                selected={paymentBeforeViewing === false}
                onClick={() => {
                  setPaymentBeforeViewing(false);
                  if (errors.paymentBeforeViewing)
                    setErrors((p) => ({ ...p, paymentBeforeViewing: "" }));
                }}
              />
            </div>
            {errors.paymentBeforeViewing && (
              <p className="text-xs font-medium text-[#E76F51]" role="alert">
                {errors.paymentBeforeViewing}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <ArrowButton onClick={handleSubmit}>Continue to quick check</ArrowButton>
    </div>
  );
}

/** Simple Yes/No toggle button */
function YesNoButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
        selected
          ? "border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#2A9D8F]"
          : "border-[#D1D5DB] bg-white text-[#6B7280] hover:border-[#9CA3AF]"
      }`}
    >
      {label}
    </button>
  );
}