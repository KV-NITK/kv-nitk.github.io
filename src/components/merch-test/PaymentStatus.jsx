import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPayment } from "../../api/payments";
import { itemLabel, rupees } from "./orderFormat";

const FINAL = new Set(["SUCCESS", "FAILED", "CANCELLED"]);
const POLL_MS = 3000;
const MAX_POLLS = 20; // ~1 minute, then stop and tell the user to check later


const MESSAGES = {
  SUCCESS: { title: "Payment successful", tone: "text-green-700" },
  FAILED: { title: "Payment failed", tone: "text-red-600" },
  CANCELLED: { title: "Payment cancelled", tone: "text-red-600" },
};

// Cashfree redirects here with ?order_id=...; the order id is "pay_<paymentId>"
const PaymentStatus = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order_id") || "";
  const paymentId = orderId.startsWith("pay_") ? orderId.slice(4) : "";

  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setError("Missing payment reference.");
      return;
    }

    let cancelled = false;
    let timer;
    let polls = 0;

    const check = async () => {
      try {
        const result = await getPayment(paymentId);
        if (cancelled) return;

        setPayment(result);
        setError("");

        if (FINAL.has(result.status)) {
          if (result.status === "SUCCESS") {
            localStorage.removeItem("merch_cart");
            localStorage.removeItem("merch_order");
          }
          return;
        }
      } catch (e) {
        if (cancelled) return;
        setError(e.message);
        if (e.status === 401 || e.status === 404) return;
      }

      polls += 1;

      if (polls >= MAX_POLLS) {
        setTimedOut(true);
        return;
      }

      timer = setTimeout(check, POLL_MS);
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId]);

  const final = payment && FINAL.has(payment.status);
  const message = final ? MESSAGES[payment.status] : null;

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10">
      <div className="mx-auto max-w-xl rounded border border-neutral-300 bg-white p-6">
        {error && !payment && <p className="text-red-600">{error}</p>}

        {!error && !payment && <p className="text-neutral-500">Checking your payment…</p>}

        {payment && !final && !timedOut && (
          <p className="text-neutral-600">Waiting for the payment to be confirmed…</p>
        )}

        {payment && !final && timedOut && (
          <p className="text-amber-700">
            Still pending. If money was deducted it will be confirmed shortly, so check back in a
            few minutes.
          </p>
        )}

        {message && <h1 className={`text-xl font-semibold ${message.tone}`}>{message.title}</h1>}

        {payment && (
          <div className="mt-4 space-y-1 text-sm">
            {payment.items.map((it) => (
              <div key={it.productId} className="flex justify-between">
                <span>{itemLabel(it)}</span>
                <span>{rupees(it.lineTotal)}</span>
              </div>
            ))}
            {payment.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Coupon {payment.couponCode}</span>
                <span>−{rupees(payment.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total</span>
              <span>{rupees(payment.amount)}</span>
            </div>
            <p className="pt-2 text-xs text-neutral-400">Order {payment.orderId}</p>
          </div>
        )}

        {final && payment.status !== "SUCCESS" && payment.failureReason && (
          <p className="mt-3 text-sm text-neutral-600">{payment.failureReason}</p>
        )}

        <div className="mt-6 flex gap-4 text-sm">
          <Link to="/my-orders" className="underline">
            My orders
          </Link>
          <Link to="/parva-26/merch" className="underline">
            Back to merch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
