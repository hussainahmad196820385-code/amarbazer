// Multi-Language Localization and Live Auto-Translation Service
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  isRTL?: boolean;
  category: 'popular' | 'regional' | 'europe' | 'asia' | 'mideast';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    region: 'বাংলাদেশ ও পশ্চিমবঙ্গ',
    category: 'popular'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    region: 'Global / International',
    category: 'popular'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'भारत / South Asia',
    category: 'regional'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    region: 'الشرق الأوسط / Middle East',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    region: 'South Asia / Middle East',
    isRTL: true,
    category: 'regional'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    region: 'España & Latinoamérica',
    category: 'europe'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    region: 'France & Francophonie',
    category: 'europe'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'Deutschland & Österreich',
    category: 'europe'
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    region: '中国 / East Asia',
    category: 'asia'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    region: '日本 / East Asia',
    category: 'asia'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    region: '대한민국 / East Asia',
    category: 'asia'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    region: 'Brasil & Portugal',
    category: 'europe'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    region: 'Россия & CIS',
    category: 'europe'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    region: 'Türkiye',
    category: 'mideast'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    region: 'Indonesia / Southeast Asia',
    category: 'asia'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'Italia & Europe',
    category: 'europe'
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    region: 'Malaysia & Singapore',
    category: 'asia'
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ภาษาไทย',
    flag: '🇹🇭',
    region: 'ประเทศไทย / Southeast Asia',
    category: 'asia'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    region: 'Việt Nam / Southeast Asia',
    category: 'asia'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    region: 'தமிழ்நாடு & Sri Lanka',
    category: 'regional'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ',
    category: 'regional'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    region: 'महाराष्ट्र / India',
    category: 'regional'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    region: 'ગુજરાત / India',
    category: 'regional'
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    region: 'नेपाल (Nepal) & হিমালয়',
    category: 'regional'
  },
  {
    code: 'dz',
    name: 'Dzongkha (Bhutanese)',
    nativeName: 'རྫོང་ཁ',
    flag: '🇧🇹',
    region: 'འབྲུག་ཡུལ་ (Bhutan)',
    category: 'regional'
  },
  {
    code: 'ar_ae',
    name: 'Arabic (UAE / Dubai)',
    nativeName: 'العربية (الإمارات / دبي)',
    flag: '🇦🇪',
    region: 'United Arab Emirates / Dubai',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'ar_sa',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (المملكة العربية السعودية)',
    flag: '🇸🇦',
    region: 'Saudi Arabia / Riyadh & Makkah',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'ar_qa',
    name: 'Arabic (Qatar)',
    nativeName: 'العربية (قطر)',
    flag: '🇶🇦',
    region: 'Qatar / Doha',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'ar_kw',
    name: 'Arabic (Kuwait)',
    nativeName: 'العربية (الكويت)',
    flag: '🇰🇼',
    region: 'Kuwait / Kuwait City',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'ar_om',
    name: 'Arabic (Oman)',
    nativeName: 'العربية (عُمان)',
    flag: '🇴🇲',
    region: 'Sultanate of Oman / Muscat',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'ar_bh',
    name: 'Arabic (Bahrain)',
    nativeName: 'العربية (البحرين)',
    flag: '🇧🇭',
    region: 'Kingdom of Bahrain / Manama',
    isRTL: true,
    category: 'mideast'
  },
  {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🇱🇰',
    region: 'ශ්‍රී ලංකා (Sri Lanka)',
    category: 'regional'
  },
  {
    code: 'dv',
    name: 'Dhivehi (Maldivian)',
    nativeName: 'ދިވެހި',
    flag: '🇲🇻',
    region: 'ދިވެހިރާއްޖެ (Maldives)',
    isRTL: true,
    category: 'regional'
  },
  {
    code: 'my',
    name: 'Burmese (Myanmar)',
    nativeName: 'မြန်မာစာ',
    flag: '🇲🇲',
    region: 'Myanmar / Southeast Asia',
    category: 'asia'
  },
  {
    code: 'km',
    name: 'Khmer (Cambodian)',
    nativeName: 'ភាសាខ្មែរ',
    flag: '🇰🇭',
    region: 'Cambodia / Southeast Asia',
    category: 'asia'
  },
  {
    code: 'fil',
    name: 'Filipino / Tagalog',
    nativeName: 'Wikang Filipino',
    flag: '🇵🇭',
    region: 'Pilipinas / Philippines',
    category: 'asia'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    region: 'Nederland & België',
    category: 'europe'
  },
  {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    region: 'Sverige / Scandinavia',
    category: 'europe'
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    region: 'Polska / Central Europe',
    category: 'europe'
  },
  {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    region: 'Ελλάδα / Greece',
    category: 'europe'
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇰🇪',
    region: 'East Africa / Kenya & Tanzania',
    category: 'regional'
  }
];

