import React, { useState, useEffect } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import "./Home.css";

// Define NFT type
interface NFT {
  creator: string;
  description: string;
  supply: string;
  price: string;
  metadata_uri: string;
  total_minted: string;
}

const Home: React.FC = () => {
  const CONTRACT_ADDRESS =
    "8a798635ca9ad165a7b4559be1353de1d1ab7cfffa1daeb370a7e2f6e2c754d4";
  const aa = new Aptos(new AptosConfig({ fullnode: "https://aptos.testnet.bardock.movementlabs.xyz/v1" }));
  const mname = "brand_nft_collection";

  const [activeTab, setActiveTab] = useState("buy");
  const [nfts, setNfts] = useState<NFT[]>([]); // Typed state
  const [buyMessage, setBuyMessage] = useState("");
  const [collectionData, setCollectionData] = useState({
    collectionName: "",
    description: "",
    supply: "",
    price: "",
    imageUrl: "",
  });
  const [collectionMessage, setCollectionMessage] = useState("");
  const { connected, account, signAndSubmitTransaction } = useWallet();

  useEffect(() => {
    // Fetch NFTs when the component mounts
    displaynfts();
  }, []);

  const displaynfts = async () => {
    try {
      const response = await aa.getAccountResource({
        accountAddress: CONTRACT_ADDRESS,
        resourceType:
          `0x${CONTRACT_ADDRESS}::brand_nft_collection::CollectionList`,
      });
      const reports: NFT[] = response.reports; // Type the fetched data
      setNfts(reports);
      console.log("Fetched NFTs:", reports);
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
    }
  };

  const mintnft = async (nft: NFT) =>{
    if (!account) {
      console.error("Wallet not connected!");
      return;
    }

    const payload: InputTransactionData = {
      data: {
        function: `0x${CONTRACT_ADDRESS}::${mname}::mint_nft`,
        functionArguments: [nft.description,nft.description,account?.address]
      },
    };

    try {
      const txnRequest = await signAndSubmitTransaction(payload);
      console.log("Collection created, Transaction Hash:", txnRequest.hash);
      displaynfts(); // Refresh NFTs after creating a collection
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
  }

  const handleBuySubmit = async (nft: NFT) => {
    mintnft(nft);
    setBuyMessage(`You have successfully purchased ${nft.description} for ${nft.price} MOVE.`);
  };


  const  handleClaimSubmit = async (nft:NFT) => {
    if (!account) {
      console.error("Wallet not connected!");
      return;
    }

    const payload: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::${mname}::burn_nft`,
        functionArguments: [nft.description,account?.address]
      },
    };

    try {
      const txnRequest = await signAndSubmitTransaction(payload);
      console.log("Collection created, Transaction Hash:", txnRequest.hash);
      displaynfts(); // Refresh NFTs after creating a collection
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setBuyMessage("");
    setCollectionMessage("");
  };

  const handleCollectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCollectionData({ ...collectionData, [name]: value });
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      console.error("Wallet not connected!");
      return;
    }

    const payload: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::${mname}::create_collection`,
        functionArguments: [
          collectionData.description,
          collectionData.collectionName,
          parseInt(collectionData.supply),
          collectionData.imageUrl,
          parseInt(collectionData.price),
        ],
      },
    };

    try {
      const txnRequest = await signAndSubmitTransaction(payload);
      console.log("Collection created, Transaction Hash:", txnRequest.hash);
      displaynfts(); // Refresh NFTs after creating a collection
      setCollectionMessage(
        `Collection "${collectionData.collectionName}" has been created successfully!`
      );
      setCollectionData({
        collectionName: "",
        description: "",
        supply: "",
        price: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
  };

  return (
    <div className="container">
      <div className="wallet-connection">
        <h1>Alonix</h1>
        <WalletSelector />
        {connected && (
          <p className="connected-info">Connected: {account?.address}</p>
        )}
      </div>

      <div className="tabs">
        <button
          onClick={() => handleTabChange("buy")}
          className={activeTab === "buy" ? "active" : ""}
        >
          Buy / Claim NFTs
        </button>
        <button
          onClick={() => handleTabChange("create")}
          className={activeTab === "create" ? "active" : ""}
        >
          Create Collection Drop
        </button>
      </div>

     {activeTab === "buy" && (
  <div className="nft-grid">
    {nfts.length > 0 ? (
      nfts.map((nft, index) => (
        <div className="nft-card" key={index}>
          <img
            src={nft.metadata_uri}
            alt={nft.description}
            className="nft-image"
          />
          <h3>{nft.description}</h3>
          <p>Price: {nft.price} MOVE</p>
          <p>Supply: {nft.supply}</p>
          <div className="nft-actions" style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleBuySubmit(nft)} style={{ padding: '10px', cursor: 'pointer' }}>Buy</button>
            <button onClick={() => handleClaimSubmit(nft)} style={{ padding: '10px', cursor: 'pointer' }}>Claim</button>
          </div>
        </div>
      ))
    ) : (
      <p>No NFTs available</p>
    )}
  </div>
  )}
      {buyMessage && <p className="confirmation-message">{buyMessage}</p>}

      {activeTab === "create" && (
        <div className="collection-form">
          <h3>Create a New Collection</h3>
          <form onSubmit={handleCollectionSubmit}>
            <input
              type="text"
              name="collectionName"
              placeholder="Collection Name"
              value={collectionData.collectionName}
              onChange={handleCollectionChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={collectionData.description}
              onChange={handleCollectionChange}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={collectionData.price}
              onChange={handleCollectionChange}
              required
            />
            <input
              type="number"
              name="supply"
              placeholder="Supply"
              value={collectionData.supply}
              onChange={handleCollectionChange}
              required
            />
            <input
              type="text"
              name="imageUrl"
              placeholder="Image URL"
              value={collectionData.imageUrl}
              onChange={handleCollectionChange}
              required
            />
            <button type="submit">Create Collection</button>
          </form>
          {collectionMessage && (
            <p className="confirmation-message">{collectionMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
