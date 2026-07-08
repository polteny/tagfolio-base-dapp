import type { Address } from "viem";

export const MAX_NAME_LENGTH = 32;
export const MAX_ROLE_LENGTH = 32;
export const MAX_INTEREST_LENGTH = 48;
export const MAX_CITY_LENGTH = 32;
export const MAX_ACCENT_LENGTH = 16;

export const tagfolioAbi = [
  {
    type: "function",
    name: "createTag",
    stateMutability: "nonpayable",
    inputs: [
      { name: "displayName", type: "string" },
      { name: "role", type: "string" },
      { name: "interest", type: "string" },
      { name: "city", type: "string" },
      { name: "accent", type: "string" },
    ],
    outputs: [{ name: "tagId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getTag",
    stateMutability: "view",
    inputs: [{ name: "tagId", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "displayName", type: "string" },
      { name: "role", type: "string" },
      { name: "interest", type: "string" },
      { name: "city", type: "string" },
      { name: "accent", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextTagId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredTagfolioContractAddress =
  process.env.NEXT_PUBLIC_TAGFOLIO_CONTRACT_ADDRESS?.trim();

export const tagfolioContractAddress = isAddressLike(
  configuredTagfolioContractAddress,
)
  ? (configuredTagfolioContractAddress as Address)
  : undefined;
