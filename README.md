# YodaChain — UNILORIN Smart Campus Navigation

A community-powered campus navigation platform for the University of Ilorin, built for the **BuildAnything Spark Hackathon** on **Monad**.

## The Problem

Google Maps isn't built for navigating a university campus. Students struggle to find lecture theatres, departmental offices, and administrative buildings — and when offices relocate or venues change, there's no reliable way for that information to stay current. Students end up relying on asking strangers for directions.

## The Solution

YodaChain provides a dedicated campus map where students can search for any building, get walking directions, and — critically — submit and verify location updates as a community. Instead of one administrator controlling all changes, updates are written to a Monad smart contract, making every submission traceable, timestamped, and attributable to a wallet address.

## Features

- **Search & Interactive Map** — find any faculty, department, lecture theatre, or facility on campus
- **Live GPS** — see your current location on the map
- **Walking Navigation** — get directions to any destination
- **Community Updates (onchain)** — connect a wallet and submit a real-time campus update (closures, relocations, events), written directly to a Monad Testnet smart contract
- **Saved Locations** — sign in and save frequently visited spots (Supabase-backed)

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Map:** Leaflet, OpenStreetMap
- **Backend (data):** Supabase (auth, saved locations)
- **Blockchain:** Solidity, Monad Testnet, ethers.js, MetaMask

## Blockchain Details

- **Network:** Monad Testnet
- **Chain ID:** `10143`
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Contract Address:** `0x6a1FD70144A91EDEA6aF7011188A37b32C1936dd`
- **Block Explorer:** https://testnet.monadexplorer.com

The smart contract stores each community update's building ID, description, submitter wallet address, and timestamp — creating a transparent, tamper-proof history of campus changes.

## How to Run Locally

```bash
npm install
npm run dev
```

To connect your wallet and submit updates, open the app inside the **MetaMask mobile app's built-in browser** (or a desktop browser with the MetaMask extension installed), since `window.ethereum` is only available in wallet-enabled browser contexts.

## Live Demo

- **App:**[https://5v8i0enwxitz3s4d8x8mt9iv0.nativelyai.app/]
- **Demo Video:** [https://youtu.be/d0yXqGl4B0w]

## Team

Built by Adeniji Elijah for the Spark Hackathon (BuildAnything × Monad).

## Disclaimer

Built independently for the BuildAnything Spark Hackathon. Not an official University of Ilorin application.
