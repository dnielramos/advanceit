import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaymentsService } from '../../../../services/payments.service';

@Component({
  selector: 'app-payment-voucher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-voucher.component.html',
})
export class PaymentVoucherComponent implements OnInit {
  @Input() paymentId!: string;
  comprobanteUrl: SafeResourceUrl | null = null;
  isPdf = false;
  isLoading = true;
  hasError = false;

  constructor(
    private paymentsService: PaymentsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (!this.paymentId) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.paymentsService.getReceipt(this.paymentId).subscribe({
      next: (base64) => {
        this.isLoading = false;

        if (!base64) {
          this.hasError = true;
          return;
        }

        // Detecta el tipo del comprobante
        this.isPdf = base64.startsWith('data:application/pdf');
        this.comprobanteUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(base64);
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
}
