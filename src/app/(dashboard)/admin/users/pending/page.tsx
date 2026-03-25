import { UserApprovalSearch } from "@/components/org/user-approval-search";

export default function ApproveUserPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Approve User</h1>
      <p className="text-muted-foreground">
        Enter the Request ID provided by the user to find and approve their account.
      </p>
      <UserApprovalSearch />
    </div>
  );
}
