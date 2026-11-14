"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  ShieldCheck,
  Cpu,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Lock,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import contractsBundle from "@/lib/blockchain/contracts-bundle.json";

const SEPOLIA_CHAIN_ID = 11155111;

export default function BrowserDeployerPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Deployment states
  const [providerRegistryAddr, setProviderRegistryAddr] = useState<string>("");
  const [providerRegistryTx, setProviderRegistryTx] = useState<string>("");
  const [deployingProvider, setDeployingProvider] = useState(false);

  const [consentRegistryAddr, setConsentRegistryAddr] = useState<string>("");
  const [consentRegistryTx, setConsentRegistryTx] = useState<string>("");
  const [deployingConsent, setDeployingConsent] = useState(false);

  const [credentialRegistryAddr, setCredentialRegistryAddr] = useState<string>("");
  const [credentialRegistryTx, setCredentialRegistryTx] = useState<string>("");
  const [deployingCredential, setDeployingCredential] = useState(false);

  const [deployAllActive, setDeployAllActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check MetaMask on mount
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          handleAccountChange(accounts[0]);
        }
      });
      eth.request({ method: "eth_chainId" }).then((cid: string) => {
        setChainId(parseInt(cid, 16));
      });

      const onAccounts = (accs: string[]) => {
        if (accs.length > 0) handleAccountChange(accs[0]);
        else setAccount(null);
      };
      const onChain = (cid: string) => setChainId(parseInt(cid, 16));

      eth.on("accountsChanged", onAccounts);
      eth.on("chainChanged", onChain);

      return () => {
        eth.removeListener("accountsChanged", onAccounts);
        eth.removeListener("chainChanged", onChain);
      };
    }
  }, []);

  const handleAccountChange = async (acc: string) => {
    setAccount(acc);
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const bal = await provider.getBalance(acc);
      setBalance(ethers.formatEther(bal));
      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
    }
  };

  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setErrorMsg("MetaMask not detected. Please install the MetaMask browser extension.");
      return;
    }
    try {
      setConnecting(true);
      setErrorMsg(null);
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        await handleAccountChange(accounts[0]);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to connect MetaMask");
    } finally {
      setConnecting(false);
    }
  };

  const switchToSepolia = async () => {
    if (!(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Add Sepolia network
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Ethereum Sepolia Testnet",
              rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  };

  const deployContract = async (name: "ProviderRegistry" | "ConsentRegistry" | "CredentialStatusRegistry", args: any[] = []) => {
    if (!(window as any).ethereum) throw new Error("MetaMask not found");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const artifact = (contractsBundle as any)[name];
    if (!artifact) throw new Error(`Artifact for ${name} not found`);

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy(...args);
    const deployTx = contract.deploymentTransaction();
    const txHash = deployTx?.hash || "";

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    return { address: contractAddress, txHash };
  };

  const handleDeployProvider = async () => {
    try {
      setDeployingProvider(true);
      setErrorMsg(null);
      const res = await deployContract("ProviderRegistry");
      setProviderRegistryAddr(res.address);
      setProviderRegistryTx(res.txHash);
      return res.address;
    } catch (e: any) {
      setErrorMsg(`ProviderRegistry deployment error: ${e?.message}`);
      throw e;
    } finally {
      setDeployingProvider(false);
    }
  };

  const handleDeployConsent = async (providerAddrOverride?: string) => {
    const pAddr = providerAddrOverride || providerRegistryAddr;
    if (!pAddr) {
      setErrorMsg("ProviderRegistry must be deployed first before deploying ConsentRegistry.");
      return;
    }
    try {
      setDeployingConsent(true);
      setErrorMsg(null);
      const res = await deployContract("ConsentRegistry", [pAddr]);
      setConsentRegistryAddr(res.address);
      setConsentRegistryTx(res.txHash);
      return res.address;
    } catch (e: any) {
      setErrorMsg(`ConsentRegistry deployment error: ${e?.message}`);
      throw e;
    } finally {
      setDeployingConsent(false);
    }
  };

  const handleDeployCredential = async () => {
    try {
      setDeployingCredential(true);
      setErrorMsg(null);
      const res = await deployContract("CredentialStatusRegistry");
      setCredentialRegistryAddr(res.address);
      setCredentialRegistryTx(res.txHash);
      return res.address;
    } catch (e: any) {
      setErrorMsg(`CredentialStatusRegistry deployment error: ${e?.message}`);
      throw e;
    } finally {
      setDeployingCredential(false);
    }
  };

  const handleDeployAll = async () => {
    try {
      setDeployAllActive(true);
      setErrorMsg(null);

      // 1. ProviderRegistry
      const pAddr = await handleDeployProvider();

      // 2. ConsentRegistry
      await handleDeployConsent(pAddr);

      // 3. CredentialStatusRegistry
      await handleDeployCredential();
    } catch (e: any) {
      // Error handled in individual deploy functions
    } finally {
      setDeployAllActive(false);
    }
  };

  const envSnippet = `# SAATHI Smart Contract Deployments (Sepolia)
NEXT_PUBLIC_PROVIDER_REGISTRY_ADDRESS=${providerRegistryAddr || "0x..."}
NEXT_PUBLIC_CONSENT_REGISTRY_ADDRESS=${consentRegistryAddr || "0x..."}
NEXT_PUBLIC_CREDENTIAL_STATUS_REGISTRY_ADDRESS=${credentialRegistryAddr || "0x..."}
NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=${credentialRegistryAddr || "0x..."}
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#19302F] flex flex-col lg:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Topbar title="MetaMask Contract Deployer" subtitle="Deploy SAATHI smart contracts safely with zero private key exposure" />

        <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Back link */}
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B67] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </Link>

          {/* Security Banner */}
          <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/35 flex items-start gap-3.5 text-xs text-[#19302F]">
            <Lock className="w-5 h-5 text-[#176B67] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#176B67]">Zero Private Key Storage Guarantee</div>
              <p className="text-[#667A78] mt-0.5 leading-relaxed">
                You do not need to store your private key or recovery phrase in <code className="px-1.5 py-0.5 rounded bg-white text-[#176B67] font-mono border border-[#7BAE9D]/25">.env.local</code>.
                When you deploy through this interface, transactions are signed and broadcast directly by your authenticated MetaMask browser extension.
              </p>
            </div>
          </div>

          {/* Wallet Status Card */}
          <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#176B67]" />
                  <span>MetaMask Connection</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Connected wallet acts as the official owner/deployer of the contracts.
                </CardDescription>
              </div>

              {!account ? (
                <Button
                  onClick={connectMetaMask}
                  disabled={connecting}
                  className="bg-[#176B67] hover:bg-[#135855] text-white font-bold"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {connecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Badge variant="default" dot className="font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </Badge>
                  {chainId === SEPOLIA_CHAIN_ID ? (
                    <Badge variant="success" dot>
                      Sepolia (11155111)
                    </Badge>
                  ) : (
                    <Button
                      onClick={switchToSepolia}
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                    >
                      Switch to Sepolia
                    </Button>
                  )}
                </div>
              )}
            </div>

            {account && (
              <div className="mt-4 pt-4 border-t border-[#7BAE9D]/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#667A78]">Account:</span>
                  <div className="font-mono font-semibold truncate text-[#19302F]">{account}</div>
                </div>
                <div>
                  <span className="text-[#667A78]">Sepolia Balance:</span>
                  <div className="font-mono font-semibold text-[#176B67]">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : "Loading..."}</div>
                </div>
                <div>
                  <span className="text-[#667A78]">Network RPC:</span>
                  <div className="font-mono text-[#667A78] truncate">ethereum-sepolia-rpc.publicnode.com</div>
                </div>
              </div>
            )}
          </Card>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* One-Click Deploy All Button */}
          {account && chainId === SEPOLIA_CHAIN_ID && (
            <div className="flex justify-end">
              <Button
                onClick={handleDeployAll}
                disabled={deployAllActive || deployingProvider || deployingConsent || deployingCredential}
                className="bg-[#176B67] hover:bg-[#135855] text-white font-bold h-11 px-6 shadow-sm gap-2"
              >
                {deployAllActive ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deploying Full Suite...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Deploy All 3 Contracts in Sequence</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Deployment Step Cards */}
          <div className="space-y-4">
            {/* Step 1: ProviderRegistry */}
            <Card className="p-5 border-[#7BAE9D]/25 bg-white/95 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E6F3EF] text-[#176B67] font-bold text-xs flex items-center justify-center">1</span>
                    <h3 className="font-bold text-sm text-[#19302F]">ProviderRegistry.sol</h3>
                    {providerRegistryAddr && <Badge variant="success">Deployed</Badge>}
                  </div>
                  <p className="text-xs text-[#667A78]">
                    Maintains healthcare provider licenses, accreditation status, and regulatory verification.
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    onClick={handleDeployProvider}
                    disabled={!account || chainId !== SEPOLIA_CHAIN_ID || deployingProvider || !!providerRegistryAddr}
                    variant={providerRegistryAddr ? "outline" : "default"}
                    size="sm"
                    className={providerRegistryAddr ? "text-green-700 border-green-300" : "bg-[#176B67] text-white"}
                  >
                    {deployingProvider ? "Confirming in MetaMask..." : providerRegistryAddr ? "Deployed" : "Deploy ProviderRegistry"}
                  </Button>
                </div>
              </div>

              {providerRegistryAddr && (
                <div className="mt-3 pt-3 border-t border-[#7BAE9D]/15 text-xs font-mono space-y-1 bg-[#F7FAF8] p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667A78]">Contract Address:</span>
                    <span className="text-[#176B67] font-bold">{providerRegistryAddr}</span>
                  </div>
                  {providerRegistryTx && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#667A78]">Tx Hash:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${providerRegistryTx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#176B67] hover:underline flex items-center gap-1"
                      >
                        <span>{providerRegistryTx.slice(0, 14)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Step 2: ConsentRegistry */}
            <Card className="p-5 border-[#7BAE9D]/25 bg-white/95 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E6F3EF] text-[#176B67] font-bold text-xs flex items-center justify-center">2</span>
                    <h3 className="font-bold text-sm text-[#19302F]">ConsentRegistry.sol</h3>
                    {consentRegistryAddr && <Badge variant="success">Deployed</Badge>}
                  </div>
                  <p className="text-xs text-[#667A78]">
                    Enforces patient consent permits, EIP-712 typed structured data, nonces, and emergency break-glass.
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    onClick={() => handleDeployConsent()}
                    disabled={!account || chainId !== SEPOLIA_CHAIN_ID || !providerRegistryAddr || deployingConsent || !!consentRegistryAddr}
                    variant={consentRegistryAddr ? "outline" : "default"}
                    size="sm"
                    className={consentRegistryAddr ? "text-green-700 border-green-300" : "bg-[#176B67] text-white"}
                  >
                    {deployingConsent ? "Confirming in MetaMask..." : consentRegistryAddr ? "Deployed" : "Deploy ConsentRegistry"}
                  </Button>
                </div>
              </div>

              {consentRegistryAddr && (
                <div className="mt-3 pt-3 border-t border-[#7BAE9D]/15 text-xs font-mono space-y-1 bg-[#F7FAF8] p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667A78]">Contract Address:</span>
                    <span className="text-[#176B67] font-bold">{consentRegistryAddr}</span>
                  </div>
                  {consentRegistryTx && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#667A78]">Tx Hash:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${consentRegistryTx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#176B67] hover:underline flex items-center gap-1"
                      >
                        <span>{consentRegistryTx.slice(0, 14)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Step 3: CredentialStatusRegistry */}
            <Card className="p-5 border-[#7BAE9D]/25 bg-white/95 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E6F3EF] text-[#176B67] font-bold text-xs flex items-center justify-center">3</span>
                    <h3 className="font-bold text-sm text-[#19302F]">CredentialStatusRegistry.sol</h3>
                    {credentialRegistryAddr && <Badge variant="success">Deployed</Badge>}
                  </div>
                  <p className="text-xs text-[#667A78]">
                    Stores cryptographic status anchors and revocation reasons for W3C Verifiable Credentials.
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    onClick={handleDeployCredential}
                    disabled={!account || chainId !== SEPOLIA_CHAIN_ID || deployingCredential || !!credentialRegistryAddr}
                    variant={credentialRegistryAddr ? "outline" : "default"}
                    size="sm"
                    className={credentialRegistryAddr ? "text-green-700 border-green-300" : "bg-[#176B67] text-white"}
                  >
                    {deployingCredential ? "Confirming in MetaMask..." : credentialRegistryAddr ? "Deployed" : "Deploy CredentialStatusRegistry"}
                  </Button>
                </div>
              </div>

              {credentialRegistryAddr && (
                <div className="mt-3 pt-3 border-t border-[#7BAE9D]/15 text-xs font-mono space-y-1 bg-[#F7FAF8] p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667A78]">Contract Address:</span>
                    <span className="text-[#176B67] font-bold">{credentialRegistryAddr}</span>
                  </div>
                  {credentialRegistryTx && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#667A78]">Tx Hash:</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${credentialRegistryTx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#176B67] hover:underline flex items-center gap-1"
                      >
                        <span>{credentialRegistryTx.slice(0, 14)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Generated Environment Configuration */}
          {(providerRegistryAddr || consentRegistryAddr || credentialRegistryAddr) && (
            <Card className="p-6 border-[#7BAE9D]/30 bg-white/95 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#19302F]">
                    Deployed Environment Variables (.env.local)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Copy and paste these values into your <code className="font-mono text-[#176B67]">.env.local</code> to activate live Sepolia contract integration.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCopyEnv}
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs border-[#7BAE9D]/40 text-[#176B67]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Values"}</span>
                </Button>
              </div>

              <pre className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/25 text-xs font-mono text-[#19302F] overflow-x-auto whitespace-pre">
                {envSnippet}
              </pre>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
