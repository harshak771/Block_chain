// Demo wallet system for Vercel deployment
// This allows users to have fake ETH and make simulated transactions

const DEMO_STORAGE_KEY = "demo_wallet_balance"
const DEMO_TRANSACTIONS_KEY = "demo_transactions"
const INITIAL_DEMO_BALANCE = 1000 // 1000 ETH for demo

export interface DemoTransaction {
  id: string
  type: "purchase" | "mint" | "receive"
  amount: string
  from: string
  to: string
  recipeTitle?: string
  timestamp: number
  hash: string
}

// Get demo balance from localStorage
export function getDemoBalance(): number {
  if (typeof window === "undefined") return INITIAL_DEMO_BALANCE
  
  const stored = localStorage.getItem(DEMO_STORAGE_KEY)
  if (!stored) {
    // Initialize with 1000 ETH
    localStorage.setItem(DEMO_STORAGE_KEY, INITIAL_DEMO_BALANCE.toString())
    return INITIAL_DEMO_BALANCE
  }
  return parseFloat(stored)
}

// Set demo balance
export function setDemoBalance(balance: number): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_STORAGE_KEY, balance.toString())
}

// Add ETH to demo balance
export function addDemoETH(amount: number): number {
  const current = getDemoBalance()
  const newBalance = current + amount
  setDemoBalance(newBalance)
  return newBalance
}

// Deduct ETH from demo balance (for purchases)
export function deductDemoETH(amount: number): { success: boolean; newBalance: number; error?: string } {
  const current = getDemoBalance()
  if (current < amount) {
    return { success: false, newBalance: current, error: "Insufficient demo balance" }
  }
  const newBalance = current - amount
  setDemoBalance(newBalance)
  return { success: true, newBalance }
}

// Get demo transactions
export function getDemoTransactions(): DemoTransaction[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(DEMO_TRANSACTIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

// Add demo transaction
export function addDemoTransaction(tx: Omit<DemoTransaction, "id" | "hash">): DemoTransaction {
  const transactions = getDemoTransactions()
  const newTx: DemoTransaction = {
    ...tx,
    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
  }
  transactions.unshift(newTx)
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(transactions.slice(0, 50)))
  }
  return newTx
}

// Simulate a purchase transaction
export function simulatePurchase(
  buyerAddress: string,
  sellerAddress: string,
  amount: string,
  recipeTitle: string
): { success: boolean; transaction?: DemoTransaction; error?: string } {
  const amountNum = parseFloat(amount)
  const result = deductDemoETH(amountNum)
  
  if (!result.success) {
    return { success: false, error: result.error }
  }

  const tx = addDemoTransaction({
    type: "purchase",
    amount,
    from: buyerAddress,
    to: sellerAddress,
    recipeTitle,
    timestamp: Date.now(),
  })

  return { success: true, transaction: tx }
}

// Check if demo mode should be active (when on deployed site or real network not available)
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false
  const host = window.location.hostname
  // Demo mode on deployed sites (not localhost)
  return host !== "localhost" && host !== "127.0.0.1"
}

// Reset demo wallet to initial state
export function resetDemoWallet(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_STORAGE_KEY, INITIAL_DEMO_BALANCE.toString())
  localStorage.removeItem(DEMO_TRANSACTIONS_KEY)
}
