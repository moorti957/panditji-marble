import OperationalPage from '@/components/layout/OperationalPage';

export default function CustomersPage() {
  return (
    <OperationalPage
      title="Customers"
      description="Customer administration is backed by the existing users API. Use the Users screen for active role and status management."
      availableEndpoints={['GET /api/users', 'PATCH /api/users/:id/status', 'DELETE /api/users/:id']}
      requiredBackend={['Customer-specific order history aggregation', 'Customer segmentation and export endpoints']}
    />
  );
}
