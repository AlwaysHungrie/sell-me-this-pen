import { TransactionInfo } from './TransactionService'

export const getPrice = () => {
  // todo: update here for dynamic price
  return 3
}

export const checkTransaction = async (transactionInfo: TransactionInfo) => {
  let checkPrice = false
  let checkAddress = false

  const price = getPrice()
  if (transactionInfo.usdcAmount && transactionInfo.isUSDCTx) {
    const usdcAmount = parseFloat(transactionInfo.usdcAmount)
    if (usdcAmount >= price) {
      checkPrice = true
    }
  }

  const chain = transactionInfo.blockchain
  let requiredAddress = process.env.WALLET_ADDRESS
  if (chain === 'solana') {
    requiredAddress = process.env.SOLANA_ADDRESS
  }

  if (
    transactionInfo?.receiverAddress?.toLowerCase() ===
    requiredAddress?.toLowerCase()
  ) {
    checkAddress = true
  }

  return checkPrice && checkAddress
}
