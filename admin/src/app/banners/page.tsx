import OperationalPage from '@/components/layout/OperationalPage';

export default function BannersPage() {
  return (
    <OperationalPage
      title="Banners"
      description="Banner data models exist in the backend; CRUD routes should be exposed before enabling admin edits."
      requiredBackend={['Banner controller and routes', 'Upload association and active/display-order endpoints']}
    />
  );
}
