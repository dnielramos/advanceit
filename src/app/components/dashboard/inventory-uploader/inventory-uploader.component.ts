// src/app/components/inventory-browser/inventory-browser.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CompanyInventoriesService, InventoryPayload } from '../../../services/company-inventories.service';
interface CompanyInventory {
  id?: string;
  company: string;
  inventory: any[];
  columns: string[];
  created_at?: string;
}

@Component({
  selector: 'app-inventory-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-uploader.component.html',
})
export class InventoryUploaderComponent implements OnInit {
  private inventoriesService = inject(CompanyInventoriesService);

  // Estado general
  companies = signal<CompanyInventory[]>([]);
  selectedCompany = signal<CompanyInventory | null>(null);

  // Para registrar inventario
  previewData = signal<any[]>([]);
  previewColumns = signal<string[]>([]);
  tempCompany = '';
  tempFile: File | null = null;

  // Carga inicial
  ngOnInit(): void {
    this.loadAllInventories();
  }

  // ======================================================
  // Cargar inventarios existentes
  // ======================================================
  loadAllInventories() {
    this.inventoriesService.getAllInventories().subscribe({
      next: (data: any[]) => {
        const mapped: CompanyInventory[] = (data || []).map(item => ({
          id: item.id,
          company: item.company,
          inventory: item.inventory ?? [],
          columns: item.columns ?? (item.inventory?.[0] ? Object.keys(item.inventory[0]) : []),
          created_at: item.created_at ?? item.createdAt ?? null,
        }));
        // Ordenar por fecha desc
        this.companies.set(
          mapped.sort((a, b) => {
            const da = a.created_at ? new Date(a.created_at).getTime() : 0;
            const db = b.created_at ? new Date(b.created_at).getTime() : 0;
            return db - da;
          })
        );
      },
      error: (err) => console.error('Error cargando inventarios', err),
    });
  }

  // ======================================================
  // Subida de archivo Excel
  // ======================================================
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

  // ======================================================
  // Guardar inventario en backend
  // ======================================================
  saveInventory() {
    if (!this.tempCompany || this.previewData().length === 0) return;

    const payload: InventoryPayload = {
      company: this.tempCompany,
      inventory: this.previewData(),
      created_by: 'system', // aquí podrías poner el usuario logueado
    };

    this.inventoriesService.createInventory(payload).subscribe({
      next: (response) => {
        console.log('Inventario creado con éxito:', response);
        this.loadAllInventories(); // recargar lista
      },
      error: (error) => console.error('Error al crear inventario:', error),
    });

    // Reset
    this.previewData.set([]);
    this.previewColumns.set([]);
    this.tempCompany = '';
    this.tempFile = null;
  }

  // ======================================================
  // Ver detalle de inventario
  // ======================================================
  viewInventory(company: CompanyInventory) {
    this.selectedCompany.set(company);
  }

  closeInventory() {
    this.selectedCompany.set(null);
  }
}
