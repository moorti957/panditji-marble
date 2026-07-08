import OperationalPage from '@/components/layout/OperationalPage';

export default function BlogsPage() {
  return (
    <OperationalPage
      title="Blogs"
      description="Manage editorial content after blog routes, schemas, and upload handlers are added to the Express API."
      requiredBackend={['Blog model, controller, validator, and routes', 'Image upload mapping for blog cover and inline media']}
    />
  );
}
