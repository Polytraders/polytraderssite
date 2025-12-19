export const LOGO_URL =
  "https://cdn.dev.fun/asset/59932f2f0b6d5afa6573/12082_4f0dacc4.png";

export const shadowExtruded =
  "6px 6px 12px rgb(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)";
export const shadowExtrudedSmall =
  "4px 4px 8px rgb(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)";
export const shadowInset =
  "inset 4px 4px 8px rgb(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)";
export const shadowInsetDeep =
  "inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)";
export const shadowInsetSmall =
  "inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)";

export const formatProfit = (profit) => {
  if (!profit && profit !== 0) return `$0.00`;
  return `${Number(profit).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const corsWrap = (url) =>
  `https://corsproxy.io/?${encodeURIComponent(url)}`;
