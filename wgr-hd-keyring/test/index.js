const assert = require('assert')
const HdKeyring = require('..')

async function test(){
  keyring = new HdKeyring({
    numberOfAccounts: 1,
  })

  keyring.addAccounts();


  const originalAccounts = await keyring.getAccounts()
  const serialized = await keyring.serialize()
  const mnemonic = serialized.mnemonic
  
  keyring = new HdKeyring({
    numberOfAccounts: 2,
    mnemonic,
  })
  
  const restoredAccounts = await keyring.getAccounts()

  const msg = `Should restore same account from mnemonic: "${mnemonic}"`
  assert.equal(restoredAccounts[0], originalAccounts[0], msg)
  console.log(msg, originalAccounts, restoredAccounts);
  return true
}

test();