import { getAssetFromKV, error } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      return await getAssetFromKV({
        request,
        waitUntil: (promise: Promise<any>) => {
          // Use waitUntil for background operations if needed
        },
      });
    } catch (e: any) {
      if (e.status === 404) {
        return error({ status: 404, statusText: 'Not Found' });
      }
      return error({ status: 500, statusText: 'Internal Server Error' });
    }
  },
};
