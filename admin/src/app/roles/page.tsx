import OperationalPage from '@/components/layout/OperationalPage';

export default function RolesPage() {
  return (
    <OperationalPage
      title="Roles & Permissions"
      description="Role changes are available on users. A separate permission matrix requires backend authorization policy storage."
      availableEndpoints={['PATCH /api/users/:id/role']}
      requiredBackend={['Permissions model and assignment routes', 'Middleware policy mapping per admin route']}
    />
  );
}
