import type { Locals, ServerSession } from '$lib/types';
import type { GetSession, Handle, ServerFetch } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';
import type { User } from '@crkn-rcdr/access-data';

import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Env } from '@crkn-rcdr/access-env';

import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';
import Timeout from 'await-timeout';

const RETRY_DELAY_MS = 10000;

/**
 * A helper method to allow for retries on any api calls that throw errors.
 * Delays each attempt by RETRY_DELAY_MS.
 * Uses semaphore-async-await to prevent any simultaneous calls.
 */
const retry = async (method: Function, numAttempts: number) => {
	let curNumAttempts = 0;
	let response;
	while (curNumAttempts < numAttempts) {
		try {
			response = await method();
			if (response.status >= 200 && response.status < 300) break;
			console.log(`Retry attempt #${curNumAttempts}: `, response);
		} catch (e) {
			console.log(`Retry attempt #${curNumAttempts}: `, e?.message);
			response = e;
		}
		console.log(`Waiting ${RETRY_DELAY_MS}ms before trying again...`);
		await Timeout.set(RETRY_DELAY_MS);
		curNumAttempts++;
	}
	if (curNumAttempts === numAttempts - 1) console.log('Request failed. No more attempts allowed.');
	return response;
};

const verifyToken = (token: string, secret: string): User => {
	const payload = jwt.verify(token, secret) as JwtPayload;
	return {
		name: payload['name'] as string,
		email: payload['email'] as string
	};
};

const getFullpath = (path: string, query: URLSearchParams) => {
	const q = query.toString();
	return q.length > 0 ? `${path}?${q}` : path;
};

// TODO: this is pretty unwieldy, although I doubt it'll need to grow much
export async function handle({ event, resolve }) {
	const env = Env.parse(process.env);

	// we'll need this more than once
	const fullpath = getFullpath(event.url.pathname, event.url.searchParams);

	// Auth
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const token = cookies['auth_token'];

	let user: User;
	if (token) {
		try {
			user = verifyToken(token, env.auth.secret);
		} catch (e) {
			return new Response(`Could not verify authorization token: ${e?.message}`, {
				status: 403,
				headers: {}
			});
		}
	} else {
		const returnUrl = `${env.admin.urlExternal}${fullpath}`;
		const redirectUrl = `${env.auth.url}/azuread/login?redirectUrl=${returnUrl}`;
		return new Response(undefined, {
			status: 307,
			headers: { Location: redirectUrl }
		});
	}

	// I don't know why this is necessary; might have to do with https://github.com/sveltejs/kit/issues/2102
	if (env.mode === 'production' && event.url.pathname.startsWith('/')) {
		try {
			const filepath = pathJoin(process.cwd(), 'static', event.url.pathname.slice(8));
			const file = readFileSync(filepath);
			return new Response(file, { status: 200, headers: {} });
		} catch (e) {
			return new Response('', { status: 404, headers: {} });
		}
	}

	// Fetch api response from lapin and return it
	let url = '';
	if (event.url.pathname.startsWith('/rest/')) {
		url = env.hare.url;
	} else if (event.url.pathname.startsWith('/api/')) {
		url = `${env.lapin.url}/`;
	}

	if (url.length > 0) {
		url = `${url}${fullpath.slice(5)}`;
		let headers = {};

		if (event.request.headers.get('Content-Type'))
			headers['Content-Type'] = event.request.headers.get('content-Type');

		if (event.request.headers.get('Content-Disposition'))
			headers['Content-Disposition'] = event.request.headers.get('Content-Disposition');

		const fetchOptions = {
			method: event.request.method,
			headers
		};

		if (event.request.method !== 'HEAD' && event.request.method !== 'GET') {
			if (event.request.headers.get('Content-Type') === 'application/json') {
				fetchOptions['body'] = JSON.stringify(await event.request.json());
			} else {
				fetchOptions['body'] = await event.request.text();
			}
		}

		try {
			const response = await fetch(url, fetchOptions);

			let body;
			if (event.request.headers.get('Content-Type') === 'application/json') {
				body = await response.json();
				body = JSON.stringify(body);
			} else {
				body = await response.text();
			}

			return new Response(body, {
				status: response.status,
				// @ts-ignore: TypeScript's DOM library doesn't have Headers.entries()
				headers: Object.fromEntries(response.headers.entries())
			});
		} catch (e) {
			console.log(e.message);
			return new Response('error', {
				status: 500,
				headers: {}
			});
		}
	}

	// Set up `locals`
	event.locals.info = {
		restEndpoint: env.admin.urlExternal + '/rest/',
		apiEndpoint: env.admin.urlExternal + '/api',
		authLogout: env.auth.url + '/logout',
		user
	};

	return await resolve(event);
}

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession(event) {
	return event.locals.info;
}

export const serverFetch: ServerFetch = (request) => {
	/* Docker won't have access to local hosts files, and so
     we replace external domains with `127.0.0.1`.
     This assumes the external domain starts with `access`. */

	const url = request.url.replace(
		/^https:\/\/access.*\.canadiana\.ca/,
		`http://127.0.0.1:${process.env['ADMIN_PORT']}`
	);

	return fetch(new Request(url, request));
};
