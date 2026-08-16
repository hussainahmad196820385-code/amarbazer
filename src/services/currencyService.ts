// Multi-Currency & Global Exchange Service

export interface CurrencyOption {
  code: string;
  name: string;
  nameBn: string;
  symbol: string;
  flag: string;
  country: string;
  countryBn: string;
  rateAgainstBDT: number; // Multiply BDT by this to get target currency
  rateAgainstBase: number; // 1 Target Currency = this many BDT
  symbolPosition: 'prefix' | 'suffix';
  decimalPlaces: number;
  category: 'popular' | 'mideast' | 'southasia' | 'europe' | 'asia' | 'americas';
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  {
    code: 'BDT',
    name: 'Bangladeshi Taka',
    nameBn: 'বাংলাদেশী টাকা',
    symbol: '৳',
    flag: '🇧🇩',
    country: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
    rateAgainstBDT: 1,
    rateAgainstBase: 1,
    symbolPosition: 'prefix',
    decimalPlaces: 0,
    category: 'popular'
  },
  {
    code: 'AED',
    name: 'UAE Dirham (Dubai)',
    nameBn: 'সংযুক্ত আরব আমিরাত দিরহাম (দুবাই)',
    symbol: 'AED',
    flag: '🇦🇪',
    country: 'United Arab Emirates / Dubai',
    countryBn: 'দুবাই ও সংযুক্ত আরব আমিরাত',
    rateAgainstBDT: 0.0308,
    rateAgainstBase: 32.47,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'mideast'
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    nameBn: 'সৌদি রিয়াল',
    symbol: 'SAR',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    countryBn: 'সৌদি আরব (মক্কা ও রিয়াদ)',
    rateAgainstBDT: 0.0315,
    rateAgainstBase: 31.75,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'mideast'
  },
  {
    code: 'QAR',
    name: 'Qatari Riyal',
    nameBn: 'কাতারি রিয়াল',
    symbol: 'QAR',
    flag: '🇶🇦',
    country: 'Qatar',
    countryBn: 'কাতার (দোহা)',
    rateAgainstBDT: 0.0306,
    rateAgainstBase: 32.68,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'mideast'
  },
  {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    nameBn: 'কুয়েতি দিনার',
    symbol: 'KWD',
    flag: '🇰🇼',
    country: 'Kuwait',
    countryBn: 'কুয়েত',
    rateAgainstBDT: 0.00257,
    rateAgainstBase: 389.10,
    symbolPosition: 'prefix',
    decimalPlaces: 3,
    category: 'mideast'
  },
  {
    code: 'OMR',
    name: 'Omani Rial',
    nameBn: 'ওমানি রিয়াল',
    symbol: 'OMR',
    flag: '🇴🇲',
    country: 'Oman',
    countryBn: 'ওমান (মাস্কাট)',
    rateAgainstBDT: 0.00323,
    rateAgainstBase: 309.60,
    symbolPosition: 'prefix',
    decimalPlaces: 3,
    category: 'mideast'
  },
  {
    code: 'BHD',
    name: 'Bahraini Dinar',
    nameBn: 'বাহরাইনি দিনার',
    symbol: 'BHD',
    flag: '🇧🇭',
    country: 'Bahrain',
    countryBn: 'বাহরাইন (মানামা)',
    rateAgainstBDT: 0.00316,
    rateAgainstBase: 316.45,
    symbolPosition: 'prefix',
    decimalPlaces: 3,
    category: 'mideast'
  },
  {
    code: 'USD',
    name: 'US Dollar',
    nameBn: 'মার্কিন ডলার',
    symbol: '$',
    flag: '🇺🇸',
    country: 'United States & Global',
    countryBn: 'যুক্তরাষ্ট্র ও আন্তর্জাতিক',
    rateAgainstBDT: 0.0084,
    rateAgainstBase: 119.05,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'popular'
  },
  {
    code: 'EUR',
    name: 'Euro',
    nameBn: 'ইউরো',
    symbol: '€',
    flag: '🇪🇺',
    country: 'European Union',
    countryBn: 'ইউরোপীয় ইউনিয়ন',
    rateAgainstBDT: 0.0077,
    rateAgainstBase: 129.87,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'europe'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    nameBn: 'ব্রিটিশ পাউন্ড',
    symbol: '£',
    flag: '🇬🇧',
    country: 'United Kingdom',
    countryBn: 'যুক্তরাজ্য (লন্ডন)',
    rateAgainstBDT: 0.0066,
    rateAgainstBase: 151.50,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'europe'
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    nameBn: 'ভারতীয় রুপি',
    symbol: '₹',
    flag: '🇮🇳',
    country: 'India',
    countryBn: 'ভারত',
    rateAgainstBDT: 0.704,
    rateAgainstBase: 1.42,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'southasia'
  },
  {
    code: 'NPR',
    name: 'Nepalese Rupee',
    nameBn: 'নেপালি রুপি',
    symbol: 'रू',
    flag: '🇳🇵',
    country: 'Nepal',
    countryBn: 'নেপাল (কাঠমান্ডু)',
    rateAgainstBDT: 1.124,
    rateAgainstBase: 0.89,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'southasia'
  },
  {
    code: 'BTN',
    name: 'Bhutanese Ngultrum',
    nameBn: 'ভুটানি নগুলট্রাম',
    symbol: 'Nu.',
    flag: '🇧🇹',
    country: 'Bhutan',
    countryBn: 'ভুটান (থিম্পু)',
    rateAgainstBDT: 0.704,
    rateAgainstBase: 1.42,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'southasia'
  },
  {
    code: 'PKR',
    name: 'Pakistani Rupee',
    nameBn: 'পাকিস্তানি রুপি',
    symbol: '₨',
    flag: '🇵🇰',
    country: 'Pakistan',
    countryBn: 'পাকিস্তান',
    rateAgainstBDT: 2.34,
    rateAgainstBase: 0.427,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'southasia'
  },
  {
    code: 'LKR',
    name: 'Sri Lankan Rupee',
    nameBn: 'শ্রীলঙ্কান রুপি',
    symbol: 'Rs',
    flag: '🇱🇰',
    country: 'Sri Lanka',
    countryBn: 'শ্রীলঙ্কা (কলম্বো)',
    rateAgainstBDT: 2.52,
    rateAgainstBase: 0.397,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'southasia'
  },
  {
    code: 'MVR',
    name: 'Maldivian Rufiyaa',
    nameBn: 'মালদ্বীপিয়ান রুফিয়া',
    symbol: 'Rf',
    flag: '🇲🇻',
    country: 'Maldives',
    countryBn: 'মালদ্বীপ (মালে)',
    rateAgainstBDT: 0.129,
    rateAgainstBase: 7.75,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'southasia'
  },
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    nameBn: 'মালয়েশিয়ান রিঙ্গিত',
    symbol: 'RM',
    flag: '🇲🇾',
    country: 'Malaysia',
    countryBn: 'মালয়েশিয়া (কুয়ালালামপুর)',
    rateAgainstBDT: 0.037,
    rateAgainstBase: 27.02,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'asia'
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    nameBn: 'সিঙ্গাপুর ডলার',
    symbol: 'S$',
    flag: '🇸🇬',
    country: 'Singapore',
    countryBn: 'সিঙ্গাপুর',
    rateAgainstBDT: 0.011,
    rateAgainstBase: 90.90,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'asia'
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    nameBn: 'কানাডিয়ান ডলার',
    symbol: 'C$',
    flag: '🇨🇦',
    country: 'Canada',
    countryBn: 'কানাডা',
    rateAgainstBDT: 0.0115,
    rateAgainstBase: 86.95,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'americas'
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    nameBn: 'অস্ট্রেলিয়ান ডলার',
    symbol: 'A$',
    flag: '🇦🇺',
    country: 'Australia',
    countryBn: 'অস্ট্রেলিয়া (সিডনি)',
    rateAgainstBDT: 0.0128,
    rateAgainstBase: 78.12,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'americas'
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    nameBn: 'জাপানি ইয়েন',
    symbol: '¥',
    flag: '🇯🇵',
    country: 'Japan',
    countryBn: 'জাপান (টোকিও)',
    rateAgainstBDT: 1.28,
    rateAgainstBase: 0.78,
    symbolPosition: 'prefix',
    decimalPlaces: 0,
    category: 'asia'
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    nameBn: 'চীনা ইউয়ান',
    symbol: '¥',
    flag: '🇨🇳',
    country: 'China',
    countryBn: 'চীন (বেইজিং)',
    rateAgainstBDT: 0.061,
    rateAgainstBase: 16.39,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'asia'
  },
  {
    code: 'TRY',
    name: 'Turkish Lira',
    nameBn: 'তুর্কি লিরা',
    symbol: '₺',
    flag: '🇹🇷',
    country: 'Turkey',
    countryBn: 'তুরস্ক (ইস্তাম্বুল)',
    rateAgainstBDT: 0.28,
    rateAgainstBase: 3.57,
    symbolPosition: 'prefix',
    decimalPlaces: 2,
    category: 'mideast'
  }
];

