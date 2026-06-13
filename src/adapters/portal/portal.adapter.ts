export interface PortalJobPayload {
  reqId: string;
  roleTitle: string;
  description: string;
  directorId: string;
  teamId: string;
}

export interface PortalJobResult {
  portalJobId: string;
  portalUrl: string;
}

export interface PortalAdapter {
  createDraft(payload: PortalJobPayload): Promise<PortalJobResult>;
  publish(portalJobId: string): Promise<PortalJobResult>;
  remove(portalJobId: string): Promise<void>;
}
