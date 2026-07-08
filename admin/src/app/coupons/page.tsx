import OperationalPage from '@/components/layout/OperationalPage';

export default function CouponsPage() {
  return (
    <OperationalPage
      title="Coupons"
      description="Coupon models exist in the backend; admin CRUD should be enabled after validation and route coverage are added."
      requiredBackend={['Coupon controller, validator, and routes', 'Usage limits, expiry, and status change endpoints']}
    />
  );
}
