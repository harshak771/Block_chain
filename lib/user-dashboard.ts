export interface UserPortfolio {
  address: string
  totalRecipes: number
  totalValue: string
  totalEarnings: string
  recipes: {
    id: string
    title: string
    minted: string
    sales: number
  }[]
}

export interface SaleHistory {
  id: string
  recipeId: string
  recipeName: string
  buyerAddress: string
  price: string
  timestamp: number
  type: "sale" | "purchase"
}

export interface UserStats {
  recipesOwned: number
  recipesListed: number
  totalSalesVolume: string
  avgSalePrice: string
  totalEarnings: string
  followersCount: number
}

const PORTFOLIO_STORAGE_KEY = "recipeNFT:user:portfolio"
const SALES_HISTORY_KEY = "recipeNFT:user:sales-history"

export function getUserPortfolio(address: string): UserPortfolio {
  try {
    const stored = localStorage.getItem(`${PORTFOLIO_STORAGE_KEY}:${address}`)
    if (stored) return JSON.parse(stored)
  } catch {}

  return {
    address,
    totalRecipes: 0,
    totalValue: "0",
    totalEarnings: "0",
    recipes: [],
  }
}

export function saveUserPortfolio(portfolio: UserPortfolio): void {
  localStorage.setItem(`${PORTFOLIO_STORAGE_KEY}:${portfolio.address}`, JSON.stringify(portfolio))
}

export function addRecipeToPortfolio(address: string, recipe: UserPortfolio["recipes"][0]): void {
  const portfolio = getUserPortfolio(address)
  portfolio.recipes.push(recipe)
  portfolio.totalRecipes = portfolio.recipes.length
  saveUserPortfolio(portfolio)
}

export function getSalesHistory(address: string): SaleHistory[] {
  try {
    const stored = localStorage.getItem(`${SALES_HISTORY_KEY}:${address}`)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addSaleToHistory(address: string, sale: SaleHistory): void {
  const history = getSalesHistory(address)
  history.push(sale)
  localStorage.setItem(`${SALES_HISTORY_KEY}:${address}`, JSON.stringify(history))
}

export function calculateUserStats(address: string): UserStats {
  const portfolio = getUserPortfolio(address)
  const sales = getSalesHistory(address)

  const totalSales = sales.filter((s) => s.type === "sale")
  const totalSalesVolume = totalSales.reduce((sum, sale) => sum + Number.parseFloat(sale.price), 0).toFixed(4)

  const avgSalePrice =
    totalSales.length > 0 ? (Number.parseFloat(totalSalesVolume) / totalSales.length).toFixed(4) : "0"

  return {
    recipesOwned: portfolio.recipes.length,
    recipesListed: portfolio.recipes.filter((r) => r.sales > 0).length,
    totalSalesVolume,
    avgSalePrice,
    totalEarnings: portfolio.totalEarnings,
    followersCount: 0,
  }
}