// Rich Multi-Language Vocabulary Dictionary for Core UI
export const DICTIONARY: Record<string, Record<string, string>> = {
  // Navigation & Tabs
  account_dashboard: {
    bn: 'অ্যাকাউন্ট ড্যাশবোর্ড',
    en: 'Account Dashboard',
    hi: 'अकाउंट डैशबोर्ड',
    ar: 'لوحة التحكم بالحساب',
    ur: 'اکاؤنٹ ڈیش بورڈ',
    es: 'Panel de Cuenta',
    fr: 'Tableau de Bord du Compte',
    de: 'Konto-Dashboard',
    zh: '账户控制面板',
    ja: 'アカウントダッシュボード',
    ko: '계정 대시보드',
    pt: 'Painel da Conta',
    ru: 'Панель учетной записи',
    tr: 'Hesap Paneli',
    id: 'Dasbor Akun',
    it: 'Pannello Account'
  },
  profile_kyc: {
    bn: 'আমার প্রোফাইল ও কেওয়াইসি',
    en: 'My Profile & KYC',
    hi: 'मेरी प्रोफाइल और केवाईसी',
    ar: 'ملفي الشخصي والتحقق',
    ur: 'میری پروفائل اور کے وائی سی',
    es: 'Mi Perfil y KYC',
    fr: 'Mon Profil & KYC',
    de: 'Mein Profil & KYC',
    zh: '我的个人资料与认证',
    ja: 'プロフィールとKYC',
    ko: '내 프로필 및 KYC',
    pt: 'Meu Perfil e KYC',
    ru: 'Мой профиль и KYC',
    tr: 'Profilim ve KYC',
    id: 'Profil Saya & KYC',
    it: 'Il Mio Profilo e KYC'
  },
  saved_addresses: {
    bn: 'সংরক্ষিত ঠিকানা সমূহ',
    en: 'Saved Addresses',
    hi: 'सहेजे गए पते',
    ar: 'العناوين المحفوظة',
    ur: 'محفوظ شدہ پتے',
    es: 'Direcciones Guardadas',
    fr: 'Adresses Enregistrées',
    de: 'Gespeicherte Adressen',
    zh: '已保存的地址',
    ja: '保存された住所',
    ko: '저장된 배송지',
    pt: 'Endereços Salvos',
    ru: 'Сохраненные адреса',
    tr: 'Kayıtlı Adresler',
    id: 'Alamat Tersimpan',
    it: 'Indirizzi Salvati'
  },
  orders_tracking: {
    bn: 'আমার অর্ডার ও ট্র্যাকিং',
    en: 'My Orders & Tracking',
    hi: 'मेरे ऑर्डर और ट्रैकिंग',
    ar: 'طلباتي والتتبع',
    ur: 'میرے آرڈرز اور ٹریکنگ',
    es: 'Mis Pedidos y Seguimiento',
    fr: 'Mes Commandes & Suivi',
    de: 'Meine Bestellungen & Tracking',
    zh: '我的订单与追踪',
    ja: '注文履歴と追跡',
    ko: '내 주문 및 배송조회',
    pt: 'Meus Pedidos e Rastreamento',
    ru: 'Мои заказы и отслеживание',
    tr: 'Siparişlerim ve Takip',
    id: 'Pesanan & Pelacakan Saya',
    it: 'I Miei Ordini e Tracciamento'
  },
  wishlist: {
    bn: 'পছন্দের তালিকা',
    en: 'Wishlist',
    hi: 'पसंदीदा सूची',
    ar: 'قائمة الرغبات',
    ur: 'خواہشات کی فہرست',
    es: 'Lista de Deseos',
    fr: 'Liste d\'Envies',
    de: 'Wunschliste',
    zh: '心愿单',
    ja: 'お気に入り',
    ko: '위시리스트',
    pt: 'Lista de Desejos',
    ru: 'Список желаний',
    tr: 'İstek Listesi',
    id: 'Daftar Keinginan',
    it: 'Lista dei Desideri'
  },
  wallet_points: {
    bn: 'ওয়ালেট ও রিওয়ার্ড পয়েন্টস',
    en: 'My Wallet & Points',
    hi: 'मेरा वॉलेट और रिवॉर्ड पॉइंट्स',
    ar: 'محفظتي ونقاط المكافآت',
    ur: 'میرا والیٹ اور انعامی پوائنٹس',
    es: 'Mi Billetera y Puntos',
    fr: 'Mon Portefeuille & Points',
    de: 'Meine Geldbörse & Punkte',
    zh: '我的钱包与积分',
    ja: 'ウォレットとポイント',
    ko: '내 지갑 및 포인트',
    pt: 'Minha Carteira e Pontos',
    ru: 'Мой кошелек и баллы',
    tr: 'Cüzdanım ve Puanlar',
    id: 'Dompet & Poin Saya',
    it: 'Il Mio Portafoglio e Punti'
  },
  coupons_vouchers: {
    bn: 'কুপন ও ভাউচার',
    en: 'Coupons & Vouchers',
    hi: 'कूपन और वाउचर',
    ar: 'القسائم والتخفيضات',
    ur: 'کوپن اور واؤچر',
    es: 'Cupones y Vales',
    fr: 'Coupons et Bons',
    de: 'Gutscheine & Rabatte',
    zh: '优惠券与礼券',
    ja: 'クーポンとバウチャー',
    ko: '쿠폰 및 바우처',
    pt: 'Cupons e Vouchers',
    ru: 'Купоны и ваучеры',
    tr: 'Kuponlar ve Hediye Çekleri',
    id: 'Kupon & Voucher',
    it: 'Coupon e Buoni'
  },
  support_tickets: {
    bn: 'সাপোর্ট টিকেট ও চ্যাট',
    en: 'Support Tickets & Chat',
    hi: 'सपोर्ट टिकट और चैट',
    ar: 'تذاكر الدعم والدردشة',
    ur: 'سپورٹ ٹکٹس اور چیٹ',
    es: 'Tickets de Soporte y Chat',
    fr: 'Tickets d\'Assistance & Chat',
    de: 'Support-Tickets & Chat',
    zh: '客服工单与在线聊天',
    ja: 'サポートチケット＆チャット',
    ko: '고객지원 티켓 및 상담',
    pt: 'Tickets de Suporte e Chat',
    ru: 'Тикеты поддержки и чат',
    tr: 'Destek Talepleri ve Sohbet',
    id: 'Tiket Bantuan & Chat',
    it: 'Ticket di Supporto e Chat'
  },
  language_settings: {
    bn: 'ভাষা ও লোকালাইজেশন',
    en: 'Language & Localization',
    hi: 'भाषा और स्थानीयकरण',
    ar: 'اللغة والتعريب',
    ur: 'زبان اور لوکلائزیشن',
    es: 'Idioma y Localización',
    fr: 'Langue & Localisation',
    de: 'Sprache & Lokalisierung',
    zh: '语言与本地化设置',
    ja: '言語とローカライゼーション',
    ko: '언어 및 지역 설정',
    pt: 'Idioma e Localização',
    ru: 'Язык и локализация',
    tr: 'Dil ve Yerelleştirme',
    id: 'Bahasa & Lokalisasi',
    it: 'Lingua e Localizzazione'
  },
  roles_permissions: {
    bn: 'রোল ও পারমিশন',
    en: 'Roles & Permissions',
    hi: 'भूमिकाएं और अनुमतियां',
    ar: 'الأدوار والصلاحيات',
    ur: 'کردار اور اجازتیں',
    es: 'Roles y Permisos',
    fr: 'Rôles & Autorisations',
    de: 'Rollen & Berechtigungen',
    zh: '角色与权限管理',
    ja: 'ロールと権限',
    ko: '역할 및 권한 관리',
    pt: 'Funções e Permissões',
    ru: 'Роли и разрешения',
    tr: 'Roller ve İzinler',
    id: 'Peran & Izin',
    it: 'Ruoli e Autorizzazioni'
  },
  account_security: {
    bn: 'অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড',
    en: 'Account Security & Password',
    hi: 'अकाउंट सुरक्षा और पासवर्ड',
    ar: 'أمان الحساب وكلمة المرور',
    ur: 'اکاؤنٹ کی حفاظت اور پاس ورڈ',
    es: 'Seguridad y Contraseña',
    fr: 'Sécurité du Compte & Mot de Passe',
    de: 'Kontosicherheit & Passwort',
    zh: '账户安全与密码',
    ja: 'アカウントセキュリティとパスワード',
    ko: '계정 보안 및 비밀번호',
    pt: 'Segurança da Conta e Senha',
    ru: 'Безопасность учетной записи',
    tr: 'Hesap Güvenliği ve Şifre',
    id: 'Keamanan Akun & Kata Sandi',
    it: 'Sicurezza Account e Password'
  },
  // Store & Shopping Actions
  search_placeholder: {
    bn: 'কাঁচাবাজার ও পণ্য খুঁজুন...',
    en: 'Search groceries & products...',
    hi: 'किराना और उत्पाद खोजें...',
    ar: 'ابحث عن البقالة والمنتجات...',
    ur: 'اشیاء اور گروسری تلاش کریں...',
    es: 'Buscar productos y compras...',
    fr: 'Rechercher des produits...',
    de: 'Produkte suchen...',
    zh: '搜索生鲜百货与商品...',
    ja: '商品や食料品を検索...',
    ko: '식료품 및 상품 검색...',
    pt: 'Buscar produtos e mercado...',
    ru: 'Поиск продуктов и товаров...',
    tr: 'Ürün ve market ara...',
    id: 'Cari produk & kebutuhan...',
    it: 'Cerca prodotti e alimentari...'
  },
  buy_now: {
    bn: 'এখনই কিনুন',
    en: 'Buy Now',
    hi: 'अभी खरीदें',
    ar: 'اشترِ الآن',
    ur: 'ابھی خریدیں',
    es: 'Comprar Ahora',
    fr: 'Acheter Maintenant',
    de: 'Jetzt Kaufen',
    zh: '立即购买',
    ja: '今すぐ購入',
    ko: '바로 구매',
    pt: 'Comprar Agora',
    ru: 'Купить сейчас',
    tr: 'Hemen Satın Al',
    id: 'Beli Sekarang',
    it: 'Acquista Ora'
  },
  add_to_cart: {
    bn: 'কার্টে যোগ করুন',
    en: 'Add to Cart',
    hi: 'कार्ट में जोड़ें',
    ar: 'أضف إلى السلة',
    ur: 'کارٹ میں شامل کریں',
    es: 'Añadir al Carrito',
    fr: 'Ajouter au Panier',
    de: 'In den Warenkorb',
    zh: '加入购物车',
    ja: 'カートに追加',
    ko: '장바구니 담기',
    pt: 'Adicionar ao Carrinho',
    ru: 'В корзину',
    tr: 'Sepete Ekle',
    id: 'Tambah ke Keranjang',
    it: 'Aggiungi al Carrello'
  },
  cart: {
    bn: 'ঝুড়ি (কার্ট)',
    en: 'Cart',
    hi: 'कार्ट',
    ar: 'عربة التسوق',
    ur: 'کارٹ',
    es: 'Carrito',
    fr: 'Panier',
    de: 'Warenkorb',
    zh: '购物车',
    ja: 'ショッピングカート',
    ko: '장바구니',
    pt: 'Carrinho',
    ru: 'Корзина',
    tr: 'Sepet',
    id: 'Keranjang',
    it: 'Carrello'
  },
  checkout: {
    bn: 'চেকআউট করুন',
    en: 'Proceed to Checkout',
    hi: 'चेकआउट करें',
    ar: 'إتمام الطلب',
    ur: 'چیک آؤٹ کریں',
    es: 'Proceder al Pago',
    fr: 'Passer la Commande',
    de: 'Zur Kasse',
    zh: '结算订单',
    ja: 'お会計へ進む',
    ko: '주문 결제하기',
    pt: 'Finalizar Compra',
    ru: 'Оформить заказ',
    tr: 'Ödemeye Geç',
    id: 'Lanjut ke Pembayaran',
    it: 'Procedi al Pagamento'
  },
  total: {
    bn: 'মোট মূল্য',
    en: 'Total Amount',
    hi: 'कुल राशि',
    ar: 'المبلغ الإجمالي',
    ur: 'کل رقم',
    es: 'Monto Total',
    fr: 'Montant Total',
    de: 'Gesamtbetrag',
    zh: '总金额',
    ja: '合計金額',
    ko: '총 결제금액',
    pt: 'Valor Total',
    ru: 'Итого',
    tr: 'Toplam Tutar',
    id: 'Total Pembayaran',
    it: 'Importo Totale'
  }
};

