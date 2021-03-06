"use strict";

const fingateABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_jthash",
        type: "bytes32"
      },
      {
        name: "_dest",
        type: "address"
      },
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "withdrawToken",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "depositTotal",
    outputs: [
      {
        name: "total",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    name: "withdrawHistory",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_user",
        type: "address"
      }
    ],
    name: "depositState",
    outputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "jtaddress",
        type: "string"
      },
      {
        name: "state",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_jthash",
        type: "bytes32"
      },
      {
        name: "_address",
        type: "address"
      },
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_state",
        type: "uint256"
      }
    ],
    name: "depositTokenDone",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_jtaddress",
        type: "string"
      }
    ],
    name: "deposit",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_jthash",
        type: "bytes32"
      },
      {
        name: "_dest",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "withdraw",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_token",
        type: "address"
      }
    ],
    name: "depositTokenTotal",
    outputs: [
      {
        name: "total",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_jtaddress",
        type: "string"
      },
      {
        name: "_token",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_hash",
        type: "bytes32"
      }
    ],
    name: "depositToken",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_jthash",
        type: "bytes32"
      },
      {
        name: "_address",
        type: "address"
      },
      {
        name: "_state",
        type: "uint256"
      }
    ],
    name: "depositDone",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "address"
      },
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "tokens",
    outputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "jtaddress",
        type: "string"
      },
      {
        name: "progress",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    name: "depositHistory",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_admin",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_token",
        type: "address"
      },
      {
        indexed: true,
        name: "_caller",
        type: "address"
      },
      {
        indexed: true,
        name: "_user",
        type: "address"
      },
      {
        indexed: false,
        name: "_jtaddress",
        type: "string"
      },
      {
        indexed: false,
        name: "_hash",
        type: "bytes32"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "state",
        type: "uint256"
      }
    ],
    name: "Deposit",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_token",
        type: "address"
      },
      {
        indexed: true,
        name: "_user",
        type: "address"
      },
      {
        indexed: false,
        name: "_jthash",
        type: "bytes32"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_balance",
        type: "uint256"
      }
    ],
    name: "Withdraw",
    type: "event"
  }
];

export default fingateABI;
