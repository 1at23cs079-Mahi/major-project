import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signer = await browserProvider.getSigner();
                const network = await browserProvider.getNetwork();

                setAccount(accounts[0]);
                setProvider(browserProvider);
                setSigner(signer);
                setChainId(network.chainId);
                setError(null);
            } catch (err) {
                console.error("Connection failed", err);
                setError("Failed to connect wallet.");
            }
        } else {
            setError("MetaMask not found. Please install it.");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) setAccount(accounts[0]);
                else disconnectWallet();
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const value = {
        account,
        provider,
        signer,
        chainId,
        error,
        connectWallet,
        disconnectWallet,
        isConnected: !!account
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};
