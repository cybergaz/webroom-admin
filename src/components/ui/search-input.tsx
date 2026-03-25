"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debouncedValue = useDebounce(value, 300);

  const updateSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
        params.delete("page"); // Reset to page 1 on new search
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams, startTransition]
  );

  useEffect(() => {
    updateSearch(debouncedValue);
  }, [debouncedValue, updateSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
