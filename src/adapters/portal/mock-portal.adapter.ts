import { config } from "../../config.js";
import type {
  PortalAdapter,
  PortalJobPayload,
  PortalJobResult,
} from "./portal.adapter.js";

const store = new Map<string, { payload: PortalJobPayload; published: boolean }>();

export class MockPortalAdapter implements PortalAdapter {
  async createDraft(payload: PortalJobPayload): Promise<PortalJobResult> {
    const portalJobId = `portal-${payload.reqId}`;
    store.set(portalJobId, { payload, published: false });
    return {
      portalJobId,
      portalUrl: `${config.portal.baseUrl}/jobs/${portalJobId}`,
    };
  }

  async publish(portalJobId: string): Promise<PortalJobResult> {
    const entry = store.get(portalJobId);
    if (!entry) throw new Error(`Portal job not found: ${portalJobId}`);
    entry.published = true;
    return {
      portalJobId,
      portalUrl: `${config.portal.baseUrl}/jobs/${portalJobId}`,
    };
  }

  async remove(portalJobId: string): Promise<void> {
    store.delete(portalJobId);
  }
}

export function getMockPortalStore(): Map<
  string,
  { payload: PortalJobPayload; published: boolean }
> {
  return store;
}
