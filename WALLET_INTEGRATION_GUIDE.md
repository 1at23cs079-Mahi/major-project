# Web3 Wallet Integration Guide

## Overview
The Healthcare Management System now supports **Web3 wallet integration** using MetaMask. This allows users to link their blockchain identity to their healthcare account for enhanced security and decentralized data control.

## Features

### ✅ Implemented
- **MetaMask Detection**: Automatically detects if MetaMask is installed
- **Wallet Connection**: One-click connection to MetaMask
- **Wallet Disconnection**: Easy disconnect functionality
- **Account Display**: Shows abbreviated wallet address when connected
- **Error Handling**: Clear error messages for connection issues
- **Optional Feature**: Wallet connection is optional during registration
- **Visual Feedback**: Different UI states for connected/disconnected status
- **Installation Prompt**: Link to install MetaMask if not detected

### 🎯 Benefits
1. **🔒 Secure & Private**: Medical records are anchored on blockchain
2. **🎯 Full Control**: Users own and control access to their health data
3. **✅ Verifiable**: Tamper-proof verification of prescriptions and records
4. **🌍 Portable**: Access health records anywhere, anytime

## User Flow

### 1. Registration Page
When users navigate to the registration page, they see:

#### Without MetaMask
```
⛓️ Blockchain Identity [Optional]
Connect your Web3 wallet (MetaMask) for decentralized health records

⚠️ MetaMask not detected. Install MetaMask

[🦊 Connect MetaMask] (button)
```

#### With MetaMask Installed
```
⛓️ Blockchain Identity [Optional]
Connect your Web3 wallet (MetaMask) for decentralized health records

[🦊 Connect MetaMask] (button)
```

#### After Connection
```
⛓️ Blockchain Identity [Optional]
✅ Your wallet is connected and will be linked to your account

✅ 0x1234...5678  [Disconnect] (button)
```

### 2. Wallet Connection Process

**Step 1**: User clicks "🦊 Connect MetaMask" button
- Button shows loading state: "🔄 Connecting..."

**Step 2**: MetaMask popup appears
- User can see which account to connect
- User approves the connection

**Step 3**: Success
- Wallet address is displayed
- Green success message appears
- "Disconnect" button becomes available

### 3. Registration with Wallet
When user submits registration form:
- If wallet is connected: `wallet_address` is included in registration data
- If wallet is not connected: Registration proceeds without wallet (optional)

## Technical Implementation

### Frontend Components

#### Web3Context (`frontend/src/context/Web3Context.js`)
```javascript
{
  account,           // Connected wallet address (0x...)
  provider,          // ethers.js BrowserProvider
  signer,            // ethers.js Signer
  chainId,           // Network chain ID
  error,             // Web3 error messages
  connectWallet,     // Function to connect MetaMask
  disconnectWallet,  // Function to disconnect wallet
  isConnected        // Boolean: wallet connection status
}
```

#### Register Component Enhancements
**New State Variables:**
```javascript
const [walletError, setWalletError] = useState('');
const [connectingWallet, setConnectingWallet] = useState(false);
```

**New Functions:**
```javascript
handleConnectWallet()    // Handles wallet connection with error handling
handleDisconnectWallet() // Handles wallet disconnection
```

### Backend Integration

#### User Model
The `wallet_address` field is stored in the users table:
```javascript
wallet_address: {
    type: DataTypes.STRING(42),
    allowNull: true,
    unique: true
}
```

#### Registration Endpoint
When wallet is connected, the address is included:
```javascript
{
  email: "patient@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
  wallet_address: "0x1234567890abcdef1234567890abcdef12345678"
}
```

## User Instructions

### For First-Time Users

