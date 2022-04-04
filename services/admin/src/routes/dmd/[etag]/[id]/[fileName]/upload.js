import { Env } from '@crkn-rcdr/access-env';
const env = Env.parse(process.env);
export async function put({ params, request }) {
	const body = request.body;
	const { etag, id, fileName } = params;
	const url = `${env.couch.url}/dmdtask/${id}/${fileName}`;
	const res = await fetch(url, {
		headers: {
			Authorization: 'Basic ' + btoa(`${env.couch.auth.username}:${env.couch.auth.password}`),
			Accept: 'application/json',
			'Content-Type': 'application/octet-stream',
			'If-Match': etag
		},
		method: 'PUT',
		body: body
	});
	if (res.status === 201) {
		return {
			body: { success: true }
		};
	}
	return {
		status: res.status,
		body: { success: false }
	};
}
