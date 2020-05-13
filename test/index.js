const assert = require('assert')
const KeyringController = require('../')
const configManagerGen = require('./lib/mock-config-manager')
const mockEncryptor = require('./lib/mock-encryptor')

//const EdgeEncryptor = require('./lib/edge-encryptor') //, encryptor: new EdgeEncryptor()
const keyringController = new KeyringController({initState: undefined,  configManager: configManagerGen(),
  encryptor: mockEncryptor});
async function createNewVault(password){
  const accounts = await keyringController.getAccounts()
  if (accounts.length > 0) {
    vault = await keyringController.fullUpdate()
  } else {
    vault = await keyringController.createNewVaultAndKeychain(password)
    const accounts = await keyringController.getAccounts()
    console.log('createNewVault-accounts', accounts)    
  }
  console.log('createNewVault-vault', vault)
  return vault
}

async function verifySeedPhrase(){
  const primaryKeyring = keyringController.getKeyringsByType('HD Key Tree')[0]
  if (!primaryKeyring) {
    throw new Error('WagerrController - No HD Key Tree found')
  }

  const serialized = await primaryKeyring.serialize()
  const seedWords = serialized.mnemonic

  const accounts = await primaryKeyring.getAccounts()

  console.log('verifySeedPhrase', seedWords, accounts)
}

async function createNewVaultAndGetSeedPhrase (password) {
  await createNewVault(password)
  const seedWords = await verifySeedPhrase()
}


createNewVaultAndGetSeedPhrase('12341234');