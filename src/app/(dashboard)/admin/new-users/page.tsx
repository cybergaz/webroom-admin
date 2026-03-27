import { UserApprovalSearch } from "@/components/org/user-approval-search";

export default function NewUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approve User</h1>
        <p className="text-muted-foreground">
          Enter the Request ID provided by the user to look them up, approve their account, and add them to your list.
        </p>
      </div>
      <UserApprovalSearch />
    </div>
  );
}
