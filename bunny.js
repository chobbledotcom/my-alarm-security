import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.11.2";

/**
 * When a response is not served from the cache, you can use this event handler
 * to modify the request going to the origin.
 *
 * @param {Context} context - The context of the middleware.
 * @param {Request} context.request - The current request.
 */
async function onOriginRequest(context: { request: Request }): Promise<Response> | Response | Promise<Request> | Request | void {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Handle .php requests by rewriting the URL (removing .php and adding trailing slash)
  if (pathname.endsWith('.php')) {
    const newUrl = new URL(context.request.url);
    newUrl.pathname = pathname.replace(/\.php$/, '/');

    // Create a new request with the rewritten URL
    return new Request(newUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body
    });
  }

  // Continue with the original request if no rewrite needed
  return context.request;
}

/**
 * When a response is not served from the cache, you can use this event handler
 * to modify the response going from the origin.
 * This modify the response before being cached.
 *
 * Returns an HTTP response.
 * @param {Context} context - The context of the middleware.
 * @param {Request} request - The current request done to the origin.
 * @param {Response} response - The HTTP response or string.
 */
async function onOriginResponse(context: { request: Request, response: Response }): Promise<Response> | Response | void {
  // Add security headers
  context.response.headers.set('X-Content-Type-Options', 'nosniff');
  context.response.headers.set('X-Frame-Options', 'DENY');
  context.response.headers.set('X-XSS-Protection', '1; mode=block');

  return context.response;
}

BunnySDK.net.http.servePullZone()
  .onOriginRequest(onOriginRequest)
  .onOriginResponse(onOriginResponse);