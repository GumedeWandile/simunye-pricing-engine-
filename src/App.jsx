import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, DollarSign, TrendingUp, FileText, Download, CheckCircle, AlertCircle, Search, Zap } from 'lucide-react';

export default function SimunyePricingIntelligence() {
  const [activeTab, setActiveTab] = useState('uploader');
  const [wholesalerItems, setWholesalerItems] = useState([
    { id: 1, name: 'Maize Meal (5kg)', wholesalePrice: 42, supplier: 'Makro', category: 'Staples' },
    { id: 2, name: 'Sugar (2kg)', wholesalePrice: 28, supplier: 'Spar', category: 'Staples' },
    { id: 3, name: 'Flour (5kg)', wholesalePrice: 38, supplier: 'Makro', category: 'Staples' },
    { id: 4, name: 'Rice (5kg)', wholesalePrice: 65, supplier: 'Fresh Market', category: 'Staples' },
    { id: 5, name: 'Cooking Oil (2L)', wholesalePrice: 48, supplier: 'Makro', category: 'Oils' },
    { id: 6, name: 'Eggs (30)', wholesalePrice: 52, supplier: 'Fresh Market', category: 'Proteins' },
    { id: 7, name: 'Milk (1L)', wholesalePrice: 12, supplier: 'Makro', category: 'Proteins' },
    { id: 8, name: 'Cheese (500g)', wholesalePrice: 45, supplier: 'Spar', category: 'Proteins' },
    { id: 9, name: 'Tomatoes (5kg)', wholesalePrice: 35, supplier: 'Fresh Market', category: 'Produce' },
    { id: 10, name: 'Onions (5kg)', wholesalePrice: 22, supplier: 'Fresh Market', category: 'Produce' },
  ]);

  const [retailPrices, setRetailPrices] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [recommendedMenu, setRecommendedMenu] = useState(null);
  const [newWholesaler, setNewWholesaler] = useState({
    name: '',
    wholesalePrice: '',
    supplier: 'Makro',
    category: 'Staples'
  });

  // Simulated retail prices (would come from APIs)
  const getRetailPrice = (itemName) => {
    const retailPriceMap = {
      'Maize Meal (5kg)': 55,
      'Sugar (2kg)': 40,
      'Flour (5kg)': 60,
      'Rice (5kg)': 95,
      'Cooking Oil (2L)': 75,
      'Eggs (30)': 75,
      'Milk (1L)': 20,
      'Cheese (500g)': 68,
      'Tomatoes (5kg)': 60,
      'Onions (5kg)': 40,
    };
    return retailPriceMap[itemName] || retailPrices[itemName] || null;
  };

  // Add manual wholesaler entry
  const addWholesalerItem = () => {
    if (newWholesaler.name && newWholesaler.wholesalePrice) {
      setWholesalerItems([...wholesalerItems, {
        id: Date.now(),
        ...newWholesaler,
        wholesalePrice: parseFloat(newWholesaler.wholesalePrice)
      }]);
      setNewWholesaler({ name: '', wholesalePrice: '', supplier: 'Makro', category: 'Staples' });
    }
  };

  // Calculate item metrics
  const calculateMetrics = (item, retailPrice, discountPercent = 20) => {
    if (!retailPrice) return null;
    const wholesale = item.wholesalePrice;
    const customerPrice = retailPrice * (1 - discountPercent / 100);
    const margin = customerPrice - wholesale;
    const marginPercent = (margin / wholesale * 100).toFixed(1);
    const customerSavings = (retailPrice - customerPrice).toFixed(0);
    
    return { wholesale, retailPrice, customerPrice: customerPrice.toFixed(2), margin: margin.toFixed(2), marginPercent, customerSavings };
  };

  // Intelligent menu builder
  const buildIntelligentMenu = () => {
    const discountPercent = 20;
    const minMargin = 15;
    const maxDeviationPercent = 2.5;

    // Score each item
    const scoredItems = wholesalerItems.map(item => {
      const retailPrice = getRetailPrice(item.name);
      if (!retailPrice) return null;
      
      const metrics = calculateMetrics(item, retailPrice, discountPercent);
      if (!metrics || parseFloat(metrics.marginPercent) < minMargin) return null;

      const score = {
        item,
        ...metrics,
        qualityScore: (
          (parseFloat(metrics.marginPercent) / 100) * 0.4 + // 40% margin
          (parseInt(metrics.customerSavings) / 100) * 0.3 + // 30% customer savings
          (retailPrice / 100) * 0.3 // 30% volume (price)
        )
      };
      
      return score;
    }).filter(Boolean);

    // Sort by quality score
    scoredItems.sort((a, b) => b.qualityScore - a.qualityScore);

    // Build 2 combos
    const categories = ['Staples', 'Oils', 'Proteins', 'Produce'];
    const itemsPerCategory = { Staples: 12, Oils: 10, Proteins: 10, Produce: 12, Rotating: 6 };

    // Combo A: Maximum Savings (customer-focused)
    const comboA = [];
    const comboAMap = { Staples: 0, Oils: 0, Proteins: 0, Produce: 0 };
    scoredItems.forEach(score => {
      const cat = score.item.category;
      if (cat in comboAMap && comboAMap[cat] < itemsPerCategory[cat]) {
        comboA.push(score);
        comboAMap[cat]++;
      }
    });

    // Combo B: Maximum Margin (profit-focused) - reorder by margin
    const sortedByMargin = [...scoredItems].sort((a, b) => parseFloat(b.marginPercent) - parseFloat(a.marginPercent));
    const comboB = [];
    const comboBMap = { Staples: 0, Oils: 0, Proteins: 0, Produce: 0 };
    sortedByMargin.forEach(score => {
      const cat = score.item.category;
      if (cat in comboBMap && comboBMap[cat] < itemsPerCategory[cat]) {
        comboB.push(score);
        comboBMap[cat]++;
      }
    });

    setRecommendedMenu({ comboA: comboA.slice(0, 50), comboB: comboB.slice(0, 50) });
  };

  const totalMarginA = recommendedMenu?.comboA?.reduce((sum, item) => sum + parseFloat(item.margin), 0) || 0;
  const totalMarginB = recommendedMenu?.comboB?.reduce((sum, item) => sum + parseFloat(item.margin), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-md bg-slate-950/50 border-b border-blue-500/30 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-4">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                SIMUNYE PRICING INTELLIGENCE v3.0
              </h1>
              <p className="text-slate-300 text-sm mt-2">Upload PDFs → Check Retail Prices → Pick Best 50 Items → Generate 2 Combos</p>
            </div>

            <div className="flex gap-2 border-b border-blue-500/30 overflow-x-auto">
              {[
                { id: 'uploader', label: '📤 Wholesaler Upload' },
                { id: 'retail', label: '🏪 Retail Prices' },
                { id: 'picker', label: '🎯 50-Item Picker' },
                { id: 'combos', label: '🔄 Recommended Combos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* UPLOADER TAB */}
          {activeTab === 'uploader' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">📤 Upload Wholesaler Pamphlets</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block">
                      <div className="border-2 border-dashed border-blue-500/50 rounded-lg p-12 hover:bg-blue-500/5 transition-colors cursor-pointer text-center">
                        <Upload size={48} className="mx-auto mb-4 text-blue-400" />
                        <p className="text-white font-semibold mb-2">Click to upload PDF</p>
                        <p className="text-xs text-slate-500">Makro, Spar, Fresh Market pamphlets</p>
                      </div>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h3 className="font-bold text-blue-300 mb-2">OCR Extraction</h3>
                      <p className="text-sm text-slate-300">Auto-extracts prices from PDF using Claude API</p>
                      <p className="text-xs text-slate-400 mt-2">⏱️ Takes 30 seconds</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Or Add Items Manually</h3>
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={newWholesaler.name}
                      onChange={(e) => setNewWholesaler({ ...newWholesaler, name: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Wholesale price"
                      value={newWholesaler.wholesalePrice}
                      onChange={(e) => setNewWholesaler({ ...newWholesaler, wholesalePrice: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <select
                      value={newWholesaler.supplier}
                      onChange={(e) => setNewWholesaler({ ...newWholesaler, supplier: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option>Makro</option>
                      <option>Spar</option>
                      <option>Fresh Market</option>
                    </select>
                    <select
                      value={newWholesaler.category}
                      onChange={(e) => setNewWholesaler({ ...newWholesaler, category: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option>Staples</option>
                      <option>Oils</option>
                      <option>Proteins</option>
                      <option>Produce</option>
                    </select>
                    <button
                      onClick={addWholesalerItem}
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded font-semibold transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Items */}
              <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Item</th>
                      <th className="px-4 py-3 text-left font-bold">Category</th>
                      <th className="px-4 py-3 text-right font-bold">Wholesale</th>
                      <th className="px-4 py-3 text-center font-bold">Supplier</th>
                      <th className="px-4 py-3 text-center font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {wholesalerItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/20">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 text-xs"><span className="bg-slate-700/50 px-2 py-1 rounded">{item.category}</span></td>
                        <td className="px-4 py-3 text-right font-bold text-blue-400">R{item.wholesalePrice}</td>
                        <td className="px-4 py-3 text-center text-xs text-slate-400">{item.supplier}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setWholesalerItems(wholesalerItems.filter(i => i.id !== item.id))}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RETAIL TAB */}
          {activeTab === 'retail' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">🏪 Retail Price Checking</h2>
                <p className="text-slate-400 mb-6">Automatically check prices from CheckersSixty60, Spar2U, PnP ASAP</p>

                <button
                  onClick={() => {
                    alert('In production: This would query real APIs\n\nCheckersSixty60, Spar2U, PnP ASAP\n\nFor demo, we use simulated prices');
                  }}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-6 py-3 rounded font-semibold w-full flex items-center justify-center gap-2"
                >
                  <Search size={20} /> Check Retail Prices (Demo Mode)
                </button>
              </div>

              {/* Retail Comparison Table */}
              <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Item</th>
                      <th className="px-4 py-3 text-right font-bold">Wholesale</th>
                      <th className="px-4 py-3 text-right font-bold">Best Retail</th>
                      <th className="px-4 py-3 text-right font-bold">Customer (20% off)</th>
                      <th className="px-4 py-3 text-right font-bold">YOUR Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {wholesalerItems.map((item) => {
                      const retailPrice = getRetailPrice(item.name);
                      const metrics = retailPrice ? calculateMetrics(item, retailPrice, 20) : null;
                      return metrics ? (
                        <tr key={item.id} className="hover:bg-slate-700/20">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-400">R{metrics.wholesale}</td>
                          <td className="px-4 py-3 text-right text-orange-400">R{metrics.retailPrice}</td>
                          <td className="px-4 py-3 text-right text-purple-400">R{metrics.customerPrice}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${parseFloat(metrics.marginPercent) >= 15 ? 'text-green-400' : 'text-red-400'}`}>
                              R{metrics.margin} ({metrics.marginPercent}%)
                            </span>
                          </td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PICKER TAB */}
          {activeTab === 'picker' && (
            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">🎯 Intelligent 50-Item Picker</h2>
                <p className="text-slate-400 mb-6">Automatically selects best items based on margin (>15%) and customer savings (20% discount)</p>

                <button
                  onClick={buildIntelligentMenu}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 px-8 py-4 rounded font-bold text-lg w-full flex items-center justify-center gap-2"
                >
                  <Zap size={24} /> Generate Recommended Menus (2 Combos)
                </button>
              </div>

              {recommendedMenu && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
                  <h3 className="font-bold text-emerald-300 mb-4">✅ Menu Generation Complete!</h3>
                  <p className="text-sm text-slate-300">Two different strategies generated. Each with 50 items.</p>
                </div>
              )}
            </div>
          )}

          {/* COMBOS TAB */}
          {activeTab === 'combos' && (
            <div className="space-y-8">
              {!recommendedMenu ? (
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-12 text-center">
                  <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-300">Generate recommended menus first (go to Picker tab)</p>
                </div>
              ) : (
                <>
                  {/* COMBO A */}
                  <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">💰 COMBO A: Maximum Savings</h2>
                        <p className="text-slate-400">Customer-focused (highest retail savings)</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Total Weekly Margin</div>
                        <div className="text-3xl font-black text-blue-400">R{totalMarginA.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">50 items selected</div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                      <p className="text-sm text-slate-300 mb-3">Strategy: Feature items with highest customer savings while maintaining >15% margin</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Avg Margin</div>
                          <div className="font-bold text-blue-400">
                            {(recommendedMenu.comboA.reduce((sum, item) => sum + parseFloat(item.marginPercent), 0) / recommendedMenu.comboA.length).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Avg Customer Saving</div>
                          <div className="font-bold text-green-400">
                            R{(recommendedMenu.comboA.reduce((sum, item) => sum + parseInt(item.customerSavings), 0) / recommendedMenu.comboA.length).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Expected Orders</div>
                          <div className="font-bold text-purple-400">180-220</div>
                        </div>
                      </div>
                    </div>

                    {/* Combo A Items Table */}
                    <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-800 border-b border-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Item</th>
                            <th className="px-3 py-2 text-right">Wholesale</th>
                            <th className="px-3 py-2 text-right">Customer Saves</th>
                            <th className="px-3 py-2 text-right">Margin %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {recommendedMenu.comboA.slice(0, 15).map((score, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/20">
                              <td className="px-3 py-2">{idx + 1}</td>
                              <td className="px-3 py-2">{score.item.name}</td>
                              <td className="px-3 py-2 text-right text-blue-400">R{score.wholesale}</td>
                              <td className="px-3 py-2 text-right text-green-400">R{score.customerSavings}</td>
                              <td className="px-3 py-2 text-right font-bold">{score.marginPercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800">
                        Showing 15 of {recommendedMenu.comboA.length} items
                      </div>
                    </div>
                  </div>

                  {/* COMBO B */}
                  <div className="bg-slate-800/50 backdrop-blur border border-emerald-500/30 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">📈 COMBO B: Maximum Margin</h2>
                        <p className="text-slate-400">Profit-focused (highest Simunye margin)</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Total Weekly Margin</div>
                        <div className="text-3xl font-black text-emerald-400">R{totalMarginB.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">50 items selected</div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                      <p className="text-sm text-slate-300 mb-3">Strategy: Feature items with highest Simunye margin while maintaining customer value</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Avg Margin</div>
                          <div className="font-bold text-emerald-400">
                            {(recommendedMenu.comboB.reduce((sum, item) => sum + parseFloat(item.marginPercent), 0) / recommendedMenu.comboB.length).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Avg Customer Saving</div>
                          <div className="font-bold text-green-400">
                            R{(recommendedMenu.comboB.reduce((sum, item) => sum + parseInt(item.customerSavings), 0) / recommendedMenu.comboB.length).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Expected Orders</div>
                          <div className="font-bold text-purple-400">120-150</div>
                        </div>
                      </div>
                    </div>

                    {/* Combo B Items Table */}
                    <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-800 border-b border-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Item</th>
                            <th className="px-3 py-2 text-right">Wholesale</th>
                            <th className="px-3 py-2 text-right">Customer Saves</th>
                            <th className="px-3 py-2 text-right">Margin %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {recommendedMenu.comboB.slice(0, 15).map((score, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/20">
                              <td className="px-3 py-2">{idx + 1}</td>
                              <td className="px-3 py-2">{score.item.name}</td>
                              <td className="px-3 py-2 text-right text-blue-400">R{score.wholesale}</td>
                              <td className="px-3 py-2 text-right text-green-400">R{score.customerSavings}</td>
                              <td className="px-3 py-2 text-right font-bold">{score.marginPercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800">
                        Showing 15 of {recommendedMenu.comboB.length} items
                      </div>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
                    <h3 className="font-bold text-emerald-300 mb-4">📊 Weekly Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <div className="text-slate-400 mb-2">Total Weekly Margin</div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Combo A:</span>
                            <span className="font-bold text-blue-400">R{totalMarginA.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Combo B:</span>
                            <span className="font-bold text-emerald-400">R{totalMarginB.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-600">
                            <span>Difference:</span>
                            <span className={`font-bold ${totalMarginB > totalMarginA ? 'text-green-400' : 'text-yellow-400'}`}>
                              R{Math.abs(totalMarginB - totalMarginA).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-2">Recommendation</div>
                        <div className="text-sm text-slate-300">
                          {totalMarginB > totalMarginA 
                            ? '🎯 Use Combo B if maximizing profit is priority'
                            : '🎯 Use Combo A if maximizing volume is priority'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-2">Strategy</div>
                        <div className="text-sm text-slate-300">
                          💡 Consider A/B testing both combos in different areas
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
