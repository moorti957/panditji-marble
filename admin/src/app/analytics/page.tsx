import OperationalPage from '@/components/layout/OperationalPage';

export default function AnalyticsPage() {
  return (
    <OperationalPage
      title="Analytics"
      description="Review sales and catalog performance using the dashboard data services currently exposed by the backend."
      availableEndpoints={['GET /api/dashboard/stats', 'GET /api/dashboard/revenue', 'GET /api/dashboard/recent-orders']}
      requiredBackend={['Dedicated analytics controller for sales, product, and customer segments', 'Date-range filters shared with dashboard reports']}
    />
  );
}
