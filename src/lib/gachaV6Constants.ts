// Path: src/lib/gachaV6Constants.ts

/**
 * Description: Holds the ABI and contract address for the GachaV6 contract.
 * All logs and comments are in English, and code is production-ready.
 */

export const GACHAV6_ABI = [
  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "implementation", type: "address" },
    ],
    name: "ERC1967InvalidImplementation",
    type: "error",
  },
  { inputs: [], name: "ERC1967NonPayable", type: "error" },
  { inputs: [], name: "ExcessTransferFailed", type: "error" },
  { inputs: [], name: "FailedCall", type: "error" },
  { inputs: [], name: "InsufficientBalance", type: "error" },
  { inputs: [], name: "InvalidAmount", type: "error" },
  { inputs: [], name: "InvalidInitialization", type: "error" },
  { inputs: [], name: "NotInitializing", type: "error" },
  { inputs: [], name: "PoolNotFound", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  { inputs: [], name: "ReferralClaimThreshold", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { inputs: [], name: "UUPSUnauthorizedCallContext", type: "error" },
  {
    inputs: [{ internalType: "bytes32", name: "slot", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
    type: "error",
  },
  { inputs: [], name: "Unauthorized", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "referral",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ClaimReferral",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint64", name: "seqNo", type: "uint64" },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tier",
        type: "uint256",
      },
    ],
    name: "ClaimSettled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      { indexed: false, internalType: "uint64", name: "seqNo", type: "uint64" },
    ],
    name: "ClaimStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        components: [
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRedeemed", type: "uint256" },
          { internalType: "uint256", name: "ticketPrice", type: "uint256" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "tokenBalance", type: "uint256" },
          { internalType: "uint16", name: "memeRatioBPS", type: "uint16" },
          { internalType: "uint16[]", name: "oddsBPS", type: "uint16[]" },
        ],
        indexed: false,
        internalType: "struct Pool",
        name: "pool",
        type: "tuple",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        components: [
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRedeemed", type: "uint256" },
          { internalType: "uint256", name: "ticketPrice", type: "uint256" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "tokenBalance", type: "uint256" },
          { internalType: "uint16", name: "memeRatioBPS", type: "uint16" },
          { internalType: "uint16[]", name: "oddsBPS", type: "uint16[]" },
        ],
        indexed: false,
        internalType: "struct Pool",
        name: "pool",
        type: "tuple",
      },
    ],
    name: "PoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "currentSupply", type: "uint256" },
          { internalType: "uint256", name: "currentPoolId", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "uniswapRouter", type: "address" },
          { internalType: "address", name: "paymentToken", type: "address" },
          { internalType: "address", name: "entropy", type: "address" },
          { internalType: "address", name: "feeWallet", type: "address" },
          { internalType: "uint16", name: "feeBPS", type: "uint16" },
          { internalType: "uint16", name: "referralBPS", type: "uint16" },
          {
            internalType: "uint256",
            name: "referralClaimThreshold",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Config",
        name: "config",
        type: "tuple",
      },
    ],
    name: "SetConfig",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "referral",
        type: "address",
      },
    ],
    name: "TicketsPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "poolId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimReferralFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRedeemed", type: "uint256" },
          { internalType: "uint256", name: "ticketPrice", type: "uint256" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "tokenBalance", type: "uint256" },
          { internalType: "uint16", name: "memeRatioBPS", type: "uint16" },
          { internalType: "uint16[]", name: "oddsBPS", type: "uint16[]" },
        ],
        internalType: "struct Pool",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getConfig",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "currentSupply", type: "uint256" },
          { internalType: "uint256", name: "currentPoolId", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "uniswapRouter", type: "address" },
          { internalType: "address", name: "paymentToken", type: "address" },
          { internalType: "address", name: "entropy", type: "address" },
          { internalType: "address", name: "feeWallet", type: "address" },
          { internalType: "uint16", name: "feeBPS", type: "uint16" },
          { internalType: "uint16", name: "referralBPS", type: "uint16" },
          {
            internalType: "uint256",
            name: "referralClaimThreshold",
            type: "uint256",
          },
        ],
        internalType: "struct Config",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "poolId", type: "uint256" }],
    name: "getPool",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRedeemed", type: "uint256" },
          { internalType: "uint256", name: "ticketPrice", type: "uint256" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "tokenBalance", type: "uint256" },
          { internalType: "uint16", name: "memeRatioBPS", type: "uint16" },
          { internalType: "uint16[]", name: "oddsBPS", type: "uint16[]" },
        ],
        internalType: "struct Pool",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "referral", type: "address" }],
    name: "getReferral",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "tickets", type: "uint256" },
          { internalType: "uint256", name: "awardedAmount", type: "uint256" },
          { internalType: "uint256", name: "claimedAmount", type: "uint256" },
        ],
        internalType: "struct Referral",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolId", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "getTicket",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "purchased", type: "uint256" },
          { internalType: "uint256", name: "claimed", type: "uint256" },
        ],
        internalType: "struct Ticket",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVersion",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolId", type: "uint256" },
      { internalType: "uint16", name: "amount", type: "uint16" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "referral", type: "address" },
      {
        internalType: "uint256",
        name: "minExpectedTokensOut",
        type: "uint256",
      },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "purchase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolId", type: "uint256" },
      { internalType: "uint16", name: "amount", type: "uint16" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "referral", type: "address" },
      {
        internalType: "uint256",
        name: "minExpectedTokensOut",
        type: "uint256",
      },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "purchaseETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint256", name: "entropy", type: "uint256" },
    ],
    name: "randomNumberCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "currentSupply", type: "uint256" },
          { internalType: "uint256", name: "currentPoolId", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "uniswapRouter", type: "address" },
          { internalType: "address", name: "paymentToken", type: "address" },
          { internalType: "address", name: "entropy", type: "address" },
          { internalType: "address", name: "feeWallet", type: "address" },
          { internalType: "uint16", name: "feeBPS", type: "uint16" },
          { internalType: "uint16", name: "referralBPS", type: "uint16" },
          {
            internalType: "uint256",
            name: "referralClaimThreshold",
            type: "uint256",
          },
        ],
        internalType: "struct Config",
        name: "config",
        type: "tuple",
      },
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolId", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "totalSold", type: "uint256" },
          { internalType: "uint256", name: "totalRedeemed", type: "uint256" },
          { internalType: "uint256", name: "ticketPrice", type: "uint256" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "tokenBalance", type: "uint256" },
          { internalType: "uint16", name: "memeRatioBPS", type: "uint16" },
          { internalType: "uint16[]", name: "oddsBPS", type: "uint16[]" },
        ],
        internalType: "struct Pool",
        name: "params",
        type: "tuple",
      },
    ],
    name: "updatePool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const GACHAV6_CONTRACT_ADDRESS =
  "0x3272596F776470D2D7C3f7dfF3dc50888b7D8967";

