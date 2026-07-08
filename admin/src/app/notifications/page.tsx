import OperationalPage from '@/components/layout/OperationalPage';

export default function NotificationsPage() {
  return (
    <OperationalPage
      title="Notifications"
      description="Centralize admin alerts for orders, stock, reviews, and customer activity once notification persistence is available."
      requiredBackend={['Notification model and read/unread endpoints', 'Server-side event source or polling endpoint for fresh alerts']}
    />
  );
}
