import { InvitationForm } from "@/components/auth/invitation-form";

export default function InvitePage() {
  return (
    <div className="space-y-10 text-center">
      <div className="space-y-4">
        <div className="text-label text-champagne">Step 01</div>
        <h1 className="text-display-lg text-ivory">
          You were
          <br />
          <span className="italic text-champagne">invited.</span>
        </h1>
        <p className="text-body-md text-ivory/60 max-w-sm mx-auto">
          Enter your code.
        </p>
      </div>
      <InvitationForm />
    </div>
  );
}
