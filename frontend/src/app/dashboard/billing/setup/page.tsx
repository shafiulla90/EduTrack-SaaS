'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const HARDCODED_SUGGESTIONS = [
  'School Fee', 'Tuition Fee', 'Exam Fee', 'Library Fee', 'Sports Fee',
  'Lab Fee', 'Transport Fee', 'Hostel Fee', 'Activity Fee', 'Admission Fee',
  'Annual Fee', 'Development Fee', 'Computer Lab Fee', 'Stationery Fee', 'Miscellaneous Fee'
];

interface PriceItem {
  id: number;
  name: string;
  price: string;
  selected: boolean;
}

export default function FeeSetupPage() {
  const [activeTab, setActiveTab] = useState<'addFees' | 'setPriceBook'>('addFees');
  const [inputFields, setInputFields] = useState([{ id: 1, value: '', showSuggestions: false }]);
  const [submittedProducts, setSubmittedProducts] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Price Book tab state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [priceItems, setPriceItems] = useState<PriceItem[]>(
    ['Tuition Fee', 'Library Fee', 'Sports Fee', 'Admission Fee', 'Computer Lab Fee', 'Exam Fee'].map((n, i) => ({
      id: i + 1, name: n, price: '', selected: false
    }))
  );

  const handleInputChange = (fieldId: number, value: string) => {
    setInputFields(prev => prev.map(f => f.id === fieldId ? { ...f, value, showSuggestions: value.length > 0 } : f));
  };

  const handleSuggestionClick = (fieldId: number, suggestion: string) => {
    setInputFields(prev => prev.map(f => f.id === fieldId ? { ...f, value: suggestion, showSuggestions: false } : f));
  };

  const handleAddField = () => {
    const newId = Math.max(...inputFields.map(f => f.id)) + 1;
    setInputFields([...inputFields, { id: newId, value: '', showSuggestions: false }]);
  };

  const handleRemoveField = (fieldId: number) => {
    if (inputFields.length === 1) return;
    setInputFields(inputFields.filter(f => f.id !== fieldId));
  };

  const handleSubmitProducts = async () => {
    const products = inputFields.map(f => f.value.trim()).filter(Boolean);
    if (products.length === 0) {
      alert('Please enter at least one product name!');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setSubmittedProducts(products);
    setShowSuccess(true);
    // Add to price book items
    const newItems = products.map((name, i) => ({
      id: priceItems.length + i + 1, name, price: '', selected: false
    }));
    setPriceItems(prev => [...prev, ...newItems]);
    setInputFields([{ id: 1, value: '', showSuggestions: false }]);
  };

  const handleSubmitPriceBook = () => {
    const selected = priceItems.filter(p => p.selected && p.price);
    if (!selectedClass) { alert('Please select a class!'); return; }
    if (!selectedYear) { alert('Please select an academic year!'); return; }
    if (selected.length === 0) { alert('Please select at least one product and enter its price!'); return; }
    const total = selected.reduce((s, p) => s + Number(p.price), 0);
    alert(`✅ Price book created successfully for ${selectedClass}!\n\n${selected.map(p => `• ${p.name}: ₹${Number(p.price).toLocaleString()}`).join('\n')}\n\nTotal: ₹${total.toLocaleString()}`);
  };

  const getSuggestions = (value: string) => {
    const q = value.toLowerCase();
    return HARDCODED_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #43e97b 100%)' }}
    >
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('addFees')}
              className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'addFees'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">📦</span> Add Fee Products
            </button>
            <button
              onClick={() => setActiveTab('setPriceBook')}
              className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'setPriceBook'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">🔥</span> Set Price Book
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'addFees' ? (
              /* ── ADD FEE PRODUCTS TAB ── */
              <>
                {!showSuccess ? (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-[22px] font-extrabold text-slate-800">Create Fee Products</h2>
                      <p className="text-sm text-slate-400 mt-1">Add new fee items to your school&apos;s fee structure.</p>
                    </div>

                    <div className="space-y-3 mb-5">
                      {inputFields.map((field, idx) => (
                        <div key={field.id} className="relative">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <label className="block text-xs text-slate-500 font-semibold mb-1">Product Name</label>
                              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden focus-within:border-purple-400 transition-all">
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={e => handleInputChange(field.id, e.target.value)}
                                  onFocus={() => setInputFields(prev => prev.map(f => f.id === field.id ? {...f, showSuggestions: true} : f))}
                                  onBlur={() => setTimeout(() => setInputFields(prev => prev.map(f => f.id === field.id ? {...f, showSuggestions: false} : f)), 200)}
                                  placeholder="e.g. Tuition Fee, Library Fee, Sports Fee"
                                  className="flex-1 px-4 py-2.5 text-sm text-slate-800 outline-none bg-transparent"
                                />
                                {idx === 0 && (
                                  <button
                                    type="button"
                                    onClick={handleAddField}
                                    className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white text-lg font-bold hover:bg-purple-700 transition-colors"
                                  >
                                    +
                                  </button>
                                )}
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveField(field.id)}
                                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              {/* Suggestions Dropdown */}
                              {field.showSuggestions && field.value && getSuggestions(field.value).length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden mt-1">
                                  {getSuggestions(field.value).map(s => (
                                    <div
                                      key={s}
                                      onMouseDown={() => handleSuggestionClick(field.id, s)}
                                      className="px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 cursor-pointer flex items-center gap-2"
                                    >
                                      <span className="text-base">💡</span>
                                      <span>{s}</span>
                                      <span className="ml-auto text-[10px] text-purple-500 font-bold bg-purple-50 px-1.5 py-0.5 rounded">Suggested</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmitProducts}
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}
                    >
                      {isLoading ? (
                        <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating products...</>
                      ) : (
                        <><span>✓</span> Submit Products</>
                      )}
                    </button>
                  </>
                ) : (
                  /* Success State */
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center text-3xl mx-auto mb-4">
                      ✅
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg mb-2">Products Created!</h3>
                    <div className="space-y-1.5 mb-5 text-left">
                      {submittedProducts.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700">
                          <span className="text-emerald-500">✓</span> {p}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowSuccess(false); setSubmittedProducts([]); }}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                      >
                        + Add More
                      </button>
                      <button
                        onClick={() => { setActiveTab('setPriceBook'); setShowSuccess(false); }}
                        className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600"
                      >
                        Set Price Book 🔥
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ── SET PRICE BOOK TAB ── */
              <>
                <div className="text-center mb-6">
                  <h2 className="text-[22px] font-extrabold text-slate-800">Set Price Book</h2>
                  <p className="text-sm text-slate-400 mt-1">Assign prices to fee products for each class.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1">Academic Year *</label>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-slate-50 focus:border-orange-400"
                    >
                      <option value="">Select Year...</option>
                      <option>2025-2026</option>
                      <option>2026-2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1">Class *</label>
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-slate-50 focus:border-orange-400"
                    >
                      <option value="">Choose a class...</option>
                      <option>Grade 8</option><option>Grade 9</option><option>Grade 10</option>
                      <option>Grade 11</option><option>Grade 12</option>
                    </select>
                  </div>
                </div>

                {priceItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="font-semibold">No products found.</p>
                    <p className="text-xs mt-1">Create products in the &quot;Add Fee Products&quot; tab first.</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
                    {priceItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={e => setPriceItems(prev => prev.map((p, i) => i === idx ? {...p, selected: e.target.checked, price: e.target.checked ? p.price : ''} : p))}
                          className="w-4 h-4 text-orange-500 rounded"
                        />
                        <span className="flex-1 text-sm font-semibold text-slate-700">{item.name}</span>
                        {item.selected && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">₹</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={e => setPriceItems(prev => prev.map((p, i) => i === idx ? {...p, price: e.target.value} : p))}
                              className="w-24 border border-orange-200 rounded-lg px-2 py-1 text-sm font-mono outline-none focus:border-orange-400"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSubmitPriceBook}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)' }}
                >
                  🔥 Submit Price Book
                </button>
              </>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <a href="/dashboard/billing" className="text-white/80 text-sm font-semibold hover:text-white underline">
            ← Back to Fee Management
          </a>
        </div>
      </div>
    </div>
  );
}
