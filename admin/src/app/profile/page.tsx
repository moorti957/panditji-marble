import OperationalPage from '@/components/layout/OperationalPage';

export default function ProfilePage() {
  return (
    <OperationalPage
      title="Profile"
      description="The authenticated admin profile is loaded from the existing auth session endpoint."
      availableEndpoints={['GET /api/auth/me', 'POST /api/auth/logout']}
      requiredBackend={['Profile update endpoint', 'Password change endpoint with current-password verification']}
    />
  );
}
