'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { photoUrl } from '@/lib/api/client';
import { avatarColor, initials } from '@/lib/utils';

interface EntityAvatarProps {
  name: string;
  kind: 'doctors' | 'patients';
  id?: string;
  hasPhoto?: boolean;
  /** `updatedAt` (or any value that changes when the photo changes) to bust the browser cache. */
  version?: string;
  /** Tailwind classes for the avatar root (size/shape). */
  className?: string;
  /** Tailwind classes for the initials fallback (color/size). */
  fallbackClassName?: string;
}

/**
 * Renders an entity's stored photo when available, falling back to colored
 * initials otherwise. The image request is made cross-origin with credentials
 * so the auth cookie is sent to the backend.
 */
export function EntityAvatar({ name, kind, id, hasPhoto, version, className, fallbackClassName }: EntityAvatarProps) {
  const src = id && hasPhoto ? photoUrl(kind, id, version) : undefined;
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={name} crossOrigin="use-credentials" />}
      <AvatarFallback className={fallbackClassName ?? avatarColor(name)}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
