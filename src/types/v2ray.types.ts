// src/types/v2ray.types.ts

/**
 * Defines the structure of a single server object received
 * from the V2Ray proxy API.
 */
export interface V2RayServer {
  id: number;
  name: string;
  host: string;
  port: number;
  image: string; // Even if it's empty, it's part of the contract
  ttl: number;
}
