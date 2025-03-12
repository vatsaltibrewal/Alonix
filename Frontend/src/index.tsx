// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './components/Home.tsx';
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

const wallets = [new PetraWallet()];


const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(<React.StrictMode>
    
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <Home />
    </AptosWalletAdapterProvider>
    
  </React.StrictMode>);
