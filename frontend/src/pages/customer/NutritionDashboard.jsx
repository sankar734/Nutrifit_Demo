import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Beef, 
  Wheat, 
  Scale, 
  ArrowRight, 
  Activity, 
  Plus, 
  Send, 
  Droplet, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  ChevronRight, 
  SlidersHorizontal, 
  RefreshCw, 
  Star, 
  X,
  User,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import FoodCard from '../../components/customer/FoodCard';
import Toast from '../../components/customer/Toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useToast } from '../../hooks/useToast';
import { aiApi, userApi } from '../../services/api';
import sampleFoods from '../../data/sampleFoods';

const NutritionDashboard = () => {
  const { user, updateLocalUser } = useAuth();
  const { addToCart } = useCart() || {};
  const { isMobileView } = useDeviceMode();
  const { message, showToast } = useToast();
  const navigate = useNavigate();

  // Mobile Top Tab: 'dashboard' vs 'chat'
  const [mobileTab, setMobileTab] = useState('dashboard'); // 'dashboard' | 'chat'

  // 1. User Physical Measurement Profile (Height, Weight, Age, Gender, Goal)
  const [profile, setProfile] = useState({
    weightKg: user?.healthProfile?.weightKg || 68,
    heightCm: user?.healthProfile?.heightCm || 172,
    age: user?.healthProfile?.age || 26,
    gender: user?.healthProfile?.gender || 'male',
    activityLevel: user?.healthProfile?.activityLevel || 'moderately_active',
    goal: user?.healthProfile?.goal || 'maintain', // 'lose_weight' | 'gain_muscle' | 'maintain' | 'manage_diabetes'
  });

  // 2. Computed Metrics (BMI, BMR, TDEE, Calorie Target, Macros)
  const computedMetrics = useMemo(() => {
    const hM = (Number(profile.heightCm) || 172) / 100;
    const w = Number(profile.weightKg) || 68;
    const a = Number(profile.age) || 26;
    const isMale = profile.gender === 'male';

    // BMI
    const bmiVal = Number((w / (hM * hM)).toFixed(1));
    let bmiCategory = 'Healthy Weight';
    let bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (bmiVal < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-amber-600 bg-amber-50 border-amber-200';
    } else if (bmiVal >= 25 && bmiVal < 30) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-orange-600 bg-orange-50 border-orange-200';
    } else if (bmiVal >= 30) {
      bmiCategory = 'Obese';
      bmiColor = 'text-rose-600 bg-rose-50 border-rose-200';
    }

    // Basal Metabolic Rate (Mifflin-St Jeor)
    const bmr = Math.round(
      10 * w + 6.25 * (hM * 100) - 5 * a + (isMale ? 5 : -161)
    );

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
    };
    const mult = activityMultipliers[profile.activityLevel] || 1.4;
    const tdee = Math.round(bmr * mult);

    // Goal calorie adjustment
    let targetCalories = tdee;
    if (profile.goal === 'lose_weight') {
      targetCalories = Math.round(tdee - 450); // Safe deficit
    } else if (profile.goal === 'gain_muscle') {
      targetCalories = Math.round(tdee + 350); // Surplus for muscle
    } else if (profile.goal === 'manage_diabetes') {
      targetCalories = Math.round(tdee - 200); // Balanced low GI
    }

    // Protein calculation
    let proteinGrams = Math.round(w * 1.6);
    if (profile.goal === 'gain_muscle') proteinGrams = Math.round(w * 2.0);
    if (profile.goal === 'lose_weight') proteinGrams = Math.round(w * 1.8);

    // Fats (approx 25-30% calories)
    const fatsGrams = Math.round((targetCalories * 0.25) / 9);

    // Remaining calories for carbs
    const carbCals = targetCalories - proteinGrams * 4 - fatsGrams * 9;
    const carbsGrams = Math.max(50, Math.round(carbCals / 4));

    return {
      bmi: bmiVal,
      bmiCategory,
      bmiColor,
      bmr,
      tdee,
      targetCalories: Math.max(1200, targetCalories),
      proteinGrams,
      carbsGrams,
      fatsGrams,
    };
  }, [profile]);

  // Daily target values mapped to UI
  const targetCalories = computedMetrics.targetCalories;
  const [consumedCalories, setConsumedCalories] = useState(1320);
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const progressPercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  // Active Macro Tab for exploration
  const [activeMacroTab, setActiveMacroTab] = useState('Calories');

  // Modals
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [quickMealName, setQuickMealName] = useState('');
  const [quickMealCals, setQuickMealCals] = useState(320);

  // 3. AI Food Recommendations based on computed metrics & goal
  // 3. AI Food Recommendations based on computed metrics & goal
  const defaultRecommendedFoods = useMemo(() => {
    return sampleFoods.map((f) => {
      let matchScore = 80;
      let reason = 'Balanced nutritional profile';

      if (profile.goal === 'lose_weight') {
        if (f.nutrition?.calories <= 320) {
          matchScore += 18;
          reason = `Low calorie (${f.nutrition.calories} kcal) with ${f.nutrition?.protein || 10}g protein to stay in deficit`;
        } else {
          matchScore -= 10;
        }
      } else if (profile.goal === 'gain_muscle') {
        if ((f.nutrition?.protein || 0) >= 18) {
          matchScore += 20;
          reason = `High protein powerhouse with ${f.nutrition.protein}g clean protein for muscle synthesis`;
        } else {
          matchScore -= 10;
        }
      } else if (profile.goal === 'manage_diabetes') {
        if (f.dietaryTags?.some((t) => t.toLowerCase().includes('diabetic')) || f.name.includes('Quinoa') || f.name.includes('Oats')) {
          matchScore += 20;
          reason = 'Low glycemic index, rich in soluble beta-glucan fiber to stabilize glucose';
        }
      } else {
        if (f.rating >= 4.6) {
          matchScore += 15;
          reason = `Top rated healthy homemade bowl with verified macros`;
        }
      }

      return {
        ...f,
        matchScore: Math.min(99, matchScore),
        recommendReason: reason,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [profile.goal]);

  // Dynamic side recommendations state (adapts when user asks in chat)
  const [customSideRecommendation, setCustomSideRecommendation] = useState(null);

  const displayedSideFoods = useMemo(() => {
    if (customSideRecommendation?.foods?.length) {
      return customSideRecommendation.foods;
    }
    return defaultRecommendedFoods;
  }, [customSideRecommendation, defaultRecommendedFoods]);

  // Client matcher for immediate dynamic query matching
  const matchClientFoods = (queryText) => {
    const lower = (queryText || '').toLowerCase();
    const wantsHighProtein = /protein|muscle|gym|bulk|lean|strength/i.test(lower) || profile.goal === 'gain_muscle';
    const wantsLowCalorie = /weight|loss|fat|deficit|calorie|light|diet|slim/i.test(lower) || profile.goal === 'lose_weight';
    const wantsDiabetic = /diabet|sugar|blood|glycemic|low\s*gi|insulin/i.test(lower) || profile.goal === 'manage_diabetes';
    const wantsBreakfast = /breakfast|morning|idli|dosa|oats|omelette|pongal/i.test(lower);
    const wantsDinner = /dinner|night|evening/i.test(lower);
    const wantsSalad = /salad|bowl|sprouts/i.test(lower);
    const wantsPureVeg = /pure\s*veg|vegetarian|without\s*meat|no\s*chicken/i.test(lower);
    const wantsNonVeg = /non\s*veg|chicken|fish|meat|poultry/i.test(lower);

    const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);

    const scored = sampleFoods.map((f) => {
      let score = 55;
      let reason = 'Balanced nutritional homemade meal';
      const nameLower = (f.name || '').toLowerCase();
      const tagsLower = (f.dietaryTags || f.tags || []).map((t) => t.toLowerCase()).join(' ');
      const descLower = (f.description || '').toLowerCase();

      for (const w of words) {
        if (nameLower.includes(w)) score += 35;
        else if (tagsLower.includes(w)) score += 20;
        else if (descLower.includes(w)) score += 10;
      }

      if (wantsHighProtein) {
        const p = f.nutrition?.protein || 0;
        if (p >= 30) {
          score += 45;
          reason = `High Protein Powerhouse (${p}g protein) for muscle recovery`;
        } else if (p >= 18) {
          score += 30;
          reason = `Rich in Lean Protein (${p}g protein) & clean calories`;
        }
      }

      if (wantsLowCalorie) {
        const cal = f.nutrition?.calories || 400;
        if (cal <= 250) {
          score += 40;
          reason = `Ultra Low Calorie (${cal} kcal) to sustain fat loss deficit`;
        } else if (cal <= 350) {
          score += 25;
          reason = `Calorie Deficit Friendly (${cal} kcal) with ${f.nutrition?.protein || 10}g protein`;
        }
      }

      if (wantsDiabetic) {
        if (f.suitableFor?.includes('diabetic_friendly') || tagsLower.includes('diabetic') || nameLower.includes('oats') || nameLower.includes('quinoa') || tagsLower.includes('fiber')) {
          score += 45;
          reason = 'Low GI & high soluble fiber to prevent glucose spikes';
        }
      }

      if (wantsBreakfast) {
        if (f.category === 'Breakfast' || tagsLower.includes('breakfast') || nameLower.includes('idli') || nameLower.includes('upma') || nameLower.includes('dosa') || nameLower.includes('omelette')) {
          score += 40;
          reason = 'Wholesome morning energizing breakfast with steady macros';
        }
      }

      if (wantsDinner) {
        if ((f.nutrition?.calories || 400) <= 380) {
          score += 30;
          reason = 'Light & easy-to-digest dinner meal for evening satiety';
        }
      }

      if (wantsSalad) {
        if (f.category === 'Salad & Bowls' || tagsLower.includes('salad') || tagsLower.includes('bowl') || nameLower.includes('salad') || nameLower.includes('bowl')) {
          score += 35;
          reason = 'Antioxidant & micronutrient-rich fresh garden bowl';
        }
      }

      if (wantsPureVeg) {
        if (f.isVeg) score += 25;
        else score -= 90;
      } else if (wantsNonVeg) {
        if (!f.isVeg) score += 30;
        else score -= 20;
      }

      score += Math.round((f.rating || 4.5) * 4);

      return {
        ...f,
        matchScore: Math.min(99, Math.max(65, score)),
        recommendReason: reason,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored;
  };

  // 4. AI Chat Log
  const [chatLog, setChatLog] = useState([
    {
      role: 'assistant',
      text: `Hello! 👋 I am your NutriChef AI Nutritionist.\nBased on your physical measurements (${profile.weightKg}kg, ${profile.heightCm}cm, BMI ${computedMetrics.bmi}), your daily target is ${computedMetrics.targetCalories} kcal with ${computedMetrics.proteinGrams}g Protein.\n\nHere are handpicked chef-curated meals for your goals. What would you like to eat or plan today?`,
      foods: defaultRecommendedFoods.slice(0, 2),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isAiTyping]);

  const renderFormattedText = (text, isUser) => {
    if (isUser) return text;
    const lines = (text || '').split('\n');
    return lines.map((line, idx) => {
      const isHeader = line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ');
      const cleanLine = isHeader ? line.replace(/^#+\s*/, '') : line;

      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isHeader) {
        return (
          <div key={idx} className="font-black text-slate-900 text-xs sm:text-[13px] pt-1.5 pb-0.5">
            {content}
          </div>
        );
      }

      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
            <span className="text-purple-600 font-bold shrink-0">•</span>
            <span>{content}</span>
          </div>
        );
      }

      return (
        <div key={idx} className={cleanLine.trim() === '' ? 'h-1.5' : ''}>
          {content}
        </div>
      );
    });
  };

  const handleAdd = async (food) => {
    const res = await addToCart?.(food._id, 1, food);
    if (res && res.success === false) {
      showToast(`⚠️ ${res.message}`);
    } else {
      showToast(`🛒 ${food.name} added to cart!`);
    }
  };

  const handleLogMeal = (e) => {
    e?.preventDefault();
    if (!quickMealCals) return;
    setConsumedCalories((prev) => prev + Number(quickMealCals));
    setShowLogModal(false);
    showToast(`🥗 Logged ${quickMealName || 'Meal'} (+${quickMealCals} kcal)!`);
    setQuickMealName('');
  };

  const handleSendChat = async (userMessage) => {
    const text = userMessage || chatInput.trim();
    if (!text) return;

    setChatLog((prev) => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsAiTyping(true);

    const clientMatches = matchClientFoods(text);
    const topFoods = clientMatches.slice(0, 4);

    try {
      // Call backend AI chat if available
      const { data } = await aiApi.chat(text);
      if (data?.data?.reply) {
        const backendFoods = data.data.recommendedFoods;
        const finalFoods = (backendFoods && backendFoods.length > 0)
          ? backendFoods.map((bf) => {
              const matchedSample = sampleFoods.find((sf) => sf.name === bf.name || sf._id === bf._id);
              return {
                ...bf,
                images: bf.images?.length ? bf.images : matchedSample?.images,
                price: bf.price || matchedSample?.price || 199,
                discountPrice: bf.discountPrice || matchedSample?.discountPrice || bf.price,
              };
            })
          : topFoods;

        setChatLog((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            text: data.data.reply, 
            foods: finalFoods 
          }
        ]);

        // Dynamically update side recommendations with the matching foods
        setCustomSideRecommendation({
          query: text,
          foods: finalFoods,
        });

        setIsAiTyping(false);
        return;
      }
    } catch {
      // Intelligent fallback recommendation based on user request & current measurements
    }

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('weight') || lower.includes('fat') || lower.includes('diet') || lower.includes('loss')) {
        reply = `For your weight loss goal (${profile.weightKg}kg → target ${computedMetrics.targetCalories} kcal), focus on calorie-deficit meals high in fiber!\n\n⭐ Top Picks: Sprouts and Corn Salad (190 kcal • 11g protein), Chickpea Protein Bowl (380 kcal • 18g protein), and Steamed Vegetable Momos (180 kcal). They keep you full for 4+ hours and avoid glucose spikes!`;
      } else if (lower.includes('protein') || lower.includes('muscle') || lower.includes('gym')) {
        reply = `To hit your ${computedMetrics.proteinGrams}g daily protein target for muscle gain, I recommend:\n\n1. Chicken Tikka Bowl (38g protein • 430 kcal)\n2. Grilled Chicken Breast (42g protein • 380 kcal)\n3. Paneer Quinoa Bowl (26g protein • 420 kcal)\n\nAll freshly cooked in small hygienic batches with low oil!`;
      } else if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('blood')) {
        reply = `For diabetic-safe eating, prioritize complex carbohydrates with high soluble fiber!\n\nI recommend Vegetable Oats Upma, Multigrain Chapati with Vegetable Curry, or Chickpea Protein Bowl. Both prevent insulin spikes and provide steady energy!`;
      } else if (lower.includes('dinner') || lower.includes('night')) {
        reply = `For a light healthy dinner under 400 kcal, try the Paneer Quinoa Bowl (420 kcal • 26g protein) or Sprouts and Corn Salad (190 kcal). Eating lighter in the evening boosts fat burning while you sleep!`;
      } else if (lower.includes('breakfast') || lower.includes('morning')) {
        reply = `Start your morning with slow-burning complex carbs and clean protein! I recommend our Mini Idli with Sambar (240 kcal • 9g protein) or Vegetable Oats Upma for steady all-morning stamina!`;
      } else {
        reply = `Great question! With your current BMR of ${computedMetrics.bmr} kcal and daily TDEE of ${computedMetrics.tdee} kcal, you have ${remainingCalories} kcal left today.\n\nHere are top chef-prepared dishes tailored directly to what you asked:`;
      }

      setChatLog((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          text: reply, 
          foods: topFoods 
        }
      ]);

      // Dynamically update side recommendation section
      setCustomSideRecommendation({
        query: text,
        foods: topFoods,
      });

      setIsAiTyping(false);
    }, 600);
  };

  const quickPrompts = [
    '🔥 High protein meals for muscle gain',
    '🥗 Low calorie dinner under 350 kcal',
    '🩸 Diabetic friendly meal options',
    '🥑 How much protein should I eat daily?',
  ];

  return (
    <MobileLayout fullWidth={!isMobileView}>
      <Toast message={message} />

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW LAYOUT (Sidebar + Dashboard + AI Chat)                    */}
      {/* ========================================================================= */}
      {!isMobileView ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <DesktopSidebar activeItem="nutrition" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* Header with Title and Measure Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Nutrition Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Personalized AI diet planner & smart macro calculator
                  </p>
                </div>

                {/* Edit Physical Stats Button */}
                <button
                  type="button"
                  onClick={() => setShowMeasureModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-black transition border border-purple-200"
                >
                  <Scale size={16} />
                  <span>Update Body Stats ({profile.weightKg}kg • {profile.heightCm}cm)</span>
                </button>
              </div>

              {/* Grid: Main Dashboard (7 cols) + AI Chat Assistant (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                
                {/* 1.1 LEFT MAIN COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* AI Diet Planner Summary Banner */}
                  <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 shrink-0">
                        🤖
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black">AI Diet Planner</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${computedMetrics.bmiColor}`}>
                            BMI {computedMetrics.bmi} · {computedMetrics.bmiCategory}
                          </span>
                        </div>
                        <p className="text-xs text-purple-200">
                          Target: <span className="font-bold text-white">{computedMetrics.targetCalories} kcal</span> · Protein: <span className="font-bold text-white">{computedMetrics.proteinGrams}g</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMeasureModal(true)}
                      className="px-4 py-2 rounded-xl bg-white text-purple-700 font-black text-xs shadow-md transition active:scale-95 hover:bg-purple-50"
                    >
                      Recalculate
                    </button>
                  </div>

                  {/* Macro Tabs (Calories, Protein, Carbs, Fats) */}
                  <div className="flex items-center gap-2">
                    {['Calories', 'Protein', 'Carbs', 'Fats'].map((tab) => {
                      const isActive = activeMacroTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveMacroTab(tab)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* 4 Daily Nutrition Goal Boxes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">
                        Your Daily Nutrition Goals
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowMeasureModal(true)}
                        className="text-xs font-bold text-purple-700 hover:underline"
                      >
                        Edit Stats
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs text-center space-y-1">
                        <Flame size={20} className="text-amber-500 mx-auto" />
                        <p className="text-base font-black text-slate-900">{computedMetrics.targetCalories}</p>
                        <p className="text-[11px] font-semibold text-slate-400">Calories</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs text-center space-y-1">
                        <Beef size={20} className="text-purple-600 mx-auto" />
                        <p className="text-base font-black text-slate-900">{computedMetrics.proteinGrams}g</p>
                        <p className="text-[11px] font-semibold text-slate-400">Protein</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs text-center space-y-1">
                        <Wheat size={20} className="text-emerald-600 mx-auto" />
                        <p className="text-base font-black text-slate-900">{computedMetrics.carbsGrams}g</p>
                        <p className="text-[11px] font-semibold text-slate-400">Carbs</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs text-center space-y-1">
                        <Droplet size={20} className="text-blue-500 mx-auto" />
                        <p className="text-base font-black text-slate-900">{computedMetrics.fatsGrams}g</p>
                        <p className="text-[11px] font-semibold text-slate-400">Fats</p>
                      </div>
                    </div>
                  </div>

                  {/* Today's Progress Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">
                        Today's Progress
                      </h3>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {progressPercent}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{consumedCalories} Consumed</span>
                      <span className="text-slate-400">{remainingCalories} Remaining</span>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowLogModal(true)}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
                      >
                        Log Meal
                      </button>
                    </div>
                  </div>

                  {/* PERSONALIZED FOOD RECOMMENDATIONS SECTION (DYNAMIC) */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <span>{customSideRecommendation ? '✨ AI Recommended Dishes (Live Chat Match)' : 'AI Recommended Dishes For You'}</span>
                          <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {customSideRecommendation ? 'CHAT ADAPTED' : profile.goal.replace('_', ' ')}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {customSideRecommendation
                            ? `Dynamically updated based on: "${customSideRecommendation.query}"`
                            : `Handpicked meals tailored to your ${profile.weightKg}kg target and ${computedMetrics.targetCalories} kcal budget`}
                        </p>
                      </div>

                      {customSideRecommendation && (
                        <button
                          type="button"
                          onClick={() => setCustomSideRecommendation(null)}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition active:scale-95 flex items-center gap-1.5 shrink-0"
                          title="Reset to your profile goals"
                        >
                          <RefreshCw size={12} />
                          <span>Reset to My Goals</span>
                        </button>
                      )}
                    </div>

                    {/* Recommendations Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {displayedSideFoods.slice(0, 4).map((f) => (
                        <div
                          key={f._id}
                          onClick={() => navigate(`/food/${f._id}`)}
                          className="bg-white rounded-2xl border border-slate-100 p-3 shadow-2xs hover:shadow-md transition space-y-2.5 group cursor-pointer"
                        >
                          <div className="flex gap-3 items-center">
                            <img
                              src={f.images?.[0] || '/food-images/grilled-chicken-breast-1.jpg'}
                              alt={f.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition duration-300"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-purple-700 transition">
                                  {f.name}
                                </h4>
                                {f.matchScore && (
                                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                                    {f.matchScore}%
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {f.nutrition?.calories} kcal • {f.nutrition?.protein}g Protein
                              </p>
                              <p className="text-xs font-black text-purple-700 mt-0.5">
                                ₹{f.discountPrice || f.price}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdd(f);
                              }}
                              className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs active:scale-90"
                              title="Add to Cart"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* AI Match Reason Banner */}
                          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2 text-[10px] font-semibold text-purple-900 leading-tight">
                            ✨ {f.recommendReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 1.2 RIGHT COLUMN: AI NUTRITIONIST CHAT ASSISTANT (DESKTOP) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden flex flex-col h-[650px] sticky top-28">
                  
                  {/* Chat Header */}
                  <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                        🤖
                      </div>
                      <div>
                        <h4 className="text-sm font-black">NutriChef AI Dietitian</h4>
                        <p className="text-[10px] text-purple-200 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Online · Powered by Groq & Gemini</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Prompts Strip */}
                  <div className="p-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto hide-scrollbar flex gap-2">
                    {quickPrompts.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChat(q)}
                        className="text-[10px] font-bold px-3 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition shrink-0 whitespace-nowrap active:scale-95"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Chat Messages Log */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                    {chatLog.map((c, i) => (
                      <div
                        key={i}
                        className={`text-xs rounded-2xl p-3.5 leading-relaxed ${
                          c.role === 'user'
                            ? 'bg-purple-600 text-white ml-auto shadow-xs rounded-br-xs max-w-[85%]'
                            : 'bg-white text-slate-800 border border-slate-100 shadow-2xs rounded-bl-xs max-w-[95%] space-y-3'
                        }`}
                      >
                        <div>{renderFormattedText(c.text, c.role === 'user')}</div>

                        {/* Interactive Recommended Food Cards inside Chat */}
                        {c.foods && c.foods.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-purple-100/90 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-[11px] font-black text-purple-900">
                                <Sparkles size={13} className="text-purple-600 animate-pulse" />
                                <span>Recommended Dishes ({c.foods.length})</span>
                              </span>
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                Tap to View & Order
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                              {c.foods.map((food) => (
                                <div
                                  key={food._id}
                                  onClick={() => navigate(`/food/${food._id}`)}
                                  className="bg-purple-50/40 hover:bg-white rounded-xl p-2.5 border border-purple-100/90 hover:border-purple-300 shadow-2xs hover:shadow-md transition cursor-pointer flex items-center justify-between gap-2.5 group"
                                >
                                  {/* Food thumbnail with veg badge */}
                                  <div className="relative w-13 h-13 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                    <img
                                      src={food.images?.[0] || '/food-images/grilled-chicken-breast-1.jpg'}
                                      alt={food.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute top-1 left-1 bg-white/95 backdrop-blur-xs p-0.5 rounded-xs shadow-2xs">
                                      <span
                                        className={`w-2 h-2 border rounded-xs flex items-center justify-center ${
                                          food.isVeg ? 'border-emerald-600' : 'border-rose-600'
                                        }`}
                                      >
                                        <span className={`w-1 h-1 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                      </span>
                                    </div>
                                  </div>

                                  {/* Food info */}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-[11px] font-black text-slate-900 truncate group-hover:text-purple-700 transition">
                                      {food.name}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate">
                                      {food.nutrition?.calories || 320} kcal • {food.nutrition?.protein || 12}g Prot
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs font-black text-purple-800">
                                        ₹{food.discountPrice || food.price}
                                      </span>
                                      {food.matchScore && (
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                                          {food.matchScore}% Match
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick Add Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAdd(food);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs active:scale-90 transition"
                                    title="Add to Cart"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="bg-white text-slate-500 rounded-2xl p-3 text-xs border border-slate-100 inline-flex items-center gap-2 shadow-2xs">
                        <RefreshCw size={13} className="animate-spin text-purple-600" />
                        <span>AI Dietitian is analyzing your meals...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input Form */}
                  <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask diet question (e.g., 'What can I eat for dinner?')..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isAiTyping}
                      className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 active:scale-90 disabled:opacity-40 transition"
                    >
                      <Send size={15} />
                    </button>
                  </form>

                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (With Mobile AI Chat & Body Measurement)             */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
          
          {/* 2.1 TITLE & TOP SEGMENTED SWITCHER (Dashboard vs AI Chat) */}
          <div className="pt-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  Nutrition Hub
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  AI diet planner & macro calculator
                </p>
              </div>

              {/* Edit Measurements Button */}
              <button
                type="button"
                onClick={() => setShowMeasureModal(true)}
                className="p-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center gap-1 border border-purple-200"
              >
                <Scale size={16} />
                <span>{profile.weightKg}kg</span>
              </button>
            </div>

            {/* Mobile View Toggle: [📊 My Nutrition] | [💬 AI Dietitian Chat] */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setMobileTab('dashboard')}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  mobileTab === 'dashboard'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity size={14} />
                <span>My Diet & Goals</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('chat')}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 relative ${
                  mobileTab === 'chat'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare size={14} />
                <span>AI Dietitian Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-2 right-4" />
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* MOBILE TAB A: DASHBOARD VIEW                                            */}
          {/* ======================================================================= */}
          {mobileTab === 'dashboard' ? (
            <div className="space-y-4">
              
              {/* 2.2 AI DIET PLANNER CARD */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black">AI Diet Planner</h3>
                      <span className="text-[9px] font-bold bg-white/20 px-2 py-0.2 rounded-full">
                        BMI {computedMetrics.bmi}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-200 leading-tight">
                      {computedMetrics.targetCalories} kcal target · {computedMetrics.proteinGrams}g Protein
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMeasureModal(true)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 active:scale-90"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* 2.3 MACRO TABS (Calories, Protein, Carbs, Fats) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {['Calories', 'Protein', 'Carbs', 'Fats'].map((tab) => {
                  const isActive = activeMacroTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveMacroTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* 2.4 YOUR DAILY NUTRITION GOALS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    Your Daily Nutrition Goals
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMeasureModal(true)}
                    className="text-xs font-bold text-purple-700 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* 4 Goal Cards in a 4-column row */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-2xs text-center">
                    <Flame size={18} className="text-amber-500 mx-auto mb-1" />
                    <p className="text-sm font-black text-slate-900">{computedMetrics.targetCalories}</p>
                    <p className="text-[10px] font-semibold text-slate-400">Calories</p>
                  </div>

                  <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-2xs text-center">
                    <Beef size={18} className="text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-black text-slate-900">{computedMetrics.proteinGrams}g</p>
                    <p className="text-[10px] font-semibold text-slate-400">Protein</p>
                  </div>

                  <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-2xs text-center">
                    <Wheat size={18} className="text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-black text-slate-900">{computedMetrics.carbsGrams}g</p>
                    <p className="text-[10px] font-semibold text-slate-400">Carbs</p>
                  </div>

                  <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-2xs text-center">
                    <Droplet size={18} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-sm font-black text-slate-900">{computedMetrics.fatsGrams}g</p>
                    <p className="text-[10px] font-semibold text-slate-400">Fats</p>
                  </div>
                </div>
              </div>

              {/* 2.5 TODAY'S PROGRESS */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    Today's Progress
                  </h3>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-0.5">
                  <span>{consumedCalories} Consumed</span>
                  <span className="text-slate-400">{remainingCalories} Remaining</span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(true)}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
                  >
                    Log Meal
                  </button>
                </div>
              </div>

              {/* 2.6 PERSONALIZED FOOD RECOMMENDATIONS (MOBILE DYNAMIC) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {customSideRecommendation ? '✨ AI Recommended Dishes' : 'Recommended For Your Body'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                      {customSideRecommendation ? `Matched: "${customSideRecommendation.query}"` : profile.goal.replace('_', ' ')}
                    </p>
                  </div>

                  {customSideRecommendation ? (
                    <button
                      type="button"
                      onClick={() => setCustomSideRecommendation(null)}
                      className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200"
                    >
                      Reset
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {profile.goal.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {displayedSideFoods.slice(0, 4).map((f) => (
                    <div
                      key={f._id}
                      onClick={() => navigate(`/food/${f._id}`)}
                      className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <img
                        src={f.images?.[0] || '/food-images/grilled-chicken-breast-1.jpg'}
                        alt={f.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {f.name}
                          </h4>
                          {f.matchScore && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md shrink-0">
                              {f.matchScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {f.nutrition?.calories} kcal • {f.nutrition?.protein}g Protein
                        </p>
                        <p className="text-[10px] text-emerald-700 font-bold truncate mt-0.5">
                          ✨ {f.recommendReason}
                        </p>
                        <p className="text-xs font-black text-slate-900 pt-0.5">
                          ₹{f.discountPrice || f.price}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(f);
                        }}
                        className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm active:scale-90"
                        title="Add to Cart"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (

            /* ======================================================================= */
            /* MOBILE TAB B: AI NUTRITIONIST CHAT INTERFACE                            */
            /* ======================================================================= */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg flex flex-col h-[520px] overflow-hidden">
              
              {/* Mobile Chat Header */}
              <div className="p-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-xs font-black">NutriChef AI Dietitian</h3>
                  <p className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online · Powered by Groq & Gemini</span>
                  </p>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(q)}
                    className="text-[10px] font-bold px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 shrink-0 whitespace-nowrap active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
                {chatLog.map((c, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-2xl p-3 leading-relaxed ${
                      c.role === 'user'
                        ? 'bg-purple-600 text-white ml-auto shadow-xs rounded-br-xs max-w-[85%]'
                        : 'bg-white text-slate-800 border border-slate-100 shadow-2xs rounded-bl-xs max-w-[95%] space-y-2.5'
                    }`}
                  >
                    <div>{renderFormattedText(c.text, c.role === 'user')}</div>

                    {/* Mobile Food Cards directly inside chat bubble */}
                    {c.foods && c.foods.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-purple-100 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                          <span className="flex items-center gap-1">
                            <Sparkles size={11} className="text-purple-600 animate-pulse" />
                            <span>Recommended Meals</span>
                          </span>
                          <span className="text-purple-600">Tap to order</span>
                        </div>

                        <div className="space-y-1.5">
                          {c.foods.map((food) => (
                            <div
                              key={food._id}
                              onClick={() => navigate(`/food/${food._id}`)}
                              className="bg-purple-50/50 hover:bg-white rounded-xl p-2 border border-purple-100/90 flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <img
                                src={food.images?.[0] || '/food-images/grilled-chicken-breast-1.jpg'}
                                alt={food.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[11px] font-black text-slate-900 truncate">
                                  {food.name}
                                </h5>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {food.nutrition?.calories} kcal • {food.nutrition?.protein}g Prot
                                </p>
                                <span className="text-xs font-black text-purple-800">
                                  ₹{food.discountPrice || food.price}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdd(food);
                                }}
                                className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs active:scale-90"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isAiTyping && (
                  <div className="bg-white text-slate-500 rounded-2xl p-2.5 text-xs border border-slate-100 inline-flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin text-purple-600" />
                    <span>Analyzing your nutrition request...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask: 'What can I eat for 400 kcal dinner?'..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-purple-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiTyping}
                  className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs active:scale-90 disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </form>

            </div>
          )}

        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. MEASUREMENT TUNER MODAL (Weight, Height, Age, Goal)                  */}
      {/* ======================================================================= */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale size={20} className="text-purple-600" />
                <h3 className="text-base font-black text-slate-900">Your Body Measurements</h3>
              </div>
              <button onClick={() => setShowMeasureModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weightKg}
                    onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-800 focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.heightCm}
                    onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-800 focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-purple-600 outline-none bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Activity Level</label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-purple-600 outline-none bg-white"
                >
                  <option value="sedentary">🛋️ Sedentary (Little or no exercise)</option>
                  <option value="lightly_active">🚶 Lightly Active (1-3 days/wk)</option>
                  <option value="moderately_active">🏃 Moderately Active (3-5 days/wk)</option>
                  <option value="very_active">⚡ Very Active (6-7 days heavy workout)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Health & Nutrition Goal</label>
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-purple-600 outline-none bg-white"
                >
                  <option value="lose_weight">🔥 Weight Loss (Calorie Deficit)</option>
                  <option value="gain_muscle">💪 Muscle Gain (High Protein)</option>
                  <option value="maintain">⚖️ Maintenance & Clean Eating</option>
                  <option value="manage_diabetes">🩸 Diabetic Friendly & Low Glycemic</option>
                </select>
              </div>

              {/* Live Computed Preview */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600">Calculated BMI</span>
                  <p className="font-black text-slate-900">{computedMetrics.bmi} ({computedMetrics.bmiCategory})</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-purple-600">New Target</span>
                  <p className="font-black text-purple-700">{computedMetrics.targetCalories} kcal / {computedMetrics.proteinGrams}g Protein</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMeasureModal(false);
                  showToast('🎯 Profile & food recommendations updated!');
                }}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
              >
                Apply & Recommend Dishes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. LOG MEAL MODAL                                                       */}
      {/* ======================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Log Consumed Meal</h3>
            <form onSubmit={handleLogMeal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meal / Dish Name</label>
                <input
                  type="text"
                  placeholder="e.g. Berry Oats Bowl, Chicken Biryani"
                  value={quickMealName}
                  onChange={(e) => setQuickMealName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={quickMealCals}
                  onChange={(e) => setQuickMealCals(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </MobileLayout>
  );
};

export default NutritionDashboard;
