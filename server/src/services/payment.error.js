// Errors safe to show to the client (bad cart, bad coupon, ...).
// Anything that is not a PaymentError is treated as an internal failure.
export class PaymentError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = "PaymentError";
        this.statusCode = statusCode;
    }
}
