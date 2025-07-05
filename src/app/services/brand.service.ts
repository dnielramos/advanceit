import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  brands = [
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/443.webp',
      name: 'microsoft',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/444_s.webp',
      name: 'redhat',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/463.webp',
      name: 'condeco',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/350.webp', name: 'adobe' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/380.webp',
      name: 'kaspersky',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/388.webp',
      name: 'oracle',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/358.webp',
      name: 'autodesk',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/446.webp',
      name: 'acronis',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/447.webp',
      name: 'checkpoint',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/448.webp',
      name: 'citrix',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/451.webp',
      name: 'sophos',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/349.webp', name: 'adata' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/352.webp', name: 'apc' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/433.webp', name: 'apple' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/354.webp', name: 'aruba' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/355.webp', name: 'asus' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/356.webp',
      name: 'asus corporativo',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/461.webp', name: 'barco' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/359.webp', name: 'canon' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/360.webp',
      name: 'canon corporativo',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/362.webp', name: 'dlink' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/440.webp', name: 'dell' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/365.webp', name: 'elo' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/366.webp', name: 'epson' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/367.webp',
      name: 'epson consumo',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/368.webp',
      name: 'epson pos',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/369.webp',
      name: 'epson scanners',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/434.webp',
      name: 'google',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/371.webp',
      name: 'honeywell',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/372.webp',
      name: 'hp gran formato',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/373.webp',
      name: 'hp consumo',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/374.webp', name: 'hp' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/375.webp',
      name: 'hp plus',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/376.webp',
      name: 'hp portátiles',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/377.webp',
      name: 'hp unknown 1',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/378.webp',
      name: 'hp unknown 2',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/379.webp', name: 'jabra' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/382.webp',
      name: 'lenovo',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/384.webp',
      name: 'lenovo servers',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/383.webp',
      name: 'lenovo workstation',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/385.webp', name: 'lg' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/439.webp',
      name: 'logitech',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/436.webp',
      name: 'microsoft (alt)',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/389.webp',
      name: 'panasonic',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/390.webp', name: 'poly' },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/391.webp',
      name: 'samsung',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/392.webp',
      name: 'samsung mobile',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/393.webp',
      name: 'samsung monitores',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/395.webp',
      name: 'tplink',
    },
    {
      url: 'https://cdn.osabana.com/advanceit/marcas/396.webp',
      name: 'viewsonic',
    },
    { url: 'https://cdn.osabana.com/advanceit/marcas/397.webp', name: 'wacom' },
    { url: 'https://cdn.osabana.com/advanceit/marcas/398.webp', name: 'zebra' },
  ];
}
