// src/app/core/services/image-cache.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface CacheItem {
  imageData: string;
  timestamp: number;
  prompt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
  private cacheSubject = new BehaviorSubject<Map<string, CacheItem>>(this.cache);

  cacheImage(prompt: string, imageData: string): void {
    const cacheKey = this.generateCacheKey(prompt);
    this.cache.set(cacheKey, {
      imageData,
      timestamp: Date.now(),
      prompt
    });
    this.cacheSubject.next(new Map(this.cache));
    this.cleanupOldEntries();
  }

  getCachedImage(prompt: string): string | null {
    const cacheKey = this.generateCacheKey(prompt);
    const item = this.cache.get(cacheKey);
    
    if (item && this.isCacheValid(item.timestamp)) {
      return item.imageData;
    }
    
    if (item) {
      this.cache.delete(cacheKey);
      this.cacheSubject.next(new Map(this.cache));
    }
    
    return null;
  }

  getCacheObservable(): Observable<Map<string, CacheItem>> {
    return this.cacheSubject.asObservable();
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheSubject.next(new Map());
  }

  private generateCacheKey(prompt: string): string {
    return btoa(prompt.trim().toLowerCase());
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    let entriesDeleted = false;
    
    this.cache.forEach((item, key) => {
      if (!this.isCacheValid(item.timestamp)) {
        this.cache.delete(key);
        entriesDeleted = true;
      }
    });
    
    if (entriesDeleted) {
      this.cacheSubject.next(new Map(this.cache));
    }
  }
}