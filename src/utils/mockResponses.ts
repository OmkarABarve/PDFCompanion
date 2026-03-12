// Fallback mock explanations used when the Gemini API key is missing or a call fails

const mocks: Record<string, string> = {
  'sharpe ratio':
    'The Sharpe ratio measures risk-adjusted return by dividing excess return over the risk-free rate by portfolio standard deviation. Higher values indicate better reward per unit of risk.',
  'deflated sharpe ratio':
    'The Deflated Sharpe Ratio adjusts the traditional Sharpe ratio for the bias introduced by multiple testing. It estimates the probability that the reported Sharpe ratio is genuinely above zero after accounting for all trials.',
  'kelly criterion':
    'The Kelly criterion is a formula that determines the optimal fraction of capital to wager on a favourable bet. It maximises the expected logarithmic growth rate of wealth over time.',
  'black-scholes':
    'Black-Scholes is a pricing model for European-style options that derives the theoretical fair value from the underlying price, strike, volatility, time to expiry, and the risk-free rate.',
  'monte carlo':
    'Monte Carlo simulation uses repeated random sampling to model the probability distribution of possible outcomes. It is widely used in finance for risk analysis and derivative pricing.',
};

// Returns a mock explanation or a generic fallback
export function getMockExplanation(text: string): string {
  const key = text.toLowerCase().trim();
  for (const [term, explanation] of Object.entries(mocks)) {
    if (key.includes(term)) return explanation;
  }
  return `"${text}" is a technical term commonly found in quantitative finance and machine learning literature. Provide a Gemini API key for a detailed contextual explanation.`;
}
