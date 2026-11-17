'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common/states';
import { EntityAvatar } from '@/components/common/entity-avatar';
import {
  useDeleteDoctorPhoto,
  useDeletePatientPhoto,
  useUploadDoctorPhoto,
  useUploadPatientPhoto,
} from '@/lib/hooks/use-data';
import { avatarColor, errorMessage, initials } from '@/lib/utils';

interface PhotoFieldProps {
  kind: 'doctors' | 'patients';
  id?: string;
  name: string;
  hasPhoto?: boolean;
  /** `updatedAt` — passed to the photo URL to bust the browser cache after a change. */
  version?: string;
  /** Held by the parent while creating a new record (no id yet); uploaded after the record is saved. */
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
  /** Called after a photo is uploaded/removed on an existing record so the parent can refetch. */
  onUploaded?: () => void;
}

export function PhotoField({
  kind,
  id,
  name,
  hasPhoto,
  version,
  pendingFile,
  onPendingFileChange,
  onUploaded,
}: PhotoFieldProps) {
  const isEdit = !!id;
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const uploadDoctor = useUploadDoctorPhoto(id ?? '');
  const deleteDoctor = useDeleteDoctorPhoto(id ?? '');
  const uploadPatient = useUploadPatientPhoto(id ?? '');
  const deletePatient = useDeletePatientPhoto(id ?? '');
  const busy =
    uploadDoctor.isPending || deleteDoctor.isPending || uploadPatient.isPending || deletePatient.isPending;

  // Build a local object URL to preview a freshly chosen file before it's uploaded.
  useEffect(() => {
    const url = pendingFile ? URL.createObjectURL(pendingFile) : null;
    setObjectUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pendingFile]);

  async function handleFile(file: File) {
    if (isEdit && id) {
      try {
        if (kind === 'doctors') await uploadDoctor.mutateAsync(file);
        else await uploadPatient.mutateAsync(file);
        toast.success('Photo updated');
        onUploaded?.();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    } else {
      onPendingFileChange(file);
    }
  }

  async function handleRemove() {
    if (isEdit && id && hasPhoto) {
      try {
        if (kind === 'doctors') await deleteDoctor.mutateAsync();
        else await deletePatient.mutateAsync();
        toast.success('Photo removed');
        onUploaded?.();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    } else {
      onPendingFileChange(null);
    }
  }

  const hasPreview = (!!pendingFile && !!objectUrl) || (isEdit && !!hasPhoto);

  return (
    <div className="flex items-center gap-4">
      {pendingFile && objectUrl ? (
        <Avatar className="h-20 w-20 rounded-md border border-slate-200">
          <AvatarImage src={objectUrl} alt={name} />
          <AvatarFallback className={`rounded-md text-lg font-semibold ${avatarColor(name)}`}>{initials(name)}</AvatarFallback>
        </Avatar>
      ) : isEdit && hasPhoto && id ? (
        <EntityAvatar
          kind={kind}
          id={id}
          name={name}
          hasPhoto
          version={version}
          className="h-20 w-20 rounded-md border border-slate-200"
          fallbackClassName={`rounded-md text-lg font-semibold ${avatarColor(name)}`}
        />
      ) : (
        <Avatar className="h-20 w-20 rounded-md border border-slate-200">
          <AvatarFallback className={`rounded-md text-lg font-semibold ${avatarColor(name)}`}>{initials(name)}</AvatarFallback>
        </Avatar>
      )}

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            // reset so selecting the same file again re-triggers change
            e.target.value = '';
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Spinner /> : <Upload className="h-4 w-4" />}
            {hasPreview ? 'Change photo' : 'Upload photo'}
          </Button>
          {hasPreview && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void handleRemove()}>
              <Trash2 className="h-4 w-4 text-rose-600" /> Remove
            </Button>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          JPEG, PNG, WebP or GIF. Max 2&nbsp;MB.
        </p>
      </div>
    </div>
  );
}
