"use client";

export function MommyPayoutButton() {
  return (
    <div className="p-5 rounded-2xl bg-smoke border border-champagne/20 text-body-sm text-ivory/60 leading-relaxed">
      Earnings are processed manually every two weeks.{" "}
      <a
        href="mailto:payouts@replymommy.com?subject=Payout Request"
        className="text-champagne underline"
      >
        Email payouts@replymommy.com
      </a>{" "}
      with your earnings ID to request a transfer.
    </div>
  );
}
