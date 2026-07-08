import OperationalPage from '@/components/layout/OperationalPage';

export default function SeoPage() {
  return (
    <OperationalPage
      title="SEO"
      description="Prepare metadata and index controls for storefront pages after SEO persistence is implemented in the backend."
      requiredBackend={['SEO settings model and routes', 'Per-page metadata validation and canonical URL controls']}
    />
  );
}
