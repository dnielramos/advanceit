import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrandImageService {
  brands = [
    {
      url: 'assets/logos/microsoft.png',
      name: 'microsoft',
    },
    {
      url: 'assets/logos/redhat.png',
      name: 'redhat',
    },
    {
      url: 'assets/logos/condeco.png',
      name: 'condeco',
    },
    { url: 'assets/logos/adobe.png', name: 'adobe' },
    {
      url: 'assets/logos/kaspersky.png',
      name: 'kaspersky',
    },
    {
      url: 'assets/logos/oracle.png',
      name: 'oracle',
    },
    {
      url: 'assets/logos/autodesk.png',
      name: 'autodesk',
    },
    {
      url: 'assets/logos/acronis.webp', // Extensión .webp según la imagen
      name: 'acronis',
    },
    {
      url: 'assets/logos/checkpoint.png',
      name: 'checkpoint',
    },
    {
      url: 'assets/logos/citrix.png',
      name: 'citrix',
    },
    {
      url: 'assets/logos/sophos.png',
      name: 'sophos',
    },
    { url: 'assets/logos/adata.png', name: 'adata' }, // No visible en imagen, asumimos .png
    { url: 'assets/logos/apc.png', name: 'apc' },
    { url: 'assets/logos/apple.png', name: 'apple' },
    { url: 'assets/logos/aruba.png', name: 'aruba' },
    { url: 'assets/logos/asus.webp', name: 'asus' }, // Extensión .webp según la imagen
    {
      url: 'assets/logos/asus corporativo.png',
      name: 'asus corporativo',
    },
    { url: 'assets/logos/barco.png', name: 'barco' },
    { url: 'assets/logos/canon.png', name: 'canon' },
    {
      url: 'assets/logos/canon corporativo.png', // No visible en imagen, asumimos .png
      name: 'canon corporativo',
    },
    { url: 'assets/logos/dlink.png', name: 'dlink' },
    { url: 'assets/logos/dell.png', name: 'dell' },
    { url: 'assets/logos/elo.png', name: 'elo' },
    { url: 'assets/logos/epson.png', name: 'epson' },
    {
      url: 'assets/logos/epson consumo.webp', // Extensión .webp según la imagen
      name: 'epson consumo',
    },
    {
      url: 'assets/logos/epson pos.png', // No visible en imagen, asumimos .png
      name: 'epson pos',
    },
    {
      url: 'assets/logos/epson scanners.png',
      name: 'epson scanners',
    },
    {
      url: 'assets/logos/google.png', // No visible en imagen, asumimos .png
      name: 'google',
    },
    {
      url: 'assets/logos/honeywell.png',
      name: 'honeywell',
    },
    {
      url: 'assets/logos/hp gran formato.png',
      name: 'hp gran formato',
    },
    {
      url: 'assets/logos/hp consumo.png', // No visible en imagen, asumimos .png
      name: 'hp consumo',
    },
    { url: 'assets/logos/hp gran formato.png', name: 'hp' }, // No visible en imagen, asumimos .png
    {
      url: 'assets/logos/hp plus.png', // No visible en imagen, asumimos .png
      name: 'hp plus',
    },
    {
      url: 'assets/logos/hp portátiles.png', // No visible en imagen, asumimos .png
      name: 'hp portátiles',
    },
    {
      url: 'assets/logos/hp unknown 1.png', // No visible en imagen, asumimos .png
      name: 'hp unknown 1',
    },
    {
      url: 'assets/logos/hp unknown 2.png', // No visible en imagen, asumimos .png
      name: 'hp unknown 2',
    },
    { url: 'assets/logos/jabra.png', name: 'jabra' },
    {
      url: 'assets/logos/lenovo.png',
      name: 'lenovo',
    },
    {
      url: 'assets/logos/lenovo servers.png',
      name: 'lenovo servers',
    },
    {
      url: 'assets/logos/lenovo workstation.png', // No visible en imagen, asumimos .png
      name: 'lenovo workstation',
    },
    { url: 'assets/logos/lg.png', name: 'lg' },
    {
      url: 'assets/logos/logitech.png',
      name: 'logitech',
    },
    {
      url: 'assets/logos/microsoft.png', // La imagen muestra microsoft.png
      name: 'microsoft (alt)', // Asumiendo que "microsoft (alt)" también usa microsoft.png
    },
    {
      url: 'assets/logos/panasonic.png',
      name: 'panasonic',
    },
    { url: 'assets/logos/poly.png', name: 'poly' }, // No visible en imagen, asumimos .png
    {
      url: 'assets/logos/samsung.png',
      name: 'samsung',
    },
    {
      url: 'assets/logos/samsung mobile.png', // No visible en imagen, asumimos .png
      name: 'samsung mobile',
    },
    {
      url: 'assets/logos/samsung monitores.png', // No visible en imagen, asumimos .png
      name: 'samsung monitores',
    },
    {
      url: 'assets/logos/tplink.png',
      name: 'tplink',
    },
    {
      url: 'assets/logos/viewsonic.png',
      name: 'viewsonic',
    },
    { url: 'assets/logos/wacom.jpg', name: 'wacom' }, // Extensión .jpg según la imagen
    { url: 'assets/logos/zebra.png', name: 'zebra' },
  ];
}