export const TOKEN_INFO: Record<string, { name: string; symbol: string }> = {
  "0x9ebe3a824ca958e4b3da772d2065518f009cba62": {
    name: "Pengu",
    symbol: "PENGU",
  },
  "0x8041fbc255d6e6330e92a61325da515656bfd2dd": { name: "Yup", symbol: "YUP" },
  "0x85ca16fd0e81659e0b8be337294149e722528731": {
    name: "Noot",
    symbol: "NOOT",
  },
  "0xc325b7e2736a5202bd860f5974d0aa375e57ede5": {
    name: "Abster",
    symbol: "ABSTER",
  },
  "0xd045e0686a784e272e651fc2c08324edabe7403a": {
    name: "Chengu",
    symbol: "CHENGU",
  },
  "0x52629ddbf28aa01aa22b994ec9c80273e4eb5b0a": {
    name: "Retsba",
    symbol: "RETSBA",
  },
  "0x8041FbC255d6E6330E92a61325da515656bFD2dd": {
    name: "Polly",
    symbol: "POLLY",
  },
  "0xDf70075737E9F96B078ab4461EeE3e055E061223": {
    name: "Big",
    symbol: "BIG",
  },
  "0x3439153eb7af838ad19d56e1571fbd09333c2809": {
    name: "Wrapped Ether",
    symbol: "WETH",
  },
  "0x0000000000000000000000000000000000000000": {
    name: "Gacha Points",
    symbol: "GP",
  },
};

export const POOL_NAMES: Record<number, string> = {
  1: "Pengu 1",
  2: "Pengu 2",
  3: "YUP",
  4: "NOOT",
  5: "ABSTER",
  6: "CHENGU",
  7: "RETSBA",
  8: "POLLY",
  9: "BIG"
};
