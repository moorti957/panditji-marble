import OperationalPage from '@/components/layout/OperationalPage';

export default function HomepagePage() {
  return (
    <OperationalPage
      title="Homepage"
      description="Inspect storefront homepage data currently exposed for public consumption."
      availableEndpoints={['GET /api/home', 'GET /api/home/banners', 'GET /api/home/categories', 'GET /api/home/products']}
      requiredBackend={['Admin write endpoints for homepage sections', 'Validation for featured category and product placement']}
    />
  );
}