export function getTranslation(key: string, lang: string, fallback?: string): string {
  if (DICTIONARY[key] && DICTIONARY[key][lang]) {
    return DICTIONARY[key][lang];
  }
  if (DICTIONARY[key] && DICTIONARY[key]['en']) {
    return DICTIONARY[key]['en'];
  }
  return fallback || key;
}

export function getLanguageMeta(code: string): LanguageOption {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return found || {
    code,
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
    flag: '🌐',
    region: 'International',
    category: 'popular'
  };
}

/**
 * Applies live DOM translation and document direction (LTR/RTL)
 */
export function applyLiveLanguage(langCode: string) {
  if (typeof window === 'undefined') return;

  const langMeta = getLanguageMeta(langCode);
  document.documentElement.lang = langCode;
  
  // Set RTL direction if Arabic/Urdu/Hebrew
  if (langMeta.isRTL) {
    document.documentElement.dir = 'rtl';
    document.body.classList.add('rtl-layout');
  } else {
    document.documentElement.dir = 'ltr';
    document.body.classList.remove('rtl-layout');
  }

  // Save to localStorage
  localStorage.setItem('language', langCode);
  localStorage.setItem('language_name', langMeta.nativeName);

  // Trigger custom global event for live reactivity across all components
  window.dispatchEvent(new CustomEvent('app_language_changed', { 
    detail: { language: langCode, meta: langMeta } 
  }));

  // Trigger Google Translate engine element if available
  try {
    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event('change'));
    }
  } catch (e) {
    // Non-blocking
  }
}
