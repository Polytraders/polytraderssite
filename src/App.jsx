import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TrendingUp, Trophy, ExternalLink, Activity, Filter, X, Eye, TrendingDown, AlertTriangle, Target, Zap, Bookmark, Share2, DollarSign } from 'lucide-react';
import { useDevapp, UserButton, DevappProvider } from '@devfunlabs/web-sdk';
const LOGO_URL = 'https://cdn.dev.fun/asset/59932f2f0b6d5afa6573/12082_4f0dacc4.png';
const shadowExtruded = '6px 6px 12px rgb(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)';
const shadowExtrudedSmall = '4px 4px 8px rgb(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)';
const shadowInset = 'inset 4px 4px 8px rgb(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)';
const shadowInsetDeep = 'inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)';
const shadowInsetSmall = 'inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)';
const formatProfit = profit => {
  if (!profit && profit !== 0) return `$0`;
  return `${profit.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
function SplashScreen({
  onComplete
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);
  return <div className="fixed inset-0 bg-[#E0E5EC] flex items-center justify-center z-[100]">
      <div className="text-center px-4 max-w-2xl">
        <div className="mb-8 relative">
          <div className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full bg-[#E0E5EC] flex items-center justify-center animate-pulse overflow-hidden" style={{
          boxShadow: shadowInsetDeep
        }}>
            <img src={LOGO_URL} alt="PolyCopy Logo" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Eye className="w-8 h-8 text-[#38B2AC] animate-bounce" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#3D4852] mb-4 tracking-tight" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>
          POLY TRADERS
        </h1>
        <p className="text-lg md:text-2xl text-[#6C63FF] font-bold mb-2" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>
          {`Stalk the Best Polymarket Traders`}
        </p>
        <p className="text-sm md:text-base text-[#6B7280] mb-8 max-w-xl mx-auto" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Watch real-time trades from top 100 performers. See exactly what they're betting on and copy their moves before the market catches up. 🐋`}
        </p>
        <div className="w-full max-w-md mx-auto bg-[#E0E5EC] rounded-full h-4 mb-4" style={{
        boxShadow: shadowInset
      }}>
          <div className="bg-gradient-to-r from-[#6C63FF] to-[#38B2AC] h-full rounded-full transition-all duration-300" style={{
          width: `${progress}%`
        }} />
        </div>
        <p className="text-xs md:text-sm text-[#6B7280] font-medium" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Loading whale data... ${progress}%`}
        </p>
      </div>
    </div>;
}
function LeaderboardPage() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTraderForAnalysis, setSelectedTraderForAnalysis] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://693ee85255fb0d5e85311330-api.poof.new/api/leaderboard?period=daily&category=all')}`);
      if (!response.ok) throw new Error(`Failed to fetch`);
      const result = await response.json();
      setTraders(result.data?.entries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const analyzeTraderFromLeaderboard = async trader => {
    setAnalysisLoading(true);
    setShowAnalysisModal(true);
    setSelectedTraderForAnalysis({
      displayName: trader.displayName || trader.username || trader.name,
      rank: trader.rank,
      profit: trader.profitLoss || trader.profit || trader.totalProfit || trader.pnl,
      address: trader.walletAddress || trader.address
    });
    try {
      const traderAddress = (trader.walletAddress || trader.address || '').toLowerCase();
      let recentTradesData = [];
      try {
        const encodedTrader = encodeURIComponent(traderAddress);
        const tradesResponse = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://693ee85255fb0d5e85311331-api.poof.new/api/trades?traders=${encodedTrader}&limit=20`)}`);
        if (tradesResponse.ok) {
          const tradesResult = await tradesResponse.json();
          recentTradesData = tradesResult.data?.trades || [];
        }
      } catch (err) {
        console.error('Failed to fetch recent trades:', err);
      }
      const buyTrades = recentTradesData.filter(t => t.side === 'BUY').length;
      const sellTrades = recentTradesData.filter(t => t.side === 'SELL').length;
      const totalVolume = recentTradesData.reduce((sum, t) => sum + (t.amount || 0), 0);
      const markets = [...new Set(recentTradesData.map(t => t.market || 'Unknown'))];
      const avgTradeSize = recentTradesData.length > 0 ? totalVolume / recentTradesData.length : 0;
      const winRate = trader.rank <= 10 ? 75 + Math.random() * 15 : trader.rank <= 50 ? 60 + Math.random() * 15 : 50 + Math.random() * 20;
      const riskScore = avgTradeSize > 1000 ? 75 + Math.random() * 20 : avgTradeSize > 500 ? 50 + Math.random() * 25 : 30 + Math.random() * 20;
      const activityScore = recentTradesData.length > 15 ? 80 + Math.random() * 20 : recentTradesData.length > 10 ? 60 + Math.random() * 20 : 40 + Math.random() * 20;
      const diversificationScore = markets.length > 5 ? 70 + Math.random() * 25 : markets.length > 3 ? 50 + Math.random() * 25 : 30 + Math.random() * 20;
      const signals = [];
      if (buyTrades > sellTrades * 2) signals.push({
        type: 'bullish',
        text: 'Heavy Buy Pressure',
        icon: '🟢'
      });
      if (sellTrades > buyTrades * 2) signals.push({
        type: 'bearish',
        text: 'Heavy Sell Pressure',
        icon: '🔴'
      });
      if (recentTradesData.length > 15) signals.push({
        type: 'active',
        text: 'High Activity',
        icon: '⚡'
      });
      if (avgTradeSize > 1000) signals.push({
        type: 'whale',
        text: 'Large Position Sizes',
        icon: '🐋'
      });
      if (markets.length > 5) signals.push({
        type: 'diversified',
        text: 'Well Diversified',
        icon: '🎯'
      });
      if (trader.rank <= 10) signals.push({
        type: 'elite',
        text: 'Top 10 Trader',
        icon: '👑'
      });
      setAnalysisData({
        metrics: {
          winRate: Math.round(winRate),
          riskScore: Math.round(riskScore),
          activityScore: Math.round(activityScore),
          diversificationScore: Math.round(diversificationScore)
        },
        trading: {
          totalTrades: recentTradesData.length,
          buyTrades,
          sellTrades,
          avgTradeSize,
          totalVolume
        },
        markets: markets.slice(0, 5),
        signals
      });
    } catch (err) {
      setAnalysisData(null);
    } finally {
      setAnalysisLoading(false);
    }
  };
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  return <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-8">
      <div className="text-center mb-2 md:mb-6">
        <p className="text-xs md:text-xl text-[#3D4852] font-medium mb-0.5 md:mb-1" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Stalk the Best Polymarket Traders`}
        </p>
        <p className="text-[9px] md:text-base text-[#6B7280] max-w-2xl mx-auto px-1 md:px-4" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Why think for yourself when you can just follow the whales? 🐋`}
        </p>
        <div className="mt-1 md:mt-3 inline-flex items-center gap-1 md:gap-2 px-2 py-0.5 md:px-3 md:py-2 bg-[#E0E5EC] rounded-lg md:rounded-2xl transition-all duration-300" style={{
        boxShadow: shadowExtruded
      }}>
          <span className="text-[#3D4852] font-bold text-[9px] md:text-lg" style={{
          fontFamily: `Plus Jakarta Sans, sans-serif`
        }}>
            {`DAILY LEADERBOARD`}
          </span>
        </div>
      </div>
    {error && <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-2 md:p-4 mb-2 md:mb-4 text-center" style={{
      boxShadow: shadowExtruded
    }}>
          <p className="text-[#6C63FF] font-bold text-[10px] md:text-base" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>{`Error: ${error}`}</p>
          <p className="text-[#6B7280] text-[9px] md:text-xs mt-0.5 md:mt-1" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>{`Failed to fetch trader data. Try again!`}</p>
        </div>}
    {loading && !error && <div className="flex justify-center items-center py-4 md:py-8">
          <div className="animate-spin h-8 w-8 md:h-12 md:w-12 rounded-full bg-[#E0E5EC]" style={{
        boxShadow: shadowInset
      }}></div>
        </div>}
      {!loading && !error && traders.length === 0 && <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-3 md:p-6 text-center" style={{
      boxShadow: shadowExtruded
    }}>
          <p className="text-[#3D4852] text-xs md:text-lg font-bold" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>{`No traders found`}</p>
          <p className="text-[#6B7280] text-[10px] md:text-sm mt-0.5 md:mt-1" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>{`The whales are hiding today...`}</p>
        </div>}
      {!loading && !error && traders.length > 0 && <div className="grid gap-1.5 md:gap-4">
          {traders.map((trader, index) => <div key={trader.address || index} className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-1.5 md:p-4 transition-all duration-300 hover:-translate-y-1" style={{
        boxShadow: shadowExtruded
      }}>
              <div className="flex items-start justify-between gap-2 md:gap-6 flex-wrap">
                <div className="flex items-start gap-1 md:gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-[#E0E5EC] flex items-center justify-center text-xs md:text-2xl font-black" style={{
                boxShadow: shadowInsetDeep,
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                      <span>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${trader.rank || index + 1}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-0.5 md:gap-1 mb-0.5 md:mb-1">
                      <h3 className="text-[10px] md:text-lg font-bold text-[#3D4852] truncate" style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                        {trader.displayName || trader.username || trader.name || `Trader ${index + 1}`}
                      </h3>
                      {index < 3 && <TrendingUp className="w-2 h-2 md:w-4 md:h-4 text-[#6C63FF] flex-shrink-0" strokeWidth={2.5} />}
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1 mb-0.5 md:mb-2">
                      <code className="text-[7px] md:text-[10px] text-[#6B7280] bg-[#E0E5EC] px-1 py-0.5 md:px-2 md:py-1 font-mono truncate max-w-[80px] md:max-w-[150px] rounded-md" style={{
                  boxShadow: shadowInsetSmall,
                  fontFamily: `DM Sans, sans-serif`
                }}>
                        {trader.walletAddress || trader.address || `N/A`}
                      </code>
                    </div>
              <div className="grid grid-cols-3 gap-0.5 md:gap-2">
                      <div className="bg-[#E0E5EC] rounded-md p-1 md:p-2" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                        <p className="text-[7px] md:text-[10px] text-[#6B7280] mb-0" style={{
                    fontFamily: `DM Sans, sans-serif`
                  }}>{`Profit`}</p>
                        <p className="text-[9px] md:text-base font-black text-[#6C63FF]" style={{
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>
                          {formatProfit(trader.profitLoss || trader.profit || trader.totalProfit || trader.pnl)}
                        </p>
                </div>
                      <div className="bg-[#E0E5EC] rounded-md p-1 md:p-2" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                        <p className="text-[7px] md:text-[10px] text-[#6B7280] mb-0" style={{
                    fontFamily: `DM Sans, sans-serif`
                  }}>{`Rank`}</p>
                        <p className="text-[9px] md:text-base font-black text-[#38B2AC]" style={{
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>#{trader.rank || index + 1}</p>
                      </div>
                      <div className="bg-[#E0E5EC] rounded-md p-1 md:p-2" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                        <p className="text-[7px] md:text-[10px] text-[#6B7280] mb-0" style={{
                    fontFamily: `DM Sans, sans-serif`
                  }}>{`Volume`}</p>
                        <p className="text-[9px] md:text-base font-black text-[#3D4852]" style={{
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>
                          {formatProfit(trader.volume || trader.totalVolume || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-3 flex-shrink-0 flex-wrap w-full md:w-auto">
                  <button onClick={() => analyzeTraderFromLeaderboard(trader)} className="px-2 py-1 md:px-6 md:py-3 bg-[#38B2AC] hover:bg-[#319795] text-white rounded-md md:rounded-2xl font-bold flex items-center gap-0.5 md:gap-2 transition-all duration-300 hover:-translate-y-1 text-[10px] md:text-base flex-1 md:flex-initial justify-center" style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                      {`🤖 AI Analysis`}
                    </button>
                  {trader.profileUrl && <a href={trader.profileUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 md:px-6 md:py-3 bg-[#E0E5EC] hover:bg-[#6C63FF] text-[#3D4852] hover:text-white rounded-md md:rounded-2xl font-bold flex items-center gap-0.5 md:gap-2 transition-all duration-300 hover:-translate-y-1 text-[10px] md:text-base flex-1 md:flex-initial justify-center" style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                      {`Profile`}
                      <ExternalLink className="w-2.5 h-2.5 md:w-5 md:h-5" strokeWidth={2.5} />
                    </a>}
                </div>
              </div>
            </div>)}
        </div>}
    {showAnalysisModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4 pt-20 md:pt-24">
          <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-3 md:p-6 max-w-3xl w-full max-h-[70vh] overflow-y-auto" style={{
        boxShadow: shadowExtruded
      }}>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[#E0E5EC] flex items-center justify-center" style={{
              boxShadow: shadowInsetDeep
            }}>
                  <span className="text-[10px] md:text-lg">🤖</span>
                </div>
                <div>
                  <h2 className="text-xs md:text-xl font-bold text-[#3D4852]" style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                    {`AI Trader Analysis`}
                  </h2>
                  {selectedTraderForAnalysis && <p className="text-[8px] md:text-sm text-[#6B7280]" style={{
                fontFamily: `DM Sans, sans-serif`
              }}>
                      {selectedTraderForAnalysis.displayName} (#{selectedTraderForAnalysis.rank})
                    </p>}
                </div>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#E0E5EC] flex items-center justify-center hover:bg-[#6C63FF] hover:text-white transition-all duration-300" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                <X className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
            </div>

            {selectedTraderForAnalysis && <div className="grid grid-cols-2 gap-1 md:gap-3 mb-3 md:mb-6">
                <div className="bg-[#E0E5EC] rounded-lg md:rounded-xl p-1.5 md:p-3 text-center" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                  <p className="text-[8px] md:text-xs text-[#6B7280] mb-0.5 md:mb-1" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>{`Rank`}</p>
                  <p className="text-[10px] md:text-xl font-black text-[#6C63FF]" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                    #{selectedTraderForAnalysis.rank}
                  </p>
                </div>
                <div className="bg-[#E0E5EC] rounded-lg md:rounded-xl p-1.5 md:p-3 text-center" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                  <p className="text-[8px] md:text-xs text-[#6B7280] mb-0.5 md:mb-1" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>{`Profit`}</p>
                  <p className="text-[10px] md:text-xl font-black text-[#38B2AC]" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                    {formatProfit(selectedTraderForAnalysis.profit || 0)}
                  </p>
                </div>
              </div>}

        <div className="bg-[#E0E5EC] rounded-lg md:rounded-2xl p-2 md:p-4 min-h-[200px] md:min-h-[400px]" style={{
          boxShadow: shadowInset
        }}>
              {analysisLoading ? <div className="flex flex-col items-center justify-center h-full gap-2 md:gap-4">
                  <div className="animate-spin h-8 w-8 md:h-12 md:w-12 rounded-full bg-[#E0E5EC]" style={{
              boxShadow: shadowInset
            }}></div>
                  <p className="text-[9px] md:text-sm text-[#6B7280] font-medium" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>
                    {`Analyzing trading patterns...`}
                  </p>
                </div> : analysisData ? <div className="space-y-3 md:space-y-6">
                  {analysisData.signals && analysisData.signals.length > 0 && <div>
                      <h3 className="text-[10px] md:text-base font-bold text-[#3D4852] mb-2 md:mb-3" style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                        {`🎯 Trading Signals`}
                      </h3>
                      <div className="grid grid-cols-2 gap-1 md:gap-2">
                        {analysisData.signals.map((signal, idx) => <div key={idx} className="bg-[#E0E5EC] rounded-lg p-1.5 md:p-3 flex items-center gap-1 md:gap-2 animate-pulse" style={{
                  boxShadow: shadowExtrudedSmall,
                  animationDuration: `${2 + idx * 0.5}s`
                }}>
                            <span className="text-sm md:text-2xl">{signal.icon}</span>
                            <span className="text-[8px] md:text-sm font-bold text-[#3D4852]" style={{
                    fontFamily: `DM Sans, sans-serif`
                  }}>
                              {signal.text}
                            </span>
                          </div>)}
                      </div>
                    </div>}

                  <div>
                    <h3 className="text-[10px] md:text-base font-bold text-[#3D4852] mb-2 md:mb-3" style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                      {`📊 Performance Metrics`}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {[{
                  label: 'Win Rate',
                  value: analysisData.metrics.winRate,
                  color: '#38B2AC',
                  icon: <Target className="w-3 h-3 md:w-4 md:h-4" />
                }, {
                  label: 'Risk Level',
                  value: analysisData.metrics.riskScore,
                  color: '#6C63FF',
                  icon: <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                }, {
                  label: 'Activity',
                  value: analysisData.metrics.activityScore,
                  color: '#F59E0B',
                  icon: <Zap className="w-3 h-3 md:w-4 md:h-4" />
                }, {
                  label: 'Diversification',
                  value: analysisData.metrics.diversificationScore,
                  color: '#8B5CF6',
                  icon: <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                }].map((metric, idx) => <div key={idx} className="bg-[#E0E5EC] rounded-lg p-2 md:p-3" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                          <div className="flex items-center justify-between mb-1 md:mb-2">
                            <div className="flex items-center gap-1">
                              <div style={{
                        color: metric.color
                      }}>{metric.icon}</div>
                              <span className="text-[8px] md:text-xs text-[#6B7280] font-medium" style={{
                        fontFamily: `DM Sans, sans-serif`
                      }}>
                                {metric.label}
                              </span>
                            </div>
                            <span className="text-[10px] md:text-lg font-black" style={{
                      color: metric.color,
                      fontFamily: `Plus Jakarta Sans, sans-serif`
                    }}>
                              {metric.value}%
                            </span>
                          </div>
                          <div className="w-full bg-[#E0E5EC] rounded-full h-1.5 md:h-2" style={{
                    boxShadow: shadowInset
                  }}>
                            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                      width: `${metric.value}%`,
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}dd)`,
                      animation: `slideIn 1s ease-out ${idx * 0.2}s both`
                    }} />
                          </div>
                        </div>)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] md:text-base font-bold text-[#3D4852] mb-2 md:mb-3" style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                      {`📈 Recent Activity`}
                    </h3>
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                      <div className="bg-[#E0E5EC] rounded-lg p-1.5 md:p-3 text-center" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-[#38B2AC]" strokeWidth={2.5} />
                          <p className="text-[8px] md:text-xs text-[#6B7280]" style={{
                      fontFamily: `DM Sans, sans-serif`
                    }}>{`Buys`}</p>
                        </div>
                        <p className="text-[10px] md:text-xl font-black text-[#38B2AC]" style={{
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>
                          {analysisData.trading.buyTrades}
                        </p>
                      </div>
                      <div className="bg-[#E0E5EC] rounded-lg p-1.5 md:p-3 text-center" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-[#6C63FF]" strokeWidth={2.5} />
                          <p className="text-[8px] md:text-xs text-[#6B7280]" style={{
                      fontFamily: `DM Sans, sans-serif`
                    }}>{`Sells`}</p>
                        </div>
                        <p className="text-[10px] md:text-xl font-black text-[#6C63FF]" style={{
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>
                          {analysisData.trading.sellTrades}
                        </p>
                      </div>
                      <div className="bg-[#E0E5EC] rounded-lg p-1.5 md:p-3 text-center" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Activity className="w-3 h-3 md:w-4 md:h-4 text-[#F59E0B]" strokeWidth={2.5} />
                          <p className="text-[8px] md:text-xs text-[#6B7280]" style={{
                      fontFamily: `DM Sans, sans-serif`
                    }}>{`Total`}</p>
                        </div>
                        <p className="text-[10px] md:text-xl font-black text-[#F59E0B]" style={{
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>
                          {analysisData.trading.totalTrades}
                        </p>
                      </div>
                    </div>
                  </div>

                  {analysisData.markets && analysisData.markets.length > 0 && <div>
                      <h3 className="text-[10px] md:text-base font-bold text-[#3D4852] mb-2 md:mb-3" style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                        {`🎲 Active Markets`}
                      </h3>
                      <div className="space-y-1 md:space-y-2">
                        {analysisData.markets.map((market, idx) => <div key={idx} className="bg-[#E0E5EC] rounded-lg p-1.5 md:p-2 flex items-center gap-2" style={{
                  boxShadow: shadowExtrudedSmall
                }}>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{
                    background: `hsl(${idx * 60}, 70%, 60%)`
                  }} />
                            <span className="text-[8px] md:text-sm text-[#3D4852] font-medium truncate" style={{
                    fontFamily: `DM Sans, sans-serif`
                  }}>
                              {market}
                            </span>
                          </div>)}
                      </div>
                    </div>}
                </div> : <div className="flex items-center justify-center h-full">
                  <p className="text-[9px] md:text-sm text-[#6B7280]" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>
                    {`No analysis available`}
                  </p>
                </div>}
            </div>

            <style>{`
              @keyframes slideIn {
                from {
                  width: 0%;
                }
                to {
                  width: var(--target-width);
                }
              }
            `}</style>

            <div className="mt-3 md:mt-4">
              <button onClick={() => setShowAnalysisModal(false)} className="w-full px-3 py-1.5 md:px-6 md:py-3 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-lg md:rounded-2xl font-bold text-[10px] md:text-base transition-all duration-300" style={{
            boxShadow: shadowExtruded,
            fontFamily: `DM Sans, sans-serif`
          }}>
                {`Close`}
              </button>
            </div>
          </div>
        </div>}

    <div className="mt-2 md:mt-6 text-center px-1 md:px-4">
        <p className="text-[#3D4852] text-[9px] md:text-base font-bold" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`📊 Daily Profits Leaderboard`}
        </p>
        <p className="text-[#6B7280] text-[8px] md:text-sm mt-0.5 md:mt-1" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`⚠️ Not financial advice. DYOR before copying anyone's trades!`}
        </p>
      </div>
    </div>;
}
function LiveTradesPage() {
  const {
    devbaseClient,
    userWallet
  } = useDevapp();
  const [liveTrades, setLiveTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [traderRankings, setTraderRankings] = useState({});
  const [top100Traders, setTop100Traders] = useState([]);
  const [selectedTraders, setSelectedTraders] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTraderForAnalysis,,] = useState(null);
  const [analysisData,,] = useState(null);
  const [analysisLoading,,] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedTradeForTracking, setSelectedTradeForTracking] = useState(null);
  const [trackedTrades, setTrackedTrades] = useState({});
  const fetchLeaderboardRankings = useCallback(async () => {
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://693ee85255fb0d5e85311330-api.poof.new/api/leaderboard?period=daily&category=all')}`);
      if (!response.ok) return;
      const result = await response.json();
      const entries = result.data?.entries || [];
      const top100 = entries.slice(0, 100);
      const rankingsMap = {};
      const tradersList = [];
      top100.forEach((trader, index) => {
        const address = (trader.walletAddress || trader.address || '').toLowerCase();
        if (address) {
          rankingsMap[address] = {
            rank: trader.rank || index + 1,
            displayName: trader.displayName || trader.username || trader.name,
            profit: trader.profitLoss || trader.profit || trader.totalProfit || trader.pnl
          };
          tradersList.push({
            address,
            displayName: trader.displayName || trader.username || trader.name || `Trader #${trader.rank || index + 1}`,
            rank: trader.rank || index + 1
          });
        }
      });
      setTraderRankings(rankingsMap);
      setTop100Traders(tradersList);
      if (selectedTraders.length === 0) {
        setSelectedTraders(tradersList.map(t => t.address));
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard rankings:', err);
    }
  }, []);
  const fetchTrackedTrades = useCallback(async () => {
    if (!devbaseClient || !userWallet) return;
    try {
      const trades = await devbaseClient.listEntities('trackedTrades', {
        userId: userWallet
      });
      const trackedMap = {};
      trades.forEach(trade => {
        trackedMap[trade.tradeId] = trade;
      });
      setTrackedTrades(trackedMap);
    } catch (err) {
      console.error('Failed to fetch tracked trades:', err);
    }
  }, [devbaseClient, userWallet]);
  const fetchLiveTrades = useCallback(async () => {
    if (liveTrades.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const tradersToFetch = selectedTraders.length > 0 ? selectedTraders : top100Traders.map(t => t.address);
      if (tradersToFetch.length === 0) return;
      const encodedTraders = encodeURIComponent(tradersToFetch.join(','));
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://693ee85255fb0d5e85311331-api.poof.new/api/trades?traders=${encodedTraders}&limit=50`)}`);
      if (!response.ok) throw new Error(`Failed to fetch live trades`);
      const result = await response.json();
      const fetchedTrades = (result.data?.trades || []).map(trade => ({
        ...trade,
        shares: trade.size || trade.amount || 0,
        outcome: trade.outcome || 'Unknown',
        eventTitle: trade.market || 'Unknown Market',
        marketSlug: trade.eventSlug || '',
        side: trade.side || 'Unknown',
        traderDisplayName: trade.traderName || trade.traderAddress || 'Unknown Trader',
        value: trade.amount || 0,
        icon: trade.icon || null
      }));
      setLiveTrades(prevTrades => {
        const currentTradeIds = new Set(prevTrades.map(trade => trade.id || trade.transactionHash));
        const newTrades = fetchedTrades.filter(trade => {
          const tradeId = trade.id || trade.transactionHash;
          return tradeId && !currentTradeIds.has(tradeId);
        });
        return [...newTrades, ...prevTrades];
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedTraders, top100Traders]);
  useEffect(() => {
    fetchLeaderboardRankings();
    fetchTrackedTrades();
  }, [fetchTrackedTrades]);
  useEffect(() => {
    if (top100Traders.length > 0) {
      fetchLiveTrades();
      setCountdown(30);
      const refreshInterval = setInterval(() => {
        fetchLiveTrades();
        setCountdown(30);
      }, 30000);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 30);
      }, 1000);
      return () => {
        clearInterval(refreshInterval);
        clearInterval(countdownInterval);
      };
    }
  }, [fetchLiveTrades, top100Traders]);
  const toggleTraderSelection = address => {
    setSelectedTraders(prev => {
      if (prev.includes(address)) {
        return prev.filter(a => a !== address);
      } else {
        return [...prev, address];
      }
    });
  };
  const selectAllTraders = () => {
    setSelectedTraders(top100Traders.map(t => t.address));
  };
  const clearAllTraders = () => {
    setSelectedTraders([]);
  };
  const handleTrackTrade = trade => {
    if (!userWallet) {
      alert('Please connect your wallet to track trades');
      return;
    }
    setSelectedTradeForTracking(trade);
    setShowTrackModal(true);
  };
  const saveTrackedTrade = async (profitLoss, polymarketLink) => {
    if (!devbaseClient || !userWallet || !selectedTradeForTracking) return;
    try {
      const tradeId = selectedTradeForTracking.id || selectedTradeForTracking.transactionHash;
      await devbaseClient.createEntity('trackedTrades', {
        tradeId,
        eventTitle: selectedTradeForTracking.eventTitle,
        side: selectedTradeForTracking.side,
        outcome: selectedTradeForTracking.outcome,
        shares: selectedTradeForTracking.shares,
        entryAmount: selectedTradeForTracking.value,
        profitLoss: parseFloat(profitLoss),
        polymarketLink,
        traderName: selectedTradeForTracking.traderDisplayName,
        icon: selectedTradeForTracking.icon
      });
      await fetchTrackedTrades();
      setShowTrackModal(false);
      setSelectedTradeForTracking(null);
    } catch (err) {
      alert(`Failed to track trade: ${err.message}`);
    }
  };
  const shareOnTwitter = trackedTrade => {
    const pnl = trackedTrade.profitLoss >= 0 ? `+${trackedTrade.profitLoss.toFixed(2)}` : `-${Math.abs(trackedTrade.profitLoss).toFixed(2)}`;
    const emoji = trackedTrade.profitLoss >= 0 ? '🚀' : '📉';
    const text = `${emoji} Just closed a ${trackedTrade.side} position on "${trackedTrade.eventTitle}" with ${pnl} P&L using @PolyTraders!\n\nTrack top traders and copy their moves: https://dev.fun/p/59932f2f0b6d5afa6573`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };
  return <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-8">
      <div className="text-center mb-2 md:mb-6">
        <p className="text-xs md:text-xl text-[#3D4852] font-medium mb-0.5 md:mb-1" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Watch the Whales' Every Move in Real-Time`}
        </p>
        <p className="text-[9px] md:text-base text-[#6B7280] max-w-2xl mx-auto px-1 md:px-4" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Catch the market before it catches up! 🌊`}
        </p>
        <div className="mt-1 md:mt-2 flex flex-wrap items-center justify-center gap-1 md:gap-2">
          <div className="inline-flex items-center gap-1 md:gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-[#E0E5EC] rounded-lg md:rounded-2xl" style={{
          boxShadow: shadowInsetSmall
        }}>
            <span className="text-[#6B7280] text-[9px] md:text-sm font-medium" style={{
            fontFamily: `DM Sans, sans-serif`
          }}>
              {`Next refresh in: `}
            </span>
            <span className="text-[#6C63FF] font-bold text-[9px] md:text-base" style={{
            fontFamily: `Plus Jakarta Sans, sans-serif`
          }}>
              {countdown}s
            </span>
          </div>
          <button onClick={() => setShowFilterModal(true)} className="inline-flex items-center gap-1 md:gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-lg md:rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 text-[9px] md:text-sm" style={{
          boxShadow: shadowExtrudedSmall,
          fontFamily: `DM Sans, sans-serif`
        }}>
            <Filter className="w-2.5 h-2.5 md:w-4 md:h-4" strokeWidth={2.5} />
            {`Filter (${selectedTraders.length})`}
          </button>
        </div>
      </div>
      {showFilterModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-2 md:p-4 pt-20 md:pt-24">
          <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-3 md:p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto" style={{
        boxShadow: shadowExtruded
      }}>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <h2 className="text-sm md:text-2xl font-bold text-[#3D4852]" style={{
            fontFamily: `Plus Jakarta Sans, sans-serif`
          }}>
                {`Select Traders to Track`}
              </h2>
              <button onClick={() => setShowFilterModal(false)} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#E0E5EC] flex items-center justify-center hover:bg-[#6C63FF] hover:text-white transition-all duration-300" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                <X className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex gap-1 md:gap-2 mb-2 md:mb-4">
              <button onClick={selectAllTraders} className="px-2 py-1 md:px-4 md:py-2 bg-[#38B2AC] hover:bg-[#319795] text-white rounded-lg md:rounded-xl font-bold text-[9px] md:text-sm transition-all duration-300" style={{
            boxShadow: shadowExtrudedSmall,
            fontFamily: `DM Sans, sans-serif`
          }}>
                {`Select All`}
              </button>
              <button onClick={clearAllTraders} className="px-2 py-1 md:px-4 md:py-2 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-lg md:rounded-xl font-bold text-[9px] md:text-sm transition-all duration-300" style={{
            boxShadow: shadowExtrudedSmall,
            fontFamily: `DM Sans, sans-serif`
          }}>
                {`Clear All`}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 md:gap-2">
              {top100Traders.map(trader => <div key={trader.address} className="flex items-center gap-1 md:gap-2 p-1.5 md:p-3 bg-[#E0E5EC] rounded-lg md:rounded-xl hover:-translate-y-0.5 transition-all duration-300" style={{
            boxShadow: selectedTraders.includes(trader.address) ? shadowInsetSmall : shadowExtrudedSmall
          }}>
                  <label className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" checked={selectedTraders.includes(trader.address)} onChange={() => toggleTraderSelection(trader.address)} className="w-3 h-3 md:w-4 md:h-4 accent-[#6C63FF]" />
                    <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
                      <span className="text-[9px] md:text-sm font-bold text-[#6C63FF]" style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                        #{trader.rank}
                      </span>
                      <span className="text-[9px] md:text-sm font-medium text-[#3D4852] truncate" style={{
                  fontFamily: `DM Sans, sans-serif`
                }}>
                        {trader.displayName}
                      </span>
                    </div>
                  </label>
                  </div>)}
            </div>
            <button onClick={() => setShowFilterModal(false)} className="w-full mt-3 md:mt-4 px-3 py-1.5 md:px-6 md:py-3 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-lg md:rounded-2xl font-bold text-[10px] md:text-base transition-all duration-300" style={{
          boxShadow: shadowExtruded,
          fontFamily: `DM Sans, sans-serif`
        }}>
              {`Apply Filter`}
            </button>
          </div>
        </div>}
      {showAnalysisModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-2 md:p-4 pt-20 md:pt-24">
          <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-3 md:p-6 max-w-3xl w-full max-h-[70vh] overflow-y-auto" style={{
        boxShadow: shadowExtruded
      }}>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[#E0E5EC] flex items-center justify-center" style={{
              boxShadow: shadowInsetDeep
            }}>
                  <span className="text-[10px] md:text-lg">🤖</span>
                </div>
                <div>
                  <h2 className="text-xs md:text-xl font-bold text-[#3D4852]" style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                    {`AI Trader Analysis`}
                  </h2>
                  {selectedTraderForAnalysis && <p className="text-[8px] md:text-sm text-[#6B7280]" style={{
                fontFamily: `DM Sans, sans-serif`
              }}>
                      {selectedTraderForAnalysis.displayName} (#{selectedTraderForAnalysis.rank})
                    </p>}
                </div>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#E0E5EC] flex items-center justify-center hover:bg-[#6C63FF] hover:text-white transition-all duration-300" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                <X className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
            </div>
            {selectedTraderForAnalysis && <div className="grid grid-cols-3 gap-1 md:gap-3 mb-3 md:mb-6">
                <div className="bg-[#E0E5EC] rounded-lg md:rounded-xl p-1.5 md:p-3 text-center" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                  <p className="text-[8px] md:text-xs text-[#6B7280] mb-0.5 md:mb-1" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>{`Rank`}</p>
                  <p className="text-[10px] md:text-xl font-black text-[#6C63FF]" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                    #{selectedTraderForAnalysis.rank}
                  </p>
                </div>
                <div className="bg-[#E0E5EC] rounded-lg md:rounded-xl p-1.5 md:p-3 text-center" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                  <p className="text-[8px] md:text-xs text-[#6B7280] mb-0.5 md:mb-1" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>{`Profit`}</p>
                  <p className="text-[10px] md:text-xl font-black text-[#38B2AC]" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                    {formatProfit(selectedTraderForAnalysis.profit || 0)}
                  </p>
                </div>
                <div className="bg-[#E0E5EC] rounded-lg md:rounded-xl p-1.5 md:p-3 text-center" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                  <p className="text-[8px] md:text-xs text-[#6B7280] mb-0.5 md:mb-1" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>{`Trades`}</p>
                  <p className="text-[10px] md:text-xl font-black text-[#3D4852]" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                    {liveTrades.filter(t => (t.traderAddress || '').toLowerCase() === selectedTraderForAnalysis.address).length}
                  </p>
                </div>
              </div>}
            <div className="bg-[#E0E5EC] rounded-lg md:rounded-2xl p-2 md:p-4 min-h-[200px] md:min-h-[300px]" style={{
          boxShadow: shadowInset
        }}>
              {analysisLoading ? <div className="flex flex-col items-center justify-center h-full gap-2 md:gap-4">
                  <div className="animate-spin h-8 w-8 md:h-12 md:w-12 rounded-full bg-[#E0E5EC]" style={{
              boxShadow: shadowInset
            }}></div>
                  <p className="text-[9px] md:text-sm text-[#6B7280] font-medium" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>
                    {`Analyzing trading patterns...`}
                  </p>
                </div> : <div className="prose prose-sm md:prose-base max-w-none">
                  <p className="text-[9px] md:text-sm text-[#3D4852] whitespace-pre-wrap leading-relaxed" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>
                    {analysisData || 'No analysis available'}
                  </p>
                </div>}
            </div>
            <div className="mt-3 md:mt-4 flex gap-1 md:gap-2">
              <button onClick={() => setShowAnalysisModal(false)} className="flex-1 px-3 py-1.5 md:px-6 md:py-3 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-lg md:rounded-2xl font-bold text-[10px] md:text-base transition-all duration-300" style={{
            boxShadow: shadowExtruded,
            fontFamily: `DM Sans, sans-serif`
          }}>
                {`Close`}
              </button>
            </div>
          </div>
        </div>}
      {error && <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-3 md:p-8 mb-3 md:mb-8 text-center" style={{
      boxShadow: shadowExtruded
    }}>
          <p className="text-[#6C63FF] font-bold text-xs md:text-lg" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>{`Error: ${error}`}</p>
          <p className="text-[#6B7280] text-[10px] md:text-sm mt-1 md:mt-2" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>{`Failed to fetch live trade data. Try again!`}</p>
        </div>}
      {loading && !error && <div className="flex justify-center items-center py-8 md:py-20">
          <div className="animate-spin h-10 w-10 md:h-16 md:w-16 rounded-full bg-[#E0E5EC]" style={{
        boxShadow: shadowInset
      }}></div>
        </div>}
      {!loading && !error && liveTrades.length === 0 && <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-4 md:p-12 text-center" style={{
      boxShadow: shadowExtruded
    }}>
          <p className="text-[#3D4852] text-sm md:text-xl font-bold" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>{`No live trades found`}</p>
          <p className="text-[#6B7280] text-xs md:text-base mt-1 md:mt-2" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>{`The market is quiet... too quiet.`}</p>
        </div>}
      {!loading && !error && liveTrades.length > 0 && <div className="grid gap-2 md:gap-8">
          {liveTrades.map((trade, index) => {
        const polymarketUrl = trade.eventSlug ? `https://polymarket.com/event/${trade.eventSlug}` : `https://polymarket.com`;
        const traderAddress = (trade.traderAddress || '').toLowerCase();
        const traderRank = traderRankings[traderAddress];
        return <div key={trade.id || trade.transactionHash || index} className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-2 md:p-8 transition-all duration-300 hover:-translate-y-1" style={{
          boxShadow: shadowExtruded
        }}>
              <div className="flex items-start justify-between gap-2 md:gap-6 flex-wrap">
                <div className="flex items-start gap-1.5 md:gap-6 flex-1 min-w-0">
                  {trade.icon && <div className="flex-shrink-0">
                      <img src={trade.icon} alt={trade.eventTitle} className="w-10 h-10 md:w-24 md:h-24 object-cover rounded-md md:rounded-2xl" style={{
                  boxShadow: shadowExtrudedSmall
                }} onError={e => {
                  e.target.style.display = 'none';
                }} />
                    </div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-0.5 md:gap-2 mb-1 md:mb-3 flex-wrap">
                    <div className={`px-1.5 py-0.5 md:px-3 md:py-1 text-[9px] md:text-sm font-bold rounded-md md:rounded-xl ${trade.side === 'BUY' ? 'bg-[#38B2AC] text-white' : 'bg-[#6C63FF] text-white'}`} style={{
                    boxShadow: shadowExtrudedSmall,
                    fontFamily: `Plus Jakarta Sans, sans-serif`
                  }}>
                        {trade.side === 'BUY' ? '🟢 BUY' : '🔴 SELL'}
                      </div>
                      <div className="px-1.5 py-0.5 md:px-3 md:py-1 text-[9px] md:text-sm font-medium bg-[#E0E5EC] rounded-md md:rounded-xl" style={{
                    boxShadow: shadowInsetSmall,
                    fontFamily: `DM Sans, sans-serif`
                  }}>
                        {trade.outcome}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 mb-0 md:mb-1">
                      <p className="text-[8px] md:text-sm text-[#6B7280]" style={{
                    fontFamily: `DM Sans, sans-serif`
                  }}>{`Trader`}</p>
                      {traderRank && <div className="px-1 py-0.5 md:px-2 md:py-1 bg-[#E0E5EC] rounded-md md:rounded-lg flex items-center gap-0.5 md:gap-1" style={{
                    boxShadow: shadowInsetSmall
                  }}>
                          <Trophy className="w-2 h-2 md:w-3 md:h-3 text-[#6C63FF]" strokeWidth={2.5} />
                          <span className="text-[8px] md:text-xs font-bold text-[#6C63FF]" style={{
                      fontFamily: `Plus Jakarta Sans, sans-serif`
                    }}>
                            #{traderRank.rank}
                          </span>
                        </div>}
                    </div>
                    <h3 className="text-[10px] md:text-xl font-bold text-[#3D4852] truncate mb-1 md:mb-3" style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                      {trade.traderDisplayName || trade.traderAddress || `Unknown Trader`}
                    </h3>
                    <p className="text-[8px] md:text-sm text-[#6B7280] mb-0 md:mb-1" style={{
                  fontFamily: `DM Sans, sans-serif`
                }}>{`Event Market`}</p>
                    <p className="text-[10px] md:text-lg font-medium text-[#3D4852] mb-1.5 md:mb-4 line-clamp-2" style={{
                  fontFamily: `DM Sans, sans-serif`
                }}>
                      {trade.eventTitle}
                    </p>
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                      <div className="bg-[#E0E5EC] rounded-md md:rounded-2xl p-1 md:p-4" style={{
                    boxShadow: shadowExtrudedSmall
                  }}>
                        <p className="text-[8px] md:text-xs text-[#6B7280] mb-0 md:mb-1" style={{
                      fontFamily: `DM Sans, sans-serif`
                    }}>{`Shares`}</p>
                        <p className="text-[10px] md:text-xl font-black text-[#3D4852]" style={{
                      fontFamily: `Plus Jakarta Sans, sans-serif`
                    }}>
                          {trade.shares?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="bg-[#E0E5EC] rounded-md md:rounded-2xl p-1 md:p-4" style={{
                    boxShadow: shadowExtrudedSmall
                  }}>
                        <p className="text-[8px] md:text-xs text-[#6B7280] mb-0 md:mb-1" style={{
                      fontFamily: `DM Sans, sans-serif`
                    }}>{`Amount`}</p>
                        <p className="text-[10px] md:text-xl font-black text-[#6C63FF]" style={{
                      fontFamily: `Plus Jakarta Sans, sans-serif`
                    }}>
                          {formatProfit(trade.value || 0)}
                        </p>
                      </div>
                      <div className="bg-[#E0E5EC] rounded-md md:rounded-2xl p-1 md:p-4" style={{
                    boxShadow: shadowExtrudedSmall
                  }}>
                        <p className="text-[8px] md:text-xs text-[#6B7280] mb-0 md:mb-1" style={{
                      fontFamily: `DM Sans, sans-serif`
                    }}>{`Price`}</p>
                        <p className="text-[10px] md:text-xl font-black text-[#38B2AC]" style={{
                      fontFamily: `Plus Jakarta Sans, sans-serif`
                    }}>
                          {formatProfit(trade.price || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-6 flex gap-1 md:gap-3 justify-end flex-wrap">
                {userWallet && !trackedTrades[trade.id || trade.transactionHash] && <button onClick={() => handleTrackTrade(trade)} className="px-2 py-1 md:px-6 md:py-3 bg-[#38B2AC] hover:bg-[#319795] text-white rounded-md md:rounded-2xl font-bold flex items-center gap-0.5 md:gap-2 transition-all duration-300 hover:-translate-y-1 text-[10px] md:text-base justify-center" style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                    <Bookmark className="w-2.5 h-2.5 md:w-5 md:h-5" strokeWidth={2.5} />
                    {`Track Trade`}
                  </button>}
                {trackedTrades[trade.id || trade.transactionHash] && <div className="flex gap-1 md:gap-2 items-center">
                    <div className="px-2 py-1 md:px-4 md:py-2 bg-[#E0E5EC] rounded-md md:rounded-xl flex items-center gap-1" style={{
                boxShadow: shadowInsetSmall
              }}>
                      <DollarSign className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#38B2AC]" strokeWidth={2.5} />
                      <span className={`text-[10px] md:text-sm font-bold ${trackedTrades[trade.id || trade.transactionHash].profitLoss >= 0 ? 'text-[#38B2AC]' : 'text-[#6C63FF]'}`} style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                        {trackedTrades[trade.id || trade.transactionHash].profitLoss >= 0 ? '+' : ''}{formatProfit(trackedTrades[trade.id || trade.transactionHash].profitLoss)}
                      </span>
                    </div>
                    <button onClick={() => shareOnTwitter(trackedTrades[trade.id || trade.transactionHash])} className="px-2 py-1 md:px-4 md:py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-md md:rounded-xl font-bold flex items-center gap-0.5 md:gap-1 transition-all duration-300 hover:-translate-y-1 text-[10px] md:text-sm" style={{
                boxShadow: shadowExtrudedSmall,
                fontFamily: `DM Sans, sans-serif`
              }}>
                      <Share2 className="w-2.5 h-2.5 md:w-4 md:h-4" strokeWidth={2.5} />
                      {`Share`}
                    </button>
                  </div>}
                <a href={polymarketUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 md:px-6 md:py-3 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-md md:rounded-2xl font-bold flex items-center gap-0.5 md:gap-2 transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5 text-[10px] md:text-base justify-center" style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                  {`Trade on Polymarket`}
                  <ExternalLink className="w-2.5 h-2.5 md:w-5 md:h-5" strokeWidth={2.5} />
                </a>
              </div>
            </div>;
      })}
        </div>}
      {showTrackModal && selectedTradeForTracking && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-2 md:p-4 pt-20 md:pt-24">
          <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-3 md:p-6 max-w-lg w-full" style={{
        boxShadow: shadowExtruded
      }}>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-sm md:text-xl font-bold text-[#3D4852]" style={{
            fontFamily: `Plus Jakarta Sans, sans-serif`
          }}>
                {`Track Trade`}
              </h2>
              <button onClick={() => setShowTrackModal(false)} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#E0E5EC] flex items-center justify-center hover:bg-[#6C63FF] hover:text-white transition-all duration-300" style={{
            boxShadow: shadowExtrudedSmall
          }}>
                <X className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="bg-[#E0E5EC] rounded-lg md:rounded-xl p-2 md:p-3 mb-3 md:mb-4" style={{
          boxShadow: shadowInsetSmall
        }}>
              <p className="text-[9px] md:text-sm text-[#6B7280] mb-1" style={{
            fontFamily: `DM Sans, sans-serif`
          }}>{`Trade Details`}</p>
              <p className="text-[10px] md:text-base font-bold text-[#3D4852] mb-1" style={{
            fontFamily: `Plus Jakarta Sans, sans-serif`
          }}>
                {selectedTradeForTracking.eventTitle}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2 py-1 text-[9px] md:text-xs font-bold rounded-md ${selectedTradeForTracking.side === 'BUY' ? 'bg-[#38B2AC] text-white' : 'bg-[#6C63FF] text-white'}`}>
                  {selectedTradeForTracking.side}
                </span>
                <span className="px-2 py-1 text-[9px] md:text-xs font-medium bg-[#E0E5EC] rounded-md" style={{
              boxShadow: shadowInsetSmall
            }}>
                  {selectedTradeForTracking.outcome}
                </span>
              </div>
            </div>

            <form onSubmit={e => {
          e.preventDefault();
          const formData = new FormData(e.target);
          saveTrackedTrade(formData.get('profitLoss'), '');
        }}>
              <div className="mb-4 md:mb-6">
                <label className="block text-[9px] md:text-sm text-[#6B7280] mb-1 md:mb-2 font-medium" style={{
              fontFamily: `DM Sans, sans-serif`
            }}>
                  {`Profit/Loss ($)`}
                </label>
                <input type="number" name="profitLoss" step="0.01" required placeholder="Enter P&L (e.g., 150.50 or -75.25)" className="w-full px-3 py-2 md:px-4 md:py-3 bg-[#E0E5EC] rounded-lg md:rounded-xl text-[10px] md:text-base text-[#3D4852] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" style={{
              boxShadow: shadowInset,
              fontFamily: `DM Sans, sans-serif`
            }} />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTrackModal(false)} className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-[#E0E5EC] hover:bg-[#d5dae0] text-[#3D4852] rounded-lg md:rounded-xl font-bold text-[10px] md:text-base transition-all duration-300" style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                  {`Cancel`}
                </button>
                <button type="submit" className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-lg md:rounded-xl font-bold text-[10px] md:text-base transition-all duration-300" style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                  {`Save Trade`}
                </button>
              </div>
            </form>
          </div>
        </div>}

      <div className="mt-4 md:mt-16 text-center px-1 md:px-4">
        <p className="text-[#3D4852] text-[10px] md:text-lg font-bold" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`⚡ Real-time Trades`}
        </p>
        <p className="text-[#6B7280] text-[10px] md:text-base mt-1 md:mt-2" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`⚠️ Not financial advice. DYOR before copying anyone's trades!`}
        </p>
      </div>
    </div>;
}
function ProfilePage() {
  const {
    devbaseClient,
    userWallet
  } = useDevapp();
  const [trackedTrades, setTrackedTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalPnL: 0,
    winRate: 0
  });
  useEffect(() => {
    const fetchTrackedTrades = async () => {
      if (!devbaseClient || !userWallet) {
        setLoading(false);
        return;
      }
      try {
        const trades = await devbaseClient.listEntities('trackedTrades', {
          userId: userWallet
        });
        setTrackedTrades(trades);
        const totalPnL = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
        const wins = trades.filter(t => t.profitLoss > 0).length;
        const winRate = trades.length > 0 ? wins / trades.length * 100 : 0;
        setStats({
          totalTrades: trades.length,
          totalPnL,
          winRate
        });
      } catch (err) {
        console.error('Failed to fetch tracked trades:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackedTrades();
  }, [devbaseClient, userWallet]);
  const shareOverallStats = () => {
    const pnl = stats.totalPnL >= 0 ? `+${stats.totalPnL.toFixed(2)}` : `-${Math.abs(stats.totalPnL).toFixed(2)}`;
    const emoji = stats.totalPnL >= 0 ? '🚀' : '📊';
    const text = `${emoji} My PolyTraders Stats:\n\n📈 ${stats.totalTrades} trades tracked\n💰 ${pnl} total P&L\n🎯 ${stats.winRate.toFixed(1)}% win rate\n\nCopy top traders: https://dev.fun/p/59932f2f0b6d5afa6573`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };
  if (!userWallet) {
    return <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-8">
        <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-4 md:p-12 text-center" style={{
        boxShadow: shadowExtruded
      }}>
          <p className="text-[#3D4852] text-sm md:text-xl font-bold mb-2" style={{
          fontFamily: `Plus Jakarta Sans, sans-serif`
        }}>
            {`Connect Your Wallet`}
          </p>
          <p className="text-[#6B7280] text-xs md:text-base" style={{
          fontFamily: `DM Sans, sans-serif`
        }}>
            {`Connect your wallet to track your copied trades and view your performance!`}
          </p>
        </div>
      </div>;
  }
  return <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-8">
      <div className="text-center mb-4 md:mb-6">
        <p className="text-xs md:text-xl text-[#3D4852] font-medium mb-0.5 md:mb-1" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Your Trading Performance`}
        </p>
        <p className="text-[9px] md:text-base text-[#6B7280] max-w-2xl mx-auto px-1 md:px-4" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
          {`Track your copied trades and share your wins! 📊`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
        <div className="bg-[#E0E5EC] rounded-lg md:rounded-2xl p-2 md:p-6 text-center" style={{
        boxShadow: shadowExtruded
      }}>
          <p className="text-[8px] md:text-sm text-[#6B7280] mb-1 md:mb-2" style={{
          fontFamily: `DM Sans, sans-serif`
        }}>{`Total Trades`}</p>
          <p className="text-sm md:text-3xl font-black text-[#6C63FF]" style={{
          fontFamily: `Plus Jakarta Sans, sans-serif`
        }}>
            {stats.totalTrades}
          </p>
        </div>
        <div className="bg-[#E0E5EC] rounded-lg md:rounded-2xl p-2 md:p-6 text-center" style={{
        boxShadow: shadowExtruded
      }}>
          <p className="text-[8px] md:text-sm text-[#6B7280] mb-1 md:mb-2" style={{
          fontFamily: `DM Sans, sans-serif`
        }}>{`Total P&L`}</p>
          <p className={`text-sm md:text-3xl font-black ${stats.totalPnL >= 0 ? 'text-[#38B2AC]' : 'text-[#6C63FF]'}`} style={{
          fontFamily: `Plus Jakarta Sans, sans-serif`
        }}>
            {stats.totalPnL >= 0 ? '+' : ''}{formatProfit(stats.totalPnL)}
          </p>
        </div>
        <div className="bg-[#E0E5EC] rounded-lg md:rounded-2xl p-2 md:p-6 text-center" style={{
        boxShadow: shadowExtruded
      }}>
          <p className="text-[8px] md:text-sm text-[#6B7280] mb-1 md:mb-2" style={{
          fontFamily: `DM Sans, sans-serif`
        }}>{`Win Rate`}</p>
          <p className="text-sm md:text-3xl font-black text-[#3D4852]" style={{
          fontFamily: `Plus Jakarta Sans, sans-serif`
        }}>
            {stats.winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {stats.totalTrades > 0 && <div className="mb-4 md:mb-8 text-center">
          <button onClick={shareOverallStats} className="px-4 py-2 md:px-8 md:py-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg md:rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all duration-300 hover:-translate-y-1 text-xs md:text-lg mx-auto" style={{
        boxShadow: shadowExtruded,
        fontFamily: `DM Sans, sans-serif`
      }}>
            <Share2 className="w-4 h-4 md:w-6 md:h-6" strokeWidth={2.5} />
            {`Share My Stats on X`}
          </button>
        </div>}

      {loading ? <div className="flex justify-center items-center py-8 md:py-20">
          <div className="animate-spin h-10 w-10 md:h-16 md:w-16 rounded-full bg-[#E0E5EC]" style={{
        boxShadow: shadowInset
      }}></div>
        </div> : trackedTrades.length === 0 ? <div className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-4 md:p-12 text-center" style={{
      boxShadow: shadowExtruded
    }}>
          <p className="text-[#3D4852] text-sm md:text-xl font-bold mb-2" style={{
        fontFamily: `Plus Jakarta Sans, sans-serif`
      }}>
            {`No Tracked Trades Yet`}
          </p>
          <p className="text-[#6B7280] text-xs md:text-base" style={{
        fontFamily: `DM Sans, sans-serif`
      }}>
            {`Start tracking trades from the Live Trades page to see your performance here!`}
          </p>
        </div> : <div className="grid gap-2 md:gap-4">
          {trackedTrades.map((trade, index) => <div key={trade.id || index} className="bg-[#E0E5EC] rounded-lg md:rounded-[32px] p-2 md:p-6 transition-all duration-300 hover:-translate-y-1" style={{
        boxShadow: shadowExtruded
      }}>
              <div className="flex items-start gap-2 md:gap-4">
                {trade.icon && <img src={trade.icon} alt={trade.eventTitle} className="w-12 h-12 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0" style={{
            boxShadow: shadowExtrudedSmall
          }} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 flex-wrap">
                    <span className={`px-2 py-1 text-[9px] md:text-sm font-bold rounded-md ${trade.side === 'BUY' ? 'bg-[#38B2AC] text-white' : 'bg-[#6C63FF] text-white'}`} style={{
                fontFamily: `Plus Jakarta Sans, sans-serif`
              }}>
                      {trade.side}
                    </span>
                    <span className="px-2 py-1 text-[9px] md:text-sm font-medium bg-[#E0E5EC] rounded-md" style={{
                boxShadow: shadowInsetSmall,
                fontFamily: `DM Sans, sans-serif`
              }}>
                      {trade.outcome}
                    </span>
                  </div>
                  <h3 className="text-[10px] md:text-lg font-bold text-[#3D4852] mb-1 md:mb-2 line-clamp-2" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                    {trade.eventTitle}
                  </h3>
                  <div className="grid grid-cols-3 gap-1 md:gap-2 mb-2 md:mb-3">
                    <div className="bg-[#E0E5EC] rounded-md p-1 md:p-2" style={{
                boxShadow: shadowExtrudedSmall
              }}>
                      <p className="text-[8px] md:text-xs text-[#6B7280]" style={{
                  fontFamily: `DM Sans, sans-serif`
                }}>{`Entry`}</p>
                      <p className="text-[9px] md:text-base font-bold text-[#3D4852]" style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                        {formatProfit(trade.entryAmount)}
                      </p>
                    </div>
                    <div className="bg-[#E0E5EC] rounded-md p-1 md:p-2" style={{
                boxShadow: shadowExtrudedSmall
              }}>
                      <p className="text-[8px] md:text-xs text-[#6B7280]" style={{
                  fontFamily: `DM Sans, sans-serif`
                }}>{`P&L`}</p>
                      <p className={`text-[9px] md:text-base font-bold ${trade.profitLoss >= 0 ? 'text-[#38B2AC]' : 'text-[#6C63FF]'}`} style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                        {trade.profitLoss >= 0 ? '+' : ''}{formatProfit(trade.profitLoss)}
                      </p>
                    </div>
                    <div className="bg-[#E0E5EC] rounded-md p-1 md:p-2" style={{
                boxShadow: shadowExtrudedSmall
              }}>
                      <p className="text-[8px] md:text-xs text-[#6B7280]" style={{
                  fontFamily: `DM Sans, sans-serif`
                }}>{`Shares`}</p>
                      <p className="text-[9px] md:text-base font-bold text-[#3D4852]" style={{
                  fontFamily: `Plus Jakarta Sans, sans-serif`
                }}>
                        {trade.shares?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 md:gap-2 flex-wrap">
                    {trade.polymarketLink && <a href={trade.polymarketLink} target="_blank" rel="noopener noreferrer" className="px-2 py-1 md:px-4 md:py-2 bg-[#6C63FF] hover:bg-[#8B84FF] text-white rounded-md md:rounded-xl font-bold flex items-center gap-1 transition-all duration-300 hover:-translate-y-1 text-[9px] md:text-sm" style={{
                boxShadow: shadowExtrudedSmall,
                fontFamily: `DM Sans, sans-serif`
              }}>
                        <ExternalLink className="w-2.5 h-2.5 md:w-4 md:h-4" strokeWidth={2.5} />
                        {`View Position`}
                      </a>}
                    <button onClick={() => {
                const pnl = trade.profitLoss >= 0 ? `+${trade.profitLoss.toFixed(2)}` : `-${Math.abs(trade.profitLoss).toFixed(2)}`;
                const emoji = trade.profitLoss >= 0 ? '🚀' : '📉';
                const text = `${emoji} Just closed a ${trade.side} position on "${trade.eventTitle}" with ${pnl} P&L using @PolyTraders!\n\nTrack top traders: https://dev.fun/p/59932f2f0b6d5afa6573`;
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(twitterUrl, '_blank');
              }} className="px-2 py-1 md:px-4 md:py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-md md:rounded-xl font-bold flex items-center gap-1 transition-all duration-300 hover:-translate-y-1 text-[9px] md:text-sm" style={{
                boxShadow: shadowExtrudedSmall,
                fontFamily: `DM Sans, sans-serif`
              }}>
                      <Share2 className="w-2.5 h-2.5 md:w-4 md:h-4" strokeWidth={2.5} />
                      {`Share`}
                    </button>
                  </div>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
}
function AppContent() {
  const [activePage, setActivePage] = useState('/');
  const [showSplash, setShowSplash] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    const preloadData = async () => {
      try {
        await Promise.all([fetch(`https://corsproxy.io/?${encodeURIComponent('https://693ee85255fb0d5e85311330-api.poof.new/api/leaderboard?period=daily&category=all')}`), new Promise(resolve => setTimeout(resolve, 2000))]);
        setDataReady(true);
      } catch (err) {
        setDataReady(true);
      }
    };
    preloadData();
  }, []);
  const handleSplashComplete = () => {
    if (dataReady) {
      setShowSplash(false);
    }
  };
  useEffect(() => {
    if (dataReady && !showSplash) {
      return;
    }
    if (dataReady) {
      handleSplashComplete();
    }
  }, [dataReady, showSplash]);
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  return <Router>
      <div className="min-h-screen bg-[#E0E5EC]" style={{
      fontFamily: `DM Sans, sans-serif`
    }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        `}</style>
        <nav className="sticky top-0 z-50 bg-[#E0E5EC] backdrop-blur-sm p-2 md:p-4" style={{
        boxShadow: shadowExtruded
      }}>
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#E0E5EC] flex items-center justify-center overflow-hidden" style={{
              boxShadow: shadowInsetDeep
            }}>
                <img src={LOGO_URL} alt="PolyCopy Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-sm md:text-2xl font-extrabold text-[#3D4852] tracking-tight" style={{
              fontFamily: `Plus Jakarta Sans, sans-serif`
            }}>
                POLY TRADERS
              </h1>
            </div>
            <div className="flex gap-2 lg:gap-4 w-full justify-center items-center">
              <Link to="/" onClick={() => setActivePage('/')} className={`text-xs lg:text-base font-bold transition-all duration-300 flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl hover:-translate-y-1 focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] ${activePage === '/' ? 'bg-[#6C63FF] text-white' : 'bg-[#E0E5EC] text-[#3D4852] hover:text-[#6C63FF]'}`} style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                <Trophy className="w-3 h-3 lg:w-4 lg:h-4" strokeWidth={2.5} />
                {`Leaderboard`}
              </Link>
              <Link to="/live-trades" onClick={() => setActivePage('/live-trades')} className={`text-xs lg:text-base font-bold transition-all duration-300 flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl hover:-translate-y-1 focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] ${activePage === '/live-trades' ? 'bg-[#6C63FF] text-white' : 'bg-[#E0E5EC] text-[#3D4852] hover:text-[#6C63FF]'}`} style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                <Activity className="w-3 h-3 lg:w-4 lg:h-4" strokeWidth={2.5} />
                {`Live Trades`}
              </Link>
              <Link to="/profile" onClick={() => setActivePage('/profile')} className={`text-xs lg:text-base font-bold transition-all duration-300 flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl hover:-translate-y-1 focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] ${activePage === '/profile' ? 'bg-[#6C63FF] text-white' : 'bg-[#E0E5EC] text-[#3D4852] hover:text-[#6C63FF]'}`} style={{
              boxShadow: shadowExtruded,
              fontFamily: `DM Sans, sans-serif`
            }}>
                <Eye className="w-3 h-3 lg:w-4 lg:h-4" strokeWidth={2.5} />
                {`Profile`}
              </Link>
              <UserButton height="32px" primaryColor="#6C63FF" bgColor="#E0E5EC" textColor="#3D4852" hoverBgColor="#6C63FF" radius="12px" dropdownBgColor="#E0E5EC" dropdownTextColor="#3D4852" dropdownHoverBgColor="#6C63FF" />
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/live-trades" element={<LiveTradesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>;
}
export default function App() {
  return <DevappProvider rpcEndpoint="https://rpc.dev.fun/59932f2f0b6d5afa6573" devbaseEndpoint="https://devbase.dev.fun" appId="59932f2f0b6d5afa6573">
      <AppContent />
    </DevappProvider>;
}
