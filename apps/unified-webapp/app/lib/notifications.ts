// Notification system for cross-module notifications

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  module: 'nomad' | 'polyverse' | 'everpath' | 'critters' | 'system';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Mock notification data for development
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Booking Confirmed',
    message: 'Your accommodation in Bali has been confirmed for November 15-30.',
    module: 'nomad',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/nomad/bookings'
  },
  {
    id: '2',
    type: 'info',
    title: 'New Connection',
    message: 'Alex Chen connected with you in the Tech Innovators group.',
    module: 'polyverse',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/polyverse/connections'
  },
  {
    id: '3',
    type: 'success',
    title: 'Course Completed',
    message: 'You successfully completed the Advanced React Patterns course.',
    module: 'everpath',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/everpath/courses'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Quest Expiring',
    message: 'Your Geometry Guardian quest expires in 2 days.',
    module: 'critters',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/critters/quests'
  }
];

export class NotificationManager {
  private notifications: Notification[] = [];

  constructor() {
    // Load notifications from localStorage or API
    this.loadNotifications();
  }

  private loadNotifications() {
    // In development, use mock data
    if (process.env.NODE_ENV === 'development') {
      this.notifications = mockNotifications;
    }
    // TODO: Load from API in production
  }

  getNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  getAllNotifications(): Notification[] {
    return this.notifications;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    this.notifications.unshift(newNotification);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager();