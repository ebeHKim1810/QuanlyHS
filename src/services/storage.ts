import { AppDatabase } from '../types';
import { getDemoDatabase } from './demoData';

const BASE_STORAGE_KEY = 'TUITION_MANAGER_DB_V2';
const AUTH_TOKEN_KEY = 'TUITION_AUTH_TOKEN_V2';

export class StorageService {
  private static cachedDb: AppDatabase | null = null;
  private static activeToken: string | null = null;

  private static getToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private static getStorageKey(): string {
    const token = this.getToken();
    return token ? `${BASE_STORAGE_KEY}_${token.slice(-10)}` : `${BASE_STORAGE_KEY}_DEFAULT`;
  }

  /**
   * Reset in-memory cache when user switches account
   */
  static clearCache(): void {
    this.cachedDb = null;
    this.activeToken = null;
  }

  /**
   * Load database from server disk (/api/db) or localStorage,
   * with teacher data isolation via Bearer auth header.
   */
  static async loadDatabase(): Promise<AppDatabase> {
    const currentToken = this.getToken();
    if (this.cachedDb && this.activeToken === currentToken) {
      return this.cachedDb;
    }

    this.activeToken = currentToken;
    const storageKey = this.getStorageKey();

    // 1. Try fetching from server disk API (/api/db) with Bearer token
    try {
      const headers: Record<string, string> = {};
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const res = await fetch('/api/db', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.version && Array.isArray(data.students)) {
          this.cachedDb = data;
          localStorage.setItem(storageKey, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Backend api offline or static deploy - fall through to localStorage
    }

    // 2. Try loading from localStorage
    try {
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed && parsed.version && Array.isArray(parsed.students)) {
          this.cachedDb = parsed;
          this.syncToServer(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse localStorage data:', err);
    }

    // 3. Fallback: Initialize with Demo Data
    const initialDb = getDemoDatabase();
    this.cachedDb = initialDb;
    await this.saveDatabase(initialDb);
    return initialDb;
  }

  /**
   * Save database persistently to both localStorage and /api/db disk
   */
  static async saveDatabase(db: AppDatabase): Promise<void> {
    db.lastUpdated = new Date().toISOString();
    this.cachedDb = db;
    const storageKey = this.getStorageKey();

    // Save to localStorage immediately
    try {
      localStorage.setItem(storageKey, JSON.stringify(db));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    // Save to server disk asynchronously
    await this.syncToServer(db);
  }

  /**
   * Sync data to /api/db server disk with Bearer auth token
   */
  private static async syncToServer(db: AppDatabase): Promise<boolean> {
    try {
      const currentToken = this.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const res = await fetch('/api/db', {
        method: 'POST',
        headers,
        body: JSON.stringify(db, null, 2),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Reset all data back to the official Demo Database
   */
  static async resetToDemo(): Promise<AppDatabase> {
    const demoDb = getDemoDatabase();
    await this.saveDatabase(demoDb);
    return demoDb;
  }

  /**
   * Clear all students, schedules, lessons, invoices (leaving clean settings)
   */
  static async clearAllData(): Promise<AppDatabase> {
    const current = await this.loadDatabase();
    const cleanDb: AppDatabase = {
      version: 1,
      students: [],
      schedules: [],
      lessons: [],
      invoices: [],
      settings: current.settings,
      lastUpdated: new Date().toISOString(),
    };
    await this.saveDatabase(cleanDb);
    return cleanDb;
  }

  /**
   * Export all data as a formatted JSON string for backup
   */
  static async exportDataAsJSON(): Promise<string> {
    const db = await this.loadDatabase();
    return JSON.stringify(db, null, 2);
  }

  /**
   * Restore database from imported JSON string
   */
  static async importDataFromJSON(jsonString: string): Promise<AppDatabase> {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.students) || !Array.isArray(parsed.lessons)) {
      throw new Error('Dữ liệu JSON không hợp lệ! Vui lòng chọn tệp sao lưu đúng định dạng của Tuition Manager.');
    }
    const validatedDb: AppDatabase = {
      version: parsed.version || 1,
      students: parsed.students || [],
      schedules: parsed.schedules || [],
      lessons: parsed.lessons || [],
      invoices: parsed.invoices || [],
      settings: parsed.settings || (await this.loadDatabase()).settings,
      lastUpdated: new Date().toISOString(),
    };
    await this.saveDatabase(validatedDb);
    return validatedDb;
  }
}
