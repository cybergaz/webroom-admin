import { notFound } from "next/navigation";
import { getUsers, updateUser } from "@/app/actions/users";
import { UserEditForm } from "@/components/org/user-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { users } = await getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) notFound();

  const boundAction = updateUser.bind(null, userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit User</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserEditForm
            action={boundAction}
            defaultValues={{ name: user.name, email: user.email }}
            cancelHref="/admin/users"
          />
        </CardContent>
      </Card>
    </div>
  );
}
