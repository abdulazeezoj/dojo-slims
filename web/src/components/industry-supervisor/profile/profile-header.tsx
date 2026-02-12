/**
 * @file profile-header.tsx
 * @description Profile page header
 */

export function ProfileHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="text-muted-foreground text-sm md:text-base">
        View your profile information and manage account settings.
      </p>
    </div>
  );
}
