"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { updateRoomContent } from "@/app/actions/rooms";
import { uploadBanner } from "@/app/actions/uploads";

interface RoomContentFormProps {
  roomId: string;
  initialBanners: string[];
  initialMarqueeText: string;
}

const ACCEPT_MIME = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

export function RoomContentForm({
  roomId,
  initialBanners,
  initialMarqueeText,
}: RoomContentFormProps) {
  const boundAction = updateRoomContent.bind(null, roomId);
  const [state, formAction, isPending] = useActionState(boundAction, null);

  const [banners, setBanners] = useState<string[]>(
    initialBanners.length > 0 ? initialBanners : [""],
  );
  const [uploading, setUploading] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) toast.success("Room content updated");
  }, [state?.success]);

  function addBanner() {
    setBanners((prev) => [...prev, ""]);
  }

  function removeBanner(index: number) {
    setBanners((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [""] : next;
    });
  }

  function updateBanner(index: number, value: string) {
    setBanners((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    for (const file of list) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Skipped "${file.name}": not an image`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`Skipped "${file.name}": larger than 5 MB`);
        continue;
      }

      setUploading((n) => n + 1);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadBanner(fd);
        if (result.error || !result.url) {
          toast.error(result.error ?? "Upload failed");
          continue;
        }
        const uploadedUrl = result.url;
        setBanners((prev) => {
          // If the only slot is empty, fill it instead of appending.
          if (prev.length === 1 && prev[0].trim() === "") return [uploadedUrl];
          return [...prev, uploadedUrl];
        });
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!dragActive) setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    // Ignore drag-leave events on child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragActive(false);
  }

  return (
    <form
      action={formAction}
      className="rounded-lg border border-border bg-card p-4 space-y-5"
    >
      <div>
        <h2 className="text-base font-semibold">Room Content</h2>
        <p className="text-sm text-muted-foreground">
          Banners and announcement marquee shown to non-host users inside this
          room.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-3">
        <Label>Banners</Label>

        {/* Drag-and-drop upload zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:bg-muted/50"
          }`}
        >
          {uploading > 0 ? (
            <>
              <Spinner className="size-6" />
              <span className="text-sm text-muted-foreground">
                Uploading {uploading} image{uploading === 1 ? "" : "s"}...
              </span>
            </>
          ) : (
            <>
              <Upload className="size-6 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium">Drop images here</span> or click
                to select
              </div>
              <div className="text-xs text-muted-foreground">
                JPG, PNG, WebP, or GIF · up to 5 MB each
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_MIME}
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Or paste image URLs manually. The client auto-cycles through every
          entry below.
        </p>
        <div className="space-y-2">
          {banners.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              {url ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              ) : null}
              <Input
                name="banners"
                type="url"
                placeholder="https://example.com/banner.jpg"
                value={url}
                onChange={(e) => updateBanner(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBanner(index)}
                aria-label="Remove banner"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBanner}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Add URL slot
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marqueeText">Announcement marquee</Label>
        <p className="text-xs text-muted-foreground">
          Single line of text that scrolls right-to-left above the room
          controls. Leave empty to hide.
        </p>
        <Textarea
          id="marqueeText"
          name="marqueeText"
          placeholder="Live commentary starts in 5 minutes..."
          rows={2}
          defaultValue={initialMarqueeText}
          maxLength={2048}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || uploading > 0}
          className="gap-1.5"
        >
          {isPending ? <Spinner className="size-4" /> : null}
          Save
        </Button>
      </div>
    </form>
  );
}
