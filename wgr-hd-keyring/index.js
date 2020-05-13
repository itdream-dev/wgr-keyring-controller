const EventEmitter = require('events').EventEmitter
const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39')

// Options:
const hdPathString = "m/44'/7825266'"
const type = 'HD Key Tree'

class HdKeyring extends EventEmitter {

  /* PUBLIC METHODS */
  constructor (opts = {}) {
    super()
    this.type = type
    this.network = {
      messagePrefix: 'unused',
      bip32: {
        public: 0x022d2533,
        private: 0x0221312b
      },
      pubKeyHash: 0x49,
      scriptHash: 0x3f,
      wif: 0xc7
    };
    this.deserialize(opts)
  }

  serialize () {
    return Promise.resolve({
      mnemonic: this.mnemonic,
      numberOfAccounts: this.wallets.length,
      hdPath: this.hdPath,
    })
  }

  deserialize (opts = {}) {
    this.opts = opts || {}
    this.wallets = []
    this.mnemonic = null
    this.root = null
    this.hdPath = opts.hdPath || hdPathString

    if (opts.mnemonic) {
      this._initFromMnemonic(opts.mnemonic)
    }

    if (opts.numberOfAccounts) {
      return this.addAccounts(opts.numberOfAccounts)
    }

    return Promise.resolve([])
  }

  exportKeyPair (address) {
    const wallet = this._getWalletForAccount(address)
    return Promise.resolve(wallet)
  }

  exportAccount (address) {
    const wallet = this._getWalletForAccount(address)
    const privateKey = wallet.toWIF();
    return Promise.resolve(privateKey)
  }

  addAccounts (numberOfAccounts = 1) {
    if (!this.root) {
      this._initFromMnemonic(bip39.generateMnemonic())
    }

    const oldLen = this.wallets.length
    const newWallets = []
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
        const child = this.hdWallet.derivePath(`${this.hdPath}/${i}'/0/0`)
        const wallet = child.keyPair;
        newWallets.push(wallet)
        this.wallets.push(wallet)
    }

    const hexWallets = newWallets.map((w) => {
      return w.getAddress().toString('hex')
    })  
    return Promise.resolve(hexWallets)
  }

  getAccounts () {
    return Promise.resolve(this.wallets.map((w) => {
      return w.getAddress().toString('hex')
    }))
  }

  /* PRIVATE METHODS */

  _initFromMnemonic (mnemonic) {
    this.mnemonic = mnemonic
    const seed = bip39.mnemonicToSeed(mnemonic)        
    this.hdWallet = bitcoin.HDNode.fromSeedHex(seed, this.network);
    this.root = this.hdWallet.derivePath(this.hdPath)    
  }

  _getAddress(keypair) {    
    return keypair.getAddress().toString('hex')
  }

  _getWalletForAccount (account) {
    const targetAddress = account
    const wallet = this.wallets.find((w) => {
      const address = this._getAddress(w)
      return (address === targetAddress)
    })
    
    return wallet
  }
}

HdKeyring.type = type
module.exports = HdKeyring
