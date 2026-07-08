import OperationalPage from '@/components/layout/OperationalPage';

export default function ReviewsPage() {
  return (
    <OperationalPage
      title="Reviews"
      description="Moderate product reviews after review listing and status endpoints are available."
      requiredBackend={['Review controller and moderation routes', 'Bulk status and deletion endpoints']}
    />
  );
}
