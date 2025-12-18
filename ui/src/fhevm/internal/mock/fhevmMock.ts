//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  console.log("[fhevmMock] Creating mock instance with params:", {
    rpcUrl: parameters.rpcUrl,
    chainId: parameters.chainId,
    metadata: parameters.metadata,
  });
  
  const provider = new JsonRpcProvider(parameters.rpcUrl, undefined, {
    staticNetwork: true,
  });
  
  try {
    const instance = await MockFhevmInstance.create(provider, provider, {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: 55815,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption:
        "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification:
        "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    });
    
    console.log("[fhevmMock] Mock instance created successfully");
    console.log("[fhevmMock] Instance methods:", Object.keys(instance));
    
    return instance;
  } catch (error: any) {
    console.error("[fhevmMock] Failed to create mock instance:", error);
    throw error;
  }
};

