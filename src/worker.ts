export interface Env {
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Try to serve the asset as-is
    let response = await env.ASSETS.fetch(new Request(new URL(pathname, request.url), request));
    
    if (response.status === 404) {
      // For SPA routing: if the path doesn't have a file extension and isn't found,
      // serve index.html instead
      if (!pathname.includes('.')) {
        response = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }
    }

    return response;
  },
};


