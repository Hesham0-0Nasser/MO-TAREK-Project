import { useDb, useSession } from '../mock/store';

export function useCustomer() {
  const { customerId } = useSession();
  const db = useDb();
  return db.customers.find((c) => c.id === customerId) ?? null;
}

export function useStaff() {
  const { staffId } = useSession();
  const db = useDb();
  return db.staff.find((s) => s.id === staffId && s.active) ?? null;
}