#### 1. Install MetaMask
If you don't have MetaMask installed:
1. Visit [metamask.io/download](https://metamask.io/download/)
2. Choose your browser (Chrome, Firefox, Edge, Brave)
3. Click "Install MetaMask"
4. Follow the setup wizard to create a new wallet
5. **IMPORTANT**: Save your secret recovery phrase securely

#### 2. Connect Wallet During Registration
1. Navigate to the registration page
2. Fill in your basic information
3. In the "⛓️ Blockchain Identity" section, click "🦊 Connect MetaMask"
4. MetaMask popup will appear - click "Next" then "Connect"
5. Your wallet address will appear (e.g., ✅ 0x1234...5678)
6. Complete the rest of the registration form
7. Submit - your wallet will be linked to your account

#### 3. What Happens After Registration?
- Your wallet address is stored with your account
- Future blockchain operations (medical records, prescriptions) will use this address
- You maintain full control over your data through your wallet

### For Existing MetaMask Users

1. Make sure MetaMask is unlocked
2. Click "🦊 Connect MetaMask" during registration
3. Approve the connection in MetaMask popup
4. Continue with registration

## Troubleshooting

### "MetaMask not detected"
**Problem**: MetaMask extension is not installed or not enabled

**Solutions**:
1. Install MetaMask from [metamask.io/download](https://metamask.io/download/)
2. Check if MetaMask extension is enabled in your browser settings
3. Refresh the page after installing MetaMask
4. Try a different browser if issues persist

### "Failed to connect wallet"
**Problem**: Connection was rejected or timed out

**Solutions**:
1. Make sure MetaMask is unlocked
2. Check that you clicked "Connect" in the MetaMask popup
3. Try disconnecting and reconnecting
4. Restart your browser and try again

### "User rejected the request"
**Problem**: Connection was manually cancelled in MetaMask

**Solution**: Click "🦊 Connect MetaMask" again and approve the connection

### Wallet connected but address not showing
**Problem**: State synchronization issue

**Solutions**:
1. Click "Disconnect" and connect again
2. Refresh the page
3. Check browser console for errors

## Security Best Practices

### For Users
1. ✅ **Never share your secret recovery phrase** with anyone
2. ✅ **Verify the website URL** before connecting your wallet
3. ✅ **Use a strong password** for your MetaMask wallet
4. ✅ **Keep MetaMask updated** to the latest version
5. ✅ **Review permissions** before approving transactions

### For Developers
1. ✅ **Never request private keys** from users
2. ✅ **Use HTTPS** in production
3. ✅ **Validate wallet addresses** on backend
4. ✅ **Log wallet connection events** for security audit
5. ✅ **Handle errors gracefully** without exposing sensitive info

## Future Enhancements

### Planned Features
- [ ] **Multi-wallet Support**: WalletConnect for mobile wallets
- [ ] **Network Detection**: Show warning if wrong network
- [ ] **Signature Verification**: Sign message to verify ownership
- [ ] **Transaction History**: View blockchain transactions
- [ ] **Gas Estimation**: Show estimated costs before transactions
- [ ] **Smart Contract Integration**: Deploy and interact with health data contracts

### Blockchain Features (Coming Soon)
- [ ] **Consent Management**: Grant/revoke access via smart contracts
- [ ] **Medical Record Anchoring**: Hash records on blockchain
- [ ] **Prescription Verification**: Verify prescriptions on-chain
- [ ] **Health Data NFTs**: Mint health records as NFTs

## Testing

### Manual Testing Checklist

#### Registration Flow
- [ ] Page loads without MetaMask - shows install link
- [ ] Page loads with MetaMask - shows connect button
- [ ] Click "Connect MetaMask" - MetaMask popup appears
- [ ] Approve connection - wallet address displays
- [ ] Click "Disconnect" - wallet disconnects
- [ ] Submit registration without wallet - succeeds
- [ ] Submit registration with wallet - wallet_address saved
- [ ] Try connecting already-connected wallet - handles gracefully

#### Error Handling
- [ ] Reject connection in MetaMask - shows error message
- [ ] Lock MetaMask after connecting - handles gracefully
- [ ] Switch accounts in MetaMask - updates address
- [ ] Uninstall MetaMask while connected - shows install message

#### UI/UX
- [ ] "Optional" badge visible
- [ ] Benefits list displays when disconnected
- [ ] Success message appears on connection
- [ ] Loading state shows while connecting
- [ ] Disconnect button appears when connected
- [ ] Responsive on mobile devices

## API Reference

### Web3Context Methods

#### `connectWallet()`
Initiates MetaMask connection flow
```javascript
const { connectWallet } = useWeb3();
await connectWallet();
```

**Returns**: Promise<void>

**Throws**: Error if MetaMask not installed or user rejects

#### `disconnectWallet()`
Disconnects the current wallet
```javascript
const { disconnectWallet } = useWeb3();
disconnectWallet();
```

**Returns**: void

#### `isConnected`
Boolean indicating wallet connection status
```javascript
const { isConnected } = useWeb3();
if (isConnected) {
  // Wallet is connected
}
```

#### `account`
Current connected wallet address
```javascript
const { account } = useWeb3();
console.log(account); // "0x1234...5678"
```

## File Structure

```
frontend/
├── src/
│   ├── context/
│   │   └── Web3Context.js          # Web3 provider with wallet connection
│   ├── pages/
│   │   └── Register.js             # Registration with wallet integration
│   └── index.css                   # Styles for wallet UI components

backend/
├── models/
│   └── User.js                     # User model with wallet_address field
└── controllers/
    └── authControllerEnhanced.js   # Stores wallet_address on registration
```

## Support

### Common Questions

**Q: Is wallet connection required?**
A: No, it's optional. You can register and use the system without connecting a wallet.

**Q: Can I add my wallet later?**
A: Yes, wallet linking from profile settings is planned for future updates.

**Q: What blockchain network is used?**
A: Currently supports Ethereum and compatible networks (Polygon, BSC, etc.)

**Q: Are there any costs?**
A: Connecting your wallet is free. Future blockchain transactions may have gas fees.

**Q: Is my private key secure?**
A: Yes, we never request or store private keys. MetaMask manages your keys securely.

---

**Last Updated**: January 2026
**Status**: ✅ Functional
**Version**: 1.0
