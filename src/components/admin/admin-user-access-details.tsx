import type { FunctionReturnType } from "convex/server";
import {
  formatPurchaseDate,
  formatTrainingAccessDate,
  formatTrainingAccessRange,
} from "@/lib/billing";
import type { api } from "../../../convex/_generated/api";

export type AdminUser = FunctionReturnType<
  typeof api.auth.listAdminUsers
>[number];

export function AdminUserAccessDetails({ user }: { user: AdminUser }) {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current access</h3>
          <p className="text-sm text-muted-foreground">
            {user.accessSource === "admin"
              ? "All lab content, all workouts, and admin tools. Billing is not required."
              : user.accessSource === "none"
                ? "No lab content or workouts. An active membership or block purchase is required."
                : "Lab Notes, races, training blocks, and charts. Workout access is listed below."}
          </p>
          {user.accessSource === "subscription" &&
          user.subscription?.accessStart ? (
            <div className="space-y-2 text-sm">
              <p>
                Membership workouts:{" "}
                {formatTrainingAccessDate(user.subscription.accessStart)}{" "}
                through today, with new workouts while the membership stays
                active.
              </p>
              {user.subscription.pastAccessWindows.map((window) => (
                <p key={`${window.from}-${window.to}`}>
                  Previous membership:{" "}
                  {formatTrainingAccessRange(window.from, window.to)}
                </p>
              ))}
            </div>
          ) : null}
          {user.accessSource !== "admin" && user.purchases.length > 0 ? (
            <p className="text-sm">
              Purchased blocks remain accessible for their listed workout dates
              without a membership. These dates describe the workouts included,
              not an access expiry.
            </p>
          ) : null}
        </div>
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <h3 className="text-sm font-medium">Purchases</h3>
          {user.subscription ? (
            <div className="space-y-1 text-sm">
              <p>Inside the Lab membership</p>
              <p className="text-muted-foreground">
                Status: {user.subscription.status.replaceAll("_", " ")}
              </p>
            </div>
          ) : null}
          {user.purchases.length ? (
            <table className="w-full text-start text-sm">
              <caption className="sr-only">
                Training block purchases for {user.name || user.email}
              </caption>
              <thead>
                <tr className="border-b">
                  <th
                    className="pe-4 pb-2 text-start text-xs font-medium text-muted-foreground"
                    scope="col"
                  >
                    Training block
                  </th>
                  <th
                    className="pe-4 pb-2 text-start text-xs font-medium text-muted-foreground"
                    scope="col"
                  >
                    Purchased
                  </th>
                  <th
                    className="pb-2 text-start text-xs font-medium text-muted-foreground"
                    scope="col"
                  >
                    Workout dates
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="py-3 pe-4 align-top">
                      <p className="font-medium wrap-anywhere">
                        {purchase.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {purchase.purchaseType === "bundle"
                          ? "Included in bundle"
                          : "Individual block"}
                      </p>
                    </td>
                    <td className="py-3 pe-4 align-top tabular-nums">
                      {formatPurchaseDate(purchase.purchasedAt)}
                    </td>
                    <td className="py-3 align-top tabular-nums">
                      {formatTrainingAccessRange(
                        purchase.accessStart,
                        purchase.accessEnd,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No training block purchases.
            </p>
          )}
          {!user.subscription && (
            <p className="text-sm text-muted-foreground">
              No membership recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
