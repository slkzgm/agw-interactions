// Path: lib/endgameConstants.ts
/**
 * Description: Constants for the Endgame contract
 */

export interface EndgameFunctionItem {
  readonly type: string;
  readonly name?: string;
  readonly stateMutability?: "view" | "pure" | "nonpayable" | "payable";
  readonly inputs?: ReadonlyArray<{
    readonly name?: string;
    readonly type: string;
    readonly internalType?: string;
  }>;
  readonly outputs?: ReadonlyArray<{
    readonly name?: string;
    readonly type: string;
    readonly internalType?: string;
  }>;
}

// Narrowed type for any item whose "type" is "function"
export interface EndgameAbiFunction extends EndgameFunctionItem {
  readonly type: "function";
  readonly name: string; // functions must have a name
  readonly stateMutability: "view" | "pure" | "nonpayable" | "payable";
  readonly inputs?: ReadonlyArray<{
    readonly name?: string;
    readonly type: string;
    readonly internalType?: string;
  }>;
  readonly outputs?: ReadonlyArray<{
    readonly name?: string;
    readonly type: string;
    readonly internalType?: string;
  }>;
}

/**
 * Below is an example ABI for Endgame. If you have the actual ABI from compilation,
 * replace this object with the real one. The snippet includes the main methods
 * from the Solidity code you provided.
 */
export const ENDGAME_ABI = [
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AlreadyFulfilled", type: "error" },
  { inputs: [], name: "RequestNotExist", type: "error" },
  { inputs: [], name: "CallerIsNotOwnerOrDelegateWallet", type: "error" },
  { inputs: [], name: "NotActiveSeason", type: "error" },
  { inputs: [], name: "Paused", type: "error" },
  { inputs: [], name: "Unpaused", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "hero", type: "uint256" }],
    name: "CoolDownPeriod",
    type: "error",
  },
  { inputs: [], name: "HeroDied", type: "error" },
  { inputs: [], name: "HeroNotDied", type: "error" },
  { inputs: [], name: "SeasonNotEnded", type: "error" },
  { inputs: [], name: "InvalidDungeonType", type: "error" },
  { inputs: [], name: "HeroLevelNotMet", type: "error" },
  { inputs: [], name: "RewardsNotConfigured", type: "error" },
  { inputs: [], name: "SumOfRewardsIsNotHundred", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "hero", type: "uint256" }],
    name: "RequestIsAlreadyInProgress",
    type: "error",
  },
  { inputs: [], name: "NotAllowed", type: "error" },
  { inputs: [], name: "Unauthorized", type: "error" },

  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "Death",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "heroId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint40",
        name: "rewardsChance",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "dungeonType",
        type: "uint8",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "indexed heroId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardType",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "dungeonType",
        type: "uint8",
      },
    ],
    name: "Unstaked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "UnstakeRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
    ],
    name: "EmergencyUnstaked",
    type: "event",
  },

  {
    inputs: [
      { internalType: "uint256[]", name: "ids", type: "uint256[]" },
      { internalType: "uint8", name: "_dungeonsType", type: "uint8" },
    ],
    name: "stakeMany",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "ids", type: "uint256[]" }],
    name: "requestUnstakeMany",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "ids", type: "uint256[]" }],
    name: "emergencyUnstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "ids", type: "uint256[]" }],
    name: "unstakeDiedHeroes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint8", name: "dungeonType", type: "uint8" }],
    name: "dungeonRewards",
    outputs: [{ internalType: "uint256[5]", name: "", type: "uint256[5]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isPaused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "togglePause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "withdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint256", name: "randomNumber", type: "uint256" },
    ],
    name: "randomNumberCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/** Replace with your actual deployed Endgame contract address */
export const ENDGAME_CONTRACT_ADDRESS =
  "0xeea334b302bd8b1b96d4ef73b8f4467a347da6f0" as const;
