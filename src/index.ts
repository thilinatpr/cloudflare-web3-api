interface Env {
  RPC_URL: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Enable CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Handle POST requests
    if (request.method === "POST") {
      const { method, params } = await request.json();

      // ETH Balance Check
      if (method === "eth_getBalance") {
        const [address, block] = params;
        const response = await fetch(env.RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, block || "latest"],
            id: 1,
          }),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // ERC-20 Balance Check
      if (method === "erc20_balanceOf") {
        const [contract, address] = params;
        const data = `0x70a08231${address.replace("0x", "").padStart(64, "0")}`;
        
        const response = await fetch(env.RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: contract,
              data: data,
            }, "latest"],
            id: 1,
          }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response("Invalid method", { status: 400 });
  },
};