export type PaymentOverlayListener = (isOpen: boolean) => void;

class PaymentOverlay {
  private openState = false;
  private listeners = new Set<PaymentOverlayListener>();

  open() {
    if (this.openState) return;
    this.openState = true;
    try {
      document.body.classList.add('payment-open');
    } catch { /* ignore DOM mutation errors */ }
    this.emit();
  }

  close() {
    if (!this.openState) return;
    this.openState = false;
    try {
      document.body.classList.remove('payment-open');
    } catch { /* ignore DOM mutation errors */ }
    this.emit();
  }

  isOpen() {
    return this.openState;
  }

  subscribe(listener: PaymentOverlayListener) {
    this.listeners.add(listener);
    // emit current state immediately so subscribers sync
    try {
      listener(this.openState);
    } catch { /* listener error ignored */ }
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const cb of this.listeners) {
      try {
        cb(this.openState);
      } catch { /* listener error ignored */ }
    }
  }
}

export const paymentOverlay = new PaymentOverlay();