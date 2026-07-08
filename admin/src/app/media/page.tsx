import OperationalPage from '@/components/layout/OperationalPage';

export default function MediaPage() {
  return (
    <OperationalPage
      title="Media"
      description="Upload media through the current upload API. A searchable library needs media persistence before full management is enabled."
      availableEndpoints={['POST /api/upload/single', 'POST /api/upload/multiple', 'DELETE /api/upload/:publicId']}
      requiredBackend={['Media library model for uploaded asset metadata', 'Search, pagination, and bulk delete routes']}
    />
  );
}
