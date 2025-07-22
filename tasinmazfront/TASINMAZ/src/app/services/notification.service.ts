import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  duration?: number;
  confirmCallback?: () => void;
  cancelCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info', duration: number = 5000): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      duration
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  confirm(message: string, onConfirm: () => void, onCancel?: () => void): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type: 'confirm',
      duration: 0, // Confirm dialog otomatik kapanmaz
      confirmCallback: onConfirm,
      cancelCallback: onCancel
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}