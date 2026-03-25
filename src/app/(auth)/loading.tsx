import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
