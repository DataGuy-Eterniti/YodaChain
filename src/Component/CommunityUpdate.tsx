import { useState } from 'react';
import { ethers } from 'ethers';

const MONAD_CHAIN_ID = '0x279F'; // 10143
const CONTRACT_ADDRESS = '0x6a1FD70144A91EDEA6aF7011188A37b32C1936dd';
const ABI = [
  'function submitUpdate(string buildingId, string description) external',
  'function updateCount() view returns (uint256)',
];

const MONAD_NETWORK = {
  chainId: MONAD_CHAIN_ID,
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

type WalletState = 'disconnected' | 'connecting' | 'wrong_network' | 'connected' | 'submitting' | 'success' | 'error';

export default function CommunityUpdate() {
  const [walletState, setWalletState] = useState<WalletState>('disconnected');
  const [account, setAccount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [buildingId, setBuildingId] = useState('');
  const [description, setDescription] = useState('');

  /* ---------- helper: get provider & signer ---------- */
  async function getSigner() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to submit campus updates.');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  }

  /* ---------- switch / add network ---------- */
  async function ensureNetwork() {
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // 4902 means the chain has not been added
      if (switchError.code === 4902) {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  }

  /* ---------- connect wallet ---------- */
  async function connectWallet() {
    if (!window.ethereum) {
      setErrorMessage(
        'MetaMask is not installed. Please install MetaMask to submit campus updates.'
      );
      setWalletState('error');
      return;
    }

    setWalletState('connecting');
    setErrorMessage(null);
    setTxHash(null);

    try {
      // Request accounts
      const accounts = (await window.ethereum!.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned. Please unlock MetaMask and try again.');
      }
      setAccount(accounts[0]);

      // Ensure we're on Monad
      await ensureNetwork();
      setWalletState('connected');
    } catch (err: any) {
      const msg = err?.message ?? err?.code ?? 'Unknown error connecting wallet.';
      setErrorMessage(msg);
      setWalletState('error');
    }
  }

  /* ---------- submit update ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedBuilding = buildingId.trim();
    const trimmedDesc = description.trim();

    if (!trimmedBuilding || !trimmedDesc) {
      setErrorMessage('Please fill in both the building name and description.');
      setWalletState('error');
      return;
    }

    setWalletState('submitting');
    setErrorMessage(null);
    setTxHash(null);

    try {
      const { signer } = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.submitUpdate(trimmedBuilding, trimmedDesc);
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      setWalletState('success');
      setBuildingId('');
      setDescription('');
    } catch (err: any) {
      const msg = err?.reason ?? err?.message ?? 'Transaction failed. Please try again.';
      setErrorMessage(msg);
      setWalletState('error');
    }
  }

  /* ---------- reset ---------- */
  function reset() {
    setWalletState('disconnected');
    setAccount(null);
    setErrorMessage(null);
    setTxHash(null);
    setBuildingId('');
    setDescription('');
  }

  /* ---------- render ---------- */
  return (
    <div className="absolute inset-0 bg-bg overflow-y-auto">
      <div className="px-4 pt-14 pb-28 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-heading font-bold text-text tracking-tight">
            Community Updates
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Share real-time info about campus buildings — roadblocks, closures, events, or
            renovation notices. Updates are recorded on the Monad blockchain.
          </p>
        </div>

        {/* Wallet connection states */}
        {walletState === 'disconnected' && (
          <button
            onClick={connectWallet}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-primary text-bg font-semibold text-sm
              hover:brightness-110 active:scale-[0.97] transition-all duration-150 ease-out shadow-glow"
          >
            {/* Wallet icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-1M3 7a2 2 0 012-2h12l2 2M3 7h18" />
            </svg>
            Connect Wallet
          </button>
        )}

        {walletState === 'connecting' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-text-muted">Connecting to MetaMask...</p>
          </div>
        )}

        {walletState === 'wrong_network' && (
          <div className="text-center py-6">
            <p className="text-sm text-text-muted mb-3">Wrong network detected.</p>
            <button
              onClick={ensureNetwork}
              className="px-5 py-2 rounded-xl bg-primary text-bg font-semibold text-sm
                hover:brightness-110 active:scale-[0.97] transition-all duration-150 ease-out"
            >
              Switch to Monad Testnet
            </button>
          </div>
        )}

        {/* Connected — show form */}
        {(walletState === 'connected' || walletState === 'submitting') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account badge */}
            <div className="flex items-center gap-2 p-3 rounded-xl glass text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-text-muted font-mono text-xs truncate">{account}</span>
              <button
                type="button"
                onClick={reset}
                className="ml-auto text-xs text-text-dim hover:text-text transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* Building name */}
            <div>
              <label htmlFor="buildingId" className="block text-xs font-medium text-text-muted mb-1.5">
                Building Name
              </label>
              <input
                id="buildingId"
                type="text"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                placeholder="e.g. Faculty of Arts Block A"
                disabled={walletState === 'submitting'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-glass-border text-text text-sm
                  placeholder:text-text-dim/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-text-muted mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Road closed for repairs, event happening at the amphitheatre, etc."
                disabled={walletState === 'submitting'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-glass-border text-text text-sm
                  placeholder:text-text-dim/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
                  transition-all duration-200 resize-none disabled:opacity-50"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={walletState === 'submitting'}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-bg font-semibold text-sm
                hover:brightness-110 active:scale-[0.97] transition-all duration-150 ease-out shadow-glow
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {walletState === 'submitting' ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-bg border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                'Submit Update'
              )}
            </button>
          </form>
        )}

        {/* Success state */}
        {walletState === 'success' && txHash && (
          <div className="mt-6 p-4 rounded-xl glass text-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text mb-1">Update Submitted!</h3>
            <p className="text-xs text-text-muted mb-3 break-all font-mono">
              Tx: {txHash}
            </p>
            <a
              href={`https://testnet.monadexplorer.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              View on Explorer
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={reset}
              className="block w-full mt-3 py-2 rounded-xl border border-glass-border text-text-muted text-sm font-medium
                hover:bg-surface-hover hover:text-text active:scale-[0.97] transition-all duration-150 ease-out"
            >
              Submit Another
            </button>
          </div>
        )}

        {/* Error state */}
        {walletState === 'error' && errorMessage && (
          <div className="mt-6 p-4 rounded-xl glass border border-error/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-error mb-0.5">Something went wrong</p>
                <p className="text-xs text-text-muted break-words">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={walletState === 'error' && account ? () => setWalletState('connected') : reset}
              className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium
                hover:bg-primary/20 active:scale-[0.97] transition-all duration-150 ease-out"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Info card */}
        <div className="mt-6 p-4 rounded-xl glass border border-glass-border">
          <h4 className="text-xs font-semibold text-text mb-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Every update is a permanent, timestamped transaction on the Monad blockchain.
            Your wallet address is recorded as the author. This helps keep the campus
            community informed with verifiable, tamper-proof information.
          </p>
        </div>
      </div>
    </div>
  );
}