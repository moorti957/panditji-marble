import OperationalPage from '@/components/layout/OperationalPage';

export default function PagesPage() {
  return (
    <OperationalPage
      title="Pages"
      description="Manage static storefront pages after CMS page routes are added to the API."
      requiredBackend={['Page model with slug, content, status, and SEO fields', 'Publish workflow endpoints']}
    />
  );
}
