import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
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
  @Output() downloadRequested = new EventEmitter<string>();
  
  comprobanteUrl: SafeResourceUrl | null = null;
  comprobanteBase64: string | null = null; // URL original para descargar
  isPdf = false;
  isLoading = true;
  hasError = false;

  constructor(
    private paymentsService: PaymentsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadVoucher();
  }

  loadVoucher(): void {
    if (!this.paymentId) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.paymentsService.getReceipt(this.paymentId).subscribe({
      next: (base64) => {
        this.isLoading = false;

        if (!base64) {
          this.hasError = true;
          return;
        }

        this.comprobanteBase64 = base64;
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

  /** Devuelve la URL base64 para descargar */
  getDownloadUrl(): string | null {
    return this.comprobanteBase64;
  }

  /** Refresca el comprobante */
  refresh(): void {
    this.loadVoucher();
  }
}
