import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CompanyInventoriesService } from '../../../services/company-inventories.service';

interface CompanyInventory {
  company: string;
  inventory: any[];
  columns: string[];
}

@Component({
  imports: [FormsModule, CommonModule],
  selector: 'app-inventory-uploader',
  standalone: true,
  templateUrl: './inventory-uploader.component.html',
})
export class InventoryUploaderComponent {
  companies = signal<CompanyInventory[]>([]);
  previewData = signal<any[]>([]);
  previewColumns = signal<string[]>([]);
  selectedCompany = signal<CompanyInventory | null>(null);
  tempCompany = '';
  tempFile: File | null = null;

  constructor(private companyInventoriesService: CompanyInventoriesService) {}

  handleFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.tempFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      this.previewData.set(json);
      this.previewColumns.set(Object.keys(json[0] || {}));
    };
    reader.readAsArrayBuffer(file);
  }

  saveInventory() {
    if (!this.tempCompany || this.previewData().length === 0) return;
    const companyData: CompanyInventory = {
      company: this.tempCompany,
      inventory: this.previewData(),
      columns: this.previewColumns(),
    };

    // 👇 Esto es lo que enviarías al backend
    const payload = {
      company: companyData.company,
      inventory: companyData.inventory,
      created_by: 'system', // Reemplaza con el ID del usuario actual
    };

    if (payload.inventory.length === 0) {
      console.error('El inventario está vacío. No se enviará nada al backend.');
      return;
    }

    this.companyInventoriesService.createInventory(payload).subscribe({
      next: (response) => {
        console.log('Inventario creado con éxito:', response);
        this.companies.update((list) => [...list, companyData]);
      },
      error: (error) => {
        console.error('Error al crear el inventario:', error);
      },
    });

    console.log('Payload para el backend:', JSON.stringify(payload, null, 2));

    this.companies.update((list) => [...list, companyData]);
    this.previewData.set([]);
    this.previewColumns.set([]);
    this.tempCompany = '';
    this.tempFile = null;
  }

  viewInventory(company: CompanyInventory) {
    this.selectedCompany.set(company);
  }

  closeInventory() {
    this.selectedCompany.set(null);
  }
}
