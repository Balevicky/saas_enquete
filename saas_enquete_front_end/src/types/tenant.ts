export interface TenantSettings {
  general?: {
    organisation?: {
      name?: string;
      email?: string;
      country?: string;
      timezone?: string;
      language?: string;
    };
    users?: {
      allowInvites?: boolean;
      defaultRole?: string;
      maxUsers?: number;
    };
    emails?: {
      fromName?: string;
      fromEmail?: string;
      replyTo?: string;
      enabled?: boolean;
    };
    security?: {
      sessionDuration?: number;
      passwordPolicy?: string;
      twoFactorEnabled?: boolean;
    };
  };
  branding?: {
    logoLight?: string;
    logoDark?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}
