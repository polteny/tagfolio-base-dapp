"use client";

import {
  BadgeCheck,
  Blocks,
  Fingerprint,
  Loader2,
  MapPinned,
  Search,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_ACCENT_LENGTH,
  MAX_CITY_LENGTH,
  MAX_INTEREST_LENGTH,
  MAX_NAME_LENGTH,
  MAX_ROLE_LENGTH,
  tagfolioAbi,
  tagfolioContractAddress,
} from "@/lib/tagfolio";

const ACCENTS = ["#00d1ff", "#ff4f8b", "#8cff5a", "#ffcf45", "#9f7cff"] as const;
const ROLES = ["Builder", "Artist", "Founder", "Collector", "Researcher"] as const;

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(createdAt?: bigint) {
  if (!createdAt) return "--";
  return new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TagCard({
  displayName,
  role,
  interest,
  city,
  accent,
  owner,
  createdAt,
}: {
  displayName: string;
  role: string;
  interest: string;
  city: string;
  accent: string;
  owner?: Address;
  createdAt?: bigint;
}) {
  return (
    <div className="relative overflow-hidden rounded-[7px] border border-[#1d2533] bg-[#f8fbff] p-3 shadow-[0_24px_80px_rgba(9,17,30,0.24)]">
      <div className="absolute left-0 top-0 h-full w-4" style={{ backgroundColor: accent }} />
      <div className="ml-4 rounded-[6px] border border-[#ccd6e5] bg-white">
        <div className="flex items-center justify-between border-b border-[#d8e0eb] px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-full text-[#07101f]"
              style={{ backgroundColor: accent }}
            >
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                Tagfolio Pass
              </p>
              <p className="text-sm font-black text-[#0f172a]">Onchain name tag</p>
            </div>
          </div>
          <Fingerprint className="h-6 w-6 text-[#94a3b8]" />
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_180px]">
          <section>
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
              Hello, I am
            </p>
            <h2 className="mt-3 break-words text-5xl font-black leading-none text-[#07101f]">
              {displayName}
            </h2>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ccd6e5] bg-[#f1f5f9] px-4 py-2 text-sm font-black text-[#0f172a]">
              <BadgeCheck className="h-4 w-4" style={{ color: accent }} />
              {role}
            </div>
            <p className="mt-6 max-w-xl text-xl font-black leading-8 text-[#1e293b]">
              Interested in {interest}
            </p>
          </section>

          <aside className="grid content-between rounded-[6px] border border-[#ccd6e5] bg-[#f8fafc] p-4">
            <div className="grid aspect-square place-items-center rounded-[5px] border border-[#ccd6e5] bg-white">
              <div
                className="grid h-24 w-24 place-items-center rounded-[4px] text-[#07101f]"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 36px ${accent}66`,
                }}
              >
                <Blocks className="h-10 w-10" />
              </div>
            </div>
            <div className="mt-4 space-y-3 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#64748b]">
              <div>
                <p>City</p>
                <p className="mt-1 text-[#0f172a]">{city}</p>
              </div>
              <div>
                <p>Wallet</p>
                <p className="mt-1 text-[#0f172a]">{owner ? shortAddress(owner) : "--"}</p>
              </div>
              <div>
                <p>Created</p>
                <p className="mt-1 text-[#0f172a]">{formatDate(createdAt)}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function TagfolioApp() {
  const [tagIdInput, setTagIdInput] = useState("1");
  const [displayName, setDisplayName] = useState("Tony");
  const [role, setRole] = useState<(typeof ROLES)[number]>("Builder");
  const [interest, setInterest] = useState("Base apps, useful tools, and clean interfaces");
  const [city, setCity] = useState("Shanghai");
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>(ACCENTS[0]);
  const [status, setStatus] = useState("Create a compact event name tag on Base.");

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: writing,
    error: writeError,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedTagId = BigInt(Math.max(1, Number(tagIdInput || "1")));

  const tagQuery = useReadContract({
    abi: tagfolioAbi,
    address: tagfolioContractAddress,
    functionName: "getTag",
    args: [parsedTagId],
    query: {
      enabled: Boolean(tagfolioContractAddress),
      refetchInterval: 12000,
    },
  });

  const totalQuery = useReadContract({
    abi: tagfolioAbi,
    address: tagfolioContractAddress,
    functionName: "nextTagId",
    query: {
      enabled: Boolean(tagfolioContractAddress),
      refetchInterval: 12000,
    },
  });

  const tuple = tagQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const liveTag = useMemo(
    () =>
      tuple
        ? {
            owner: tuple[0],
            displayName: tuple[1],
            role: tuple[2],
            interest: tuple[3],
            city: tuple[4],
            accent: tuple[5],
            createdAt: tuple[6],
          }
        : undefined,
    [tuple],
  );

  const totalTags = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const previewName = liveTag?.displayName ?? displayName;
  const previewRole = liveTag?.role ?? role;
  const previewInterest = liveTag?.interest ?? interest;
  const previewCity = liveTag?.city ?? city;
  const previewAccent = liveTag?.accent ?? accent;

  const canCreate =
    Boolean(tagfolioContractAddress) &&
    isConnected &&
    chainId === base.id &&
    displayName.trim().length > 0 &&
    displayName.trim().length <= MAX_NAME_LENGTH &&
    role.trim().length > 0 &&
    role.trim().length <= MAX_ROLE_LENGTH &&
    interest.trim().length > 0 &&
    interest.trim().length <= MAX_INTEREST_LENGTH &&
    city.trim().length > 0 &&
    city.trim().length <= MAX_CITY_LENGTH &&
    accent.trim().length > 0 &&
    accent.trim().length <= MAX_ACCENT_LENGTH;

  const createBlocker = !tagfolioContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_TAGFOLIO_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base before creating."
        : displayName.trim().length === 0
          ? "Add your display name."
          : interest.trim().length === 0
            ? "Add an interest."
            : city.trim().length === 0
              ? "Add a city."
              : "";

  const statusText = confirmed
    ? "Name tag saved on Base."
    : writeError
      ? writeError.message
      : status;

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> =>
        Boolean(connector),
      )
      .filter(
        (connector, index, queue) =>
          queue.findIndex((item) => item.id === connector.id) === index,
      );

    if (connectorQueue.length === 0) {
      setStatus("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setStatus("Opening wallet connection...");

    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setStatus("Wallet connected. Create your tag when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : "Wallet connection was cancelled.";
    setStatus(
      message.includes("wallet_connect")
        ? "This browser does not support that wallet method. Refresh once, then open inside Base App or a wallet browser."
        : message,
    );
  }

  function createTag() {
    const contractAddress = tagfolioContractAddress;

    if (!canCreate) {
      setStatus(createBlocker || "Check wallet, network, and name tag fields first.");
      return;
    }

    if (!contractAddress) {
      setStatus("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }

    setStatus("Confirm your name tag in your wallet.");
    writeContract({
      address: contractAddress,
      abi: tagfolioAbi,
      functionName: "createTag",
      args: [
        displayName.trim(),
        role.trim(),
        interest.trim(),
        city.trim(),
        accent.trim(),
      ],
      chainId: base.id,
    });
  }

  return (
    <main className="min-h-screen bg-[#e9eef6] text-[#07101f]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[370px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[7px] border border-[#c6d2e2] bg-white/85 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#64748b]">
                Tagfolio
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none">
                Make a Base name tag.
              </h1>
            </div>
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[#07101f]"
              style={{ backgroundColor: accent }}
            >
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[6px] border border-[#c6d2e2] bg-[#f8fafc] p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                Tags
              </p>
              <p className="mt-2 text-3xl font-black">{totalTags}</p>
            </div>
            <div className="rounded-[6px] border border-[#c6d2e2] bg-[#f8fafc] p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                Chain
              </p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 rounded-[7px] border border-[#c6d2e2] bg-[#f8fafc] p-4">
            <h2 className="text-xl font-black">Build tag</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  Display name
                </span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={MAX_NAME_LENGTH}
                  className="mt-1 w-full rounded-[5px] border border-[#c6d2e2] bg-white px-3 py-3 font-black outline-none"
                />
              </label>

              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  Role
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ROLES.map((value) => (
                    <button
                      key={value}
                      className={`rounded-[5px] border px-3 py-2 text-xs font-black ${
                        value === role
                          ? "border-transparent text-[#07101f]"
                          : "border-[#c6d2e2] bg-white text-[#334155]"
                      }`}
                      style={value === role ? { backgroundColor: accent } : undefined}
                      onClick={() => setRole(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  Interest
                </span>
                <textarea
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  maxLength={MAX_INTEREST_LENGTH}
                  rows={3}
                  className="mt-1 w-full rounded-[5px] border border-[#c6d2e2] bg-white px-3 py-3 text-sm font-bold leading-6 outline-none"
                />
              </label>

              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  City
                </span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  maxLength={MAX_CITY_LENGTH}
                  className="mt-1 w-full rounded-[5px] border border-[#c6d2e2] bg-white px-3 py-3 font-black outline-none"
                />
              </label>

              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  Accent
                </span>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {ACCENTS.map((value) => (
                    <button
                      key={value}
                      className="h-10 rounded-full border border-[#c6d2e2]"
                      style={{
                        backgroundColor: value,
                        boxShadow: value === accent ? `0 0 24px ${value}` : undefined,
                      }}
                      onClick={() => setAccent(value)}
                      aria-label={value}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] border border-[#c6d2e2] bg-[#0f172a] px-4 py-3 font-black text-white disabled:opacity-60"
                disabled={switching}
                onClick={() => switchChain({ chainId: base.id })}
              >
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] px-4 py-3 font-black text-[#07101f] disabled:opacity-60"
                style={{ backgroundColor: accent }}
                disabled={writing || confirming}
                onClick={createTag}
              >
                {writing || confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BadgeCheck className="h-4 w-4" />
                )}
                Create on Base
              </button>
            )}

            {isConnected ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] border border-[#c6d2e2] bg-white px-4 py-3 font-black"
                onClick={disconnectWallet}
              >
                {shortAddress(address)}
              </button>
            ) : (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] border border-[#0f172a] bg-[#0f172a] px-4 py-3 font-black text-white disabled:opacity-60"
                disabled={!selectedConnector || connecting}
                onClick={connectWallet}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}

            <p className="rounded-[5px] border border-[#c6d2e2] bg-white px-3 py-3 text-sm font-bold leading-6">
              {statusText}
            </p>
            {createBlocker && isConnected ? (
              <p className="rounded-[5px] border border-[#c6d2e2] bg-[#f8fafc] px-3 py-3 text-xs font-bold leading-5 text-[#475569]">
                {createBlocker}
              </p>
            ) : null}
          </div>
        </aside>

        <section className="grid gap-4">
          <TagCard
            displayName={previewName}
            role={previewRole}
            interest={previewInterest}
            city={previewCity}
            accent={previewAccent}
            owner={liveTag?.owner}
            createdAt={liveTag?.createdAt}
          />

          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="rounded-[7px] border border-[#c6d2e2] bg-white/85 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.1)]">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <h2 className="text-2xl font-black">Load tag</h2>
              </div>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                  Tag ID
                </span>
                <input
                  value={tagIdInput}
                  onChange={(event) =>
                    setTagIdInput(event.target.value.replace(/\D/g, ""))
                  }
                  className="mt-1 w-full rounded-[5px] border border-[#c6d2e2] bg-white px-3 py-3 text-2xl font-black outline-none"
                />
              </label>
            </div>

            <div className="rounded-[7px] border border-[#c6d2e2] bg-white/85 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.1)]">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#64748b]">
                What it does
              </p>
              <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-[#475569]">
                Tagfolio saves a compact event name tag on Base with name, role,
                interest, city, accent color, owner wallet, and timestamp.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#c6d2e2] bg-[#f8fafc] px-3 py-2 text-xs font-black">
                  <MapPinned className="h-4 w-4" /> Meetup ready
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#c6d2e2] bg-[#f8fafc] px-3 py-2 text-xs font-black">
                  <Fingerprint className="h-4 w-4" /> Wallet identity
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