export function getCurrencyMeta(code: string): CurrencyOption {
  const found = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === (code || '').toUpperCase());
  return found || SUPPORTED_CURRENCIES[0]; // Default BDT
}

export function convertFromBDT(amountInBDT: number, targetCurrencyCode: string): number {
  if (!amountInBDT || isNaN(amountInBDT)) return 0;
  const meta = getCurrencyMeta(targetCurrencyCode);
  return amountInBDT * meta.rateAgainstBDT;
}

export function formatCurrencyAmount(
  amountInBDT: number, 
  currencyCode: string = 'BDT', 
  options?: { showCode?: boolean }
): string {
  const meta = getCurrencyMeta(currencyCode);
  const converted = convertFromBDT(amountInBDT, currencyCode);

  let formattedNumber = converted.toLocaleString(undefined, {
    minimumFractionDigits: meta.decimalPlaces > 0 ? (converted % 1 === 0 ? 0 : meta.decimalPlaces) : 0,
    maximumFractionDigits: meta.decimalPlaces
  });

  if (meta.code === 'BDT') {
    return `৳${formattedNumber}`;
  }

  if (meta.symbolPosition === 'prefix') {
    return `${meta.symbol} ${formattedNumber}`;
  } else {
    return `${formattedNumber} ${meta.symbol}`;
  }
}

export function applyLiveCurrency(currencyCode: string) {
  if (typeof window === 'undefined') return;
  const meta = getCurrencyMeta(currencyCode);
  localStorage.setItem('app_currency', meta.code);
  localStorage.setItem('app_currency_symbol', meta.symbol);
  
  // Trigger custom global event for live reactivity across all components
  window.dispatchEvent(new CustomEvent('app_currency_changed', { 
    detail: { currency: meta.code, meta } 
  }));
}
