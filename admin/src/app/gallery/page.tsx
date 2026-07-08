import OperationalPage from '@/components/layout/OperationalPage';

export default function GalleryPage() {
  return (
    <OperationalPage
      title="Gallery"
      description="Manage media gallery assets through the existing upload service and a future gallery metadata API."
      availableEndpoints={['POST /api/upload/single', 'POST /api/upload/multiple']}
      requiredBackend={['Gallery metadata controller for listing, search, and deletion', 'Bulk delete support for stored public IDs']}
    />
  );
}
