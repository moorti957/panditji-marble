import OperationalPage from '@/components/layout/OperationalPage';

export default function CollectionsPage() {
  return (
    <OperationalPage
      title="Collections"
      description="Collections can be managed through categories and featured product fields until a dedicated merchandising API exists."
      availableEndpoints={['GET /api/categories', 'GET /api/products', 'PATCH /api/products/:id/toggle-featured']}
      requiredBackend={['Collection model and product assignment endpoints', 'Display-order and homepage placement controls']}
    />
  );
}
