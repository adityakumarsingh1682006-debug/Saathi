import { ethers } from "ethers";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isSepolia: boolean;
  balance: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  error: string | null;
}

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_HEX = "0xaa36a7";

export async function connectInjectedWallet(): Promise<{
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
}> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or Rabby.");
  }

  const ethereum = (window as any).ethereum;
  const provider = new ethers.BrowserProvider(ethereum);
  
  // Request accounts
  await ethereum.request({ method: "eth_requestAccounts" });
  
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  // Switch to Sepolia if on another network
  if (chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_HEX }],
      });
    } catch (switchError: any) {
      // If Sepolia chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_HEX,
              chainName: "Sepolia Test Network",
              nativeCurrency: { name: "SepoliaETH", symbol: "SEP", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org", "https://ethereum-sepolia.publicnode.com"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { address, chainId: SEPOLIA_CHAIN_ID, provider, signer };
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}
