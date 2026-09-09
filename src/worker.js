export default {
  async fetch(request, env, ctx) {
    return new Response("ALIANCE R.H.S ONLINE", {
      headers: {
        "content-type": "text/plain;charset=UTF-8"
      }
    });
  }
};
