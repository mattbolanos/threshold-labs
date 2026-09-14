import { getTrainingBlockBundlePrice } from "@/lib/auth";
import { formatBundlePrice } from "@/lib/billing";

export async function BundlePriceDetail() {
  const { amountCents } = await getTrainingBlockBundlePrice();
  return <>{formatBundlePrice(amountCents)} for every block so far</>;
}
