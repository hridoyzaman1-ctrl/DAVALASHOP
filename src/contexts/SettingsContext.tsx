import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

type Language = "en" | "bn";
type Currency = "taka";

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
  formatNumber: (num: number) => string;
  deliveryDhakaPrice: number;
  deliveryOutsideDhakaPrice: number;
  contactInfo: {
    addressLine1: string;
    addressLine2: string;
    phone: string;
    email: string;
    whatsapp: string;
    instagram: string;
    tiktok: string;
    facebook: string;
  };
  paymentSettings: {
    showBkash: boolean;
    bkashNumber: string;
    showNagad: boolean;
    nagadNumber: string;
    showBank: boolean;
    bankInfo: string;
    showCod: boolean;
  };
}

// Bengali digits for number formatting
const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// Convert number to Bengali digits
const toBengaliNumber = (num: number): string => {
  return num.toString().split('').map(digit => {
    if (digit === '.') return '.';
    if (digit === ',') return ',';
    const n = parseInt(digit);
    return isNaN(n) ? digit : bengaliDigits[n];
  }).join('');
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.shop": "Shop",
    "nav.new_in": "New in",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.favorites": "Favorites",
    "nav.cart": "Cart",
    "nav.admin": "Admin",
    "nav.admin_dashboard": "Admin Dashboard",

    // Hero
    "hero.tagline": "Discover premium beauty essentials curated for all women",
    "hero.shop_now": "Shop Now",
    "hero.elevate": "Elevate Your Everyday Radiance",

    // Product
    "product.new": "NEW",
    "product.add_to_cart": "Add to Cart",
    "product.swipe_hint": "Swipe to see more",
    "product.category": "Category",
    "product.description": "Description",
    "product.details": "Product Details",
    "product.care": "Care Instructions",
    "product.reviews": "Customer Reviews",
    "product.skincare": "Skincare",
    "product.makeup": "Makeup",
    "product.lips": "Lips",
    "product.eyes": "Eyes",
    "product.face": "Face",
    "product.no_products": "No products found",
    "product.general": "General",

    // Categories
    "category.skincare_collection": "Skincare Collection",
    "category.skincare_desc": "Luxurious formulas for radiant skin",
    "category.makeup_essentials": "Makeup Essentials",
    "category.makeup_desc": "Professional-grade beauty products",
    "category.radiant_essentials": "Radiant Essentials",
    "category.radiant_desc": "Premium skincare and makeup crafted for your natural glow",

    // Footer
    "footer.visit_us": "Visit Us",
    "footer.contact": "Contact",
    "footer.shop": "Shop",
    "footer.support": "Support",
    "footer.connect": "Connect",
    "footer.new_arrivals": "New Arrivals",
    "footer.skincare": "Skincare",
    "footer.makeup": "Makeup",
    "footer.lips": "Lips",
    "footer.face": "Face",
    "footer.shade_guide": "Shade Guide",
    "footer.ingredients": "Ingredients",
    "footer.returns": "Returns",
    "footer.shipping": "Shipping",
    "footer.newsletter": "Newsletter",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved",
    "footer.home_delivery": "Home Delivery Available",
    "footer.brand_tagline": "Premium cosmetics crafted for your natural radiance",

    // Shopping Bag
    "bag.title": "Shopping Bag",
    "bag.empty": "Your shopping bag is empty.",
    "bag.continue_shopping_hint": "Continue shopping to add items to your bag.",
    "bag.subtotal": "Subtotal",
    "bag.shipping_note": "Shipping and taxes calculated at checkout",
    "bag.checkout": "Proceed to Checkout",
    "bag.continue": "Continue Shopping",
    "bag.view_favorites": "View Favorites",
    "bag.your_favorites": "Your Favorites",
    "bag.no_favorites": "You haven't added any favorites yet. Browse our collection and click the heart icon to save products you love.",

    // Checkout
    "checkout.title": "Checkout",
    "checkout.order_summary": "Order Summary",
    "checkout.customer_details": "Customer Details",
    "checkout.shipping_address": "Shipping Address",
    "checkout.delivery_option": "Delivery Option",
    "checkout.delivery_dhaka": "Home Delivery (Inside Dhaka)",
    "checkout.delivery_outside": "Home Delivery (Outside Dhaka)",
    "checkout.pickup": "Store Pickup",
    "checkout.free": "Free",
    "checkout.payment": "Payment",
    "checkout.payment_method": "Payment Method",
    "checkout.cod": "Cash on Delivery",
    "checkout.cod_note": "Pay with cash upon delivery",
    "checkout.complete_order": "Complete Order",
    "checkout.subtotal": "Subtotal",
    "checkout.shipping": "Shipping",
    "checkout.total": "Total",
    "checkout.discount": "Discount code",
    "checkout.apply": "Apply",
    "checkout.email": "Email Address",
    "checkout.first_name": "First Name",
    "checkout.last_name": "Last Name",
    "checkout.phone": "Phone Number",
    "checkout.address": "Address",
    "checkout.city": "City",
    "checkout.postal": "Postal Code",
    "checkout.country": "Country",
    "checkout.need_help": "Need help with your order?",
    "checkout.whatsapp_help": "Contact us on WhatsApp for quick assistance",
    "checkout.chat_now": "Chat Now",
    "checkout.order_complete": "Order Complete!",
    "checkout.thank_you": "Thank you for your order",
    "checkout.order_number": "Order Number",
    "checkout.confirmation_sent": "We'll contact you on WhatsApp to confirm your order",
    "checkout.name": "Full Name",
    "checkout.notes": "Order Notes (Optional)",

    // About
    "about.title": "About",
    "about.our_story": "Our Story",
    "about.sustainability": "Sustainability",
    "about.size_guide": "Shade Guide",
    "about.customer_care": "Customer Care",
    "about.store_locator": "Store Locator",

    // Menu Items
    "menu.new_arrivals": "New Arrivals",
    "menu.bestsellers": "Bestsellers",
    "menu.limited_edition": "Limited Edition",
    "menu.gift_sets": "Gift Sets",
    "menu.travel_size": "Travel Size",
    "menu.our_story": "Our Story",
    "menu.sustainability": "Sustainability",
    "menu.ingredients": "Ingredients",
    "menu.customer_care": "Customer Care",

    // Search
    "search.placeholder": "Search for beauty products...",
    "search.products_placeholder": "Search products...",
    "search.popular": "Popular Searches",
    "search.vitamin_c": "Vitamin C Serum",
    "search.hydrating": "Hydrating Cream",
    "search.matte_lipstick": "Matte Lipstick",
    "search.foundation": "Foundation",
    "search.eye_cream": "Eye Cream",
    "search.retinol": "Retinol",
    "search.results": "Search Results",
    "search.no_results": "No products found for",

    // Editorial
    "editorial.title": "Quality Meets Curated Excellence",
    "editorial.description": "DAVALA is a premier e-commerce destination dedicated to bringing authentic, world-class products directly to you. Currently focusing on the finest skincare and cosmetics, we are rapidly expanding into a full lifestyle platform. Every product in our collection is chosen with a simple standard: uncompromising quality and proven results.",
    "editorial.cta": "Discover our mission",

    // General
    "general.home_delivery_available": "🚚 Home Delivery Available Nationwide",
    "general.discover_mission": "Discover our mission",
    "general.items": "items",
    "general.item": "item",
    "general.previous": "Previous",
    "general.next": "Next",
    "general.home": "Home",
    "general.sort_by": "Sort by",
    "general.filters": "Filters",

    // Delivery Banner
    "delivery.title": "Nationwide Home Delivery",
    "delivery.subtitle": "Fast & reliable shipping across Bangladesh",
    "delivery.inside_dhaka": "Inside Dhaka",
    "delivery.outside_dhaka": "Outside Dhaka",

    // Our Story
    "our_story.title": "Our Platform",
    "our_story.subtitle": "A premier e-commerce destination for premium skincare and lifestyle essentials in Bangladesh",
    "our_story.content_title": "Curating Excellence",
    "our_story.content": "DAVALA was established with a clear vision: to create a trusted, high-end e-commerce experience for the Bangladeshi market. Starting with our passion for authentic skincare, we've built a platform that prioritizes authenticity and customer delight. As we grow, DAVALA is evolving into a comprehensive lifestyle destination, bringing global standards to local shopping.",
    "our_story.choose_us": "Why Choose Us",
    "our_story.authentic_title": "100% Authentic Products",
    "our_story.authentic_desc": "We source all our products directly from authorized distributors and manufacturers. Every item you purchase from DAVALA is guaranteed authentic.",
    "our_story.curated_title": "Curated for Your Skin",
    "our_story.curated_desc": "Our team of skincare enthusiasts carefully selects each product based on effectiveness, ingredients, and suitability for the Bangladeshi climate.",
    "our_story.values_title": "Our Values",
    "our_story.authenticity": "Authenticity",
    "our_story.authenticity_desc": "Only genuine products from trusted brands. Your skin health is our priority.",
    "our_story.accessibility": "Accessibility",
    "our_story.accessibility_desc": "Premium skincare shouldn't cost a fortune. We offer competitive prices nationwide.",
    "our_story.care": "Care",
    "our_story.care_desc": "From personalized recommendations to fast delivery, we're here for your skincare journey.",

    // Sustainability
    "sustain.title": "Sustainability",
    "sustain.subtitle": "Clean beauty for you, a cleaner planet for everyone",
    "sustain.clean_beauty": "Our Clean Beauty Commitment",
    "sustain.eco_title": "Eco-Friendly Ingredients",
    "sustain.eco_desc": "We prioritize products that use sustainable, biodegradable ingredients. We actively avoid brands that use harmful chemicals like parabens and sulfates.",
    "sustain.cruelty_title": "Zero Cruelty",
    "sustain.cruelty_desc": "Authentic beauty never requires harm. We strictly partner with brands that are 100% cruelty-free.",
    "sustain.impact_goals": "Our Impact Goals",
    "sustain.packaging_title": "Sustainable Packaging",
    "sustain.refillable_title": "Refillable Options",
    "sustain.refillable_desc": "We are expanding our collection of refillable items to reduce single-use plastic waste.",
    "sustain.minimal_title": "Minimal Packing",
    "sustain.minimal_desc": "Our delivery boxes and fillers are made from recycled materials and are fully home-compostable.",
    "sustain.certifications": "Certifications",

    // Shade Guide
    "shade.title": "Shade Guide",
    "shade.subtitle": "Find your perfect match with our comprehensive beauty guide",
    "shade.undertone_title": "Determine Your Undertone",
    "shade.cool_title": "Cool (C)",
    "shade.cool_desc": "Your skin has hints of pink, red, or blue. You look best in silver jewelry.",
    "shade.warm_title": "Warm (W)",
    "shade.warm_desc": "Your skin has hints of yellow, peach, or gold. You look best in gold jewelry.",
    "shade.neutral_title": "Neutral (N)",
    "shade.neutral_desc": "Your skin has a mix of warm and cool tones. You look great in both silver and gold.",
    "shade.tone_table": "Skin Tone",
    "shade.range_table": "Shade Range",
    "shade.match_table": "Typical Match",
    "shade.lips_eyes": "Lipstick & Eye Shades",
    "shade.lipstick_finishes": "Lipstick Finishes",
    "shade.eye_textures": "Eyeshadow Textures",
    "shade.advice_title": "Need Personalized Advice?",
    "shade.advice_desc": "Unsure about your perfect shade? Our beauty consultants can help you find your match via WhatsApp!",
    "shade.upload_photo": "Upload My Photo",
    "shade.whatsapp_consult": "WhatsApp Consultation",

    // Store Locator
    "locator.title": "Store Locator",
    "locator.subtitle": "Visit us in person for a personalized beauty experience",
    "locator.map_title": "Interactive Store Map",
    "locator.locations": "Our Locations",
    "locator.services": "Available Services",
    "locator.directions": "Get Directions",
    "locator.appointment": "Book Appointment",
    "locator.consultation_title": "Beauty Consultations",
    "locator.consultation_desc": "Experience personalized service with a private beauty consultation.",
    "locator.virtual_title": "Virtual Consultations",
    "locator.virtual_desc": "Book a virtual consultation with one of our beauty experts via video call.",

    // Customer Care
    "care.title": "Customer Care",
    "care.subtitle": "We're here to help you with all your skincare needs",
    "care.contact_info": "Contact Information",
    "care.whatsapp_chat": "Chat on WhatsApp",
    "care.faq_title": "Frequently Asked Questions",
    "care.form_title": "Contact Form",
    "care.name": "Name",
    "care.phone": "Phone",
    "care.email": "Email",
    "care.order_number": "Order Number (Optional)",
    "care.help_message": "How can we help you?",
    "care.send": "Send Message",
    "care.faq.q1": "What are your delivery options?",
    "care.faq.a1": "We deliver all across Bangladesh! Inside Dhaka takes 1-2 days (৳80), while outside Dhaka takes 2-4 days (৳150).",
    "care.faq.q2": "What is your return policy?",
    "care.faq.a2": "We accept returns within 3 days for unopened, sealed products. Contact us via WhatsApp to initiate.",
    "care.faq.q3": "Are your products 100% authentic?",
    "care.faq.a3": "Yes! All products are 100% authentic and sourced directly from authorized distributors.",
    "care.faq.q4": "How do I find my foundation match?",
    "care.faq.a4": "Use our Shade Guide or contact us on WhatsApp for a personalized consultation with a photo in natural light.",
    "care.faq.q5": "Are your products safe for sensitive skin?",
    "care.faq.a5": "Many of our products are dermatologist-tested. Consult our experts via WhatsApp for specific recommendations.",
    "care.faq.q6": "Where are your products sourced from?",
    "care.faq.a6": "We source directly from authorized distributors in Korea, Japan, and the UK to ensure absolute authenticity.",
  },
  bn: {
    // Navigation
    "nav.shop": "দোকান",
    "nav.new_in": "নতুন",
    "nav.about": "সম্পর্কে",
    "nav.search": "খুঁজুন",
    "nav.favorites": "পছন্দসই",
    "nav.cart": "ব্যাগ",
    "nav.admin": "অ্যাডমিন",
    "nav.admin_dashboard": "অ্যাডমিন ড্যাশবোর্ড",

    // Hero
    "hero.tagline": "সকল নারীর জন্য প্রিমিয়াম বিউটি এসেনশিয়ালস",
    "hero.shop_now": "এখনই কিনুন",
    "hero.elevate": "আপনার প্রতিদিনের উজ্জ্বলতা বাড়ান",

    // Product
    "product.new": "নতুন",
    "product.add_to_cart": "ব্যাগে যোগ করুন",
    "product.swipe_hint": "আরো দেখতে সোয়াইপ করুন",
    "product.category": "বিভাগ",
    "product.description": "বিবরণ",
    "product.details": "পণ্যের বিবরণ",
    "product.care": "যত্নের নির্দেশনা",
    "product.reviews": "গ্রাহক মতামত",
    "product.skincare": "স্কিনকেয়ার",
    "product.makeup": "মেকআপ",
    "product.lips": "ঠোঁট",
    "product.eyes": "চোখ",
    "product.face": "মুখ",
    "product.no_products": "কোন পণ্য পাওয়া যায়নি",
    "product.general": "সাধারণ",

    // Categories
    "category.skincare_collection": "স্কিনকেয়ার কালেকশন",
    "category.skincare_desc": "উজ্জ্বল ত্বকের জন্য বিলাসবহুল ফর্মুলা",
    "category.makeup_essentials": "মেকআপ এসেনশিয়ালস",
    "category.makeup_desc": "পেশাদার মানের বিউটি পণ্য",
    "category.radiant_essentials": "রেডিয়েন্ট এসেনশিয়ালস",
    "category.radiant_desc": "আপনার প্রাকৃতিক উজ্জ্বলতার জন্য প্রিমিয়াম স্কিনকেয়ার এবং মেকআপ",

    // Footer
    "footer.visit_us": "আমাদের দেখুন",
    "footer.contact": "যোগাযোগ",
    "footer.shop": "দোকান",
    "footer.support": "সাপোর্ট",
    "footer.connect": "সংযুক্ত হন",
    "footer.new_arrivals": "নতুন পণ্য",
    "footer.skincare": "স্কিনকেয়ার",
    "footer.makeup": "মেকআপ",
    "footer.lips": "ঠোঁট",
    "footer.face": "মুখ",
    "footer.shade_guide": "শেড গাইড",
    "footer.ingredients": "উপাদান",
    "footer.returns": "রিটার্ন",
    "footer.shipping": "শিপিং",
    "footer.newsletter": "নিউজলেটার",
    "footer.privacy": "গোপনীয়তা নীতি",
    "footer.terms": "সেবার শর্তাবলী",
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত",
    "footer.home_delivery": "হোম ডেলিভারি পাওয়া যায়",
    "footer.brand_tagline": "আপনার প্রাকৃতিক উজ্জ্বলতার জন্য প্রিমিয়াম প্রসাধনী",

    // Shopping Bag
    "bag.title": "শপিং ব্যাগ",
    "bag.empty": "আপনার শপিং ব্যাগ খালি।",
    "bag.continue_shopping_hint": "পণ্য যোগ করতে শপিং চালিয়ে যান।",
    "bag.subtotal": "সাবটোটাল",
    "bag.shipping_note": "চেকআউটে শিপিং এবং ট্যাক্স হিসাব করা হবে",
    "bag.checkout": "চেকআউট করুন",
    "bag.continue": "শপিং চালিয়ে যান",
    "bag.view_favorites": "পছন্দসই দেখুন",
    "bag.your_favorites": "আপনার পছন্দসই",
    "bag.no_favorites": "আপনি এখনও কোনো পছন্দসই যোগ করেননি। আমাদের কালেকশন ব্রাউজ করুন এবং পছন্দের পণ্য সেভ করতে হার্ট আইকনে ক্লিক করুন।",

    // Checkout
    "checkout.title": "চেকআউট",
    "checkout.order_summary": "অর্ডার সারাংশ",
    "checkout.customer_details": "গ্রাহক বিবরণ",
    "checkout.shipping_address": "শিপিং ঠিকানা",
    "checkout.delivery_option": "ডেলিভারি অপশন",
    "checkout.delivery_dhaka": "হোম ডেলিভারি (ঢাকার ভিতরে)",
    "checkout.delivery_outside": "হোম ডেলিভারি (ঢাকার বাইরে)",
    "checkout.pickup": "স্টোর পিকআপ",
    "checkout.free": "বিনামূল্যে",
    "checkout.payment": "পেমেন্ট",
    "checkout.payment_method": "পেমেন্ট পদ্ধতি",
    "checkout.cod": "ক্যাশ অন ডেলিভারি",
    "checkout.cod_note": "ডেলিভারির সময় নগদ অর্থ প্রদান করুন",
    "checkout.complete_order": "অর্ডার সম্পন্ন করুন",
    "checkout.subtotal": "সাবটোটাল",
    "checkout.shipping": "শিপিং",
    "checkout.total": "মোট",
    "checkout.discount": "ডিসকাউন্ট কোড",
    "checkout.apply": "প্রয়োগ করুন",
    "checkout.email": "ইমেইল ঠিকানা",
    "checkout.first_name": "প্রথম নাম",
    "checkout.last_name": "শেষ নাম",
    "checkout.phone": "ফোন নম্বর",
    "checkout.address": "ঠিকানা",
    "checkout.city": "শহর",
    "checkout.postal": "পোস্টাল কোড",
    "checkout.country": "দেশ",
    "checkout.need_help": "আপনার অর্ডারে সাহায্য দরকার?",
    "checkout.whatsapp_help": "দ্রুত সহায়তার জন্য হোয়াটসঅ্যাপে যোগাযোগ করুন",
    "checkout.chat_now": "এখনই চ্যাট করুন",
    "checkout.order_complete": "অর্ডার সম্পন্ন!",
    "checkout.thank_you": "আপনার অর্ডারের জন্য ধন্যবাদ",
    "checkout.order_number": "অর্ডার নম্বর",
    "checkout.confirmation_sent": "আমরা আপনার অর্ডার নিশ্চিত করতে হোয়াটসঅ্যাপে যোগাযোগ করব",
    "checkout.name": "পুরো নাম",
    "checkout.notes": "অর্ডার নোট (ঐচ্ছিক)",

    // About
    "about.title": "সম্পর্কে",
    "about.our_story": "আমাদের গল্প",
    "about.sustainability": "টেকসই",
    "about.size_guide": "সাইজ গাইড",
    "about.customer_care": "গ্রাহক সেবা",
    "about.store_locator": "স্টোর লোকেটর",

    // Menu Items
    "menu.new_arrivals": "নতুন পণ্য",
    "menu.bestsellers": "বেস্টসেলার",
    "menu.limited_edition": "লিমিটেড এডিশন",
    "menu.gift_sets": "গিফট সেট",
    "menu.travel_size": "ট্রাভেল সাইজ",
    "menu.our_story": "আমাদের গল্প",
    "menu.sustainability": "টেকসই",
    "menu.ingredients": "উপাদান",
    "menu.customer_care": "গ্রাহক সেবা",

    // Search
    "search.placeholder": "বিউটি পণ্য খুঁজুন...",
    "search.products_placeholder": "পণ্য খুঁজুন...",
    "search.popular": "জনপ্রিয় অনুসন্ধান",
    "search.vitamin_c": "ভিটামিন সি সিরাম",
    "search.hydrating": "হাইড্রেটিং ক্রিম",
    "search.matte_lipstick": "ম্যাট লিপস্টিক",
    "search.foundation": "ফাউন্ডেশন",
    "search.eye_cream": "আই ক্রিম",
    "search.retinol": "রেটিনল",
    "search.results": "অনুসন্ধান ফলাফল",
    "search.no_results": "কোন পণ্য পাওয়া যায়নি",

    // Editorial
    "editorial.title": "গুণগত মান এবং কিউরেটেড শ্রেষ্ঠত্বের সমন্বয়",
    "editorial.description": "DAVALA একটি প্রিমিয়ার ই-কমার্স প্ল্যাটফর্ম যা সরাসরি আপনার কাছে আসল এবং বিশ্বমানের পণ্য পৌঁছে দেওয়ার জন্য নিবেদিত। বর্তমানে সেরা স্কিনকেয়ার এবং প্রসাধনীতে ফোকাস করার পাশাপাশি, আমরা দ্রুত একটি পূর্ণাঙ্গ লাইফস্টাইল প্ল্যাটফর্মে রূপান্তরিত হচ্ছি। আমাদের প্রতিটি পণ্য একটি সাধারণ মানদণ্ডে বেছে নেওয়া হয়: আপসহীন গুণমান এবং প্রমাণিত ফলাফল।",
    "editorial.cta": "আমাদের লক্ষ্য জানুন",

    // General
    "general.home_delivery_available": "🚚 সারাদেশে হোম ডেলিভারি পাওয়া যায়",
    "general.discover_mission": "আমাদের লক্ষ্য জানুন",
    "general.items": "টি পণ্য",
    "general.item": "টি পণ্য",
    "general.previous": "আগের",
    "general.next": "পরের",
    "general.home": "হোম",
    "general.sort_by": "সাজান",
    "general.filters": "ফিল্টার",

    // Delivery Banner
    "delivery.title": "সারাদেশে হোম ডেলিভারি",
    "delivery.subtitle": "সারা বাংলাদেশে দ্রুত ও নির্ভরযোগ্য শিপিং",
    "delivery.inside_dhaka": "ঢাকার ভিতরে",
    "delivery.outside_dhaka": "ঢাকার বাইরে",

    // Our Story
    "our_story.title": "আমাদের প্ল্যাটফর্ম",
    "our_story.subtitle": "বাংলাদেশে প্রিমিয়াম স্কিনকেয়ার এবং লাইফস্টাইল এসেনশিয়ালসের একটি প্রধান ই-কমার্স গন্তব্য",
    "our_story.content_title": "শ্রেষ্ঠত্বের কিউরেশন",
    "our_story.content": "DAVALA একটি স্পষ্ট ভিশন নিয়ে প্রতিষ্ঠিত হয়েছিল: বাংলাদেশী কাঙ্ক্ষিত গ্রাহকদের জন্য একটি বিশ্বস্ত, হাই-এন্ড ই-কমার্স অভিজ্ঞতা তৈরি করা। আসল স্কিনকেয়ারের প্রতি আমাদের আবেগ থেকে শুরু করে, আমরা এমন একটি প্ল্যাটফর্ম তৈরি করেছি যা নির্ভরযোগ্যতা এবং গ্রাহক সন্তুষ্টিকে অগ্রাধিকার দেয়। আমাদের প্রসারের সাথে সাথে, DAVALA একটি বিস্তৃত লাইফস্টাইল গন্তব্যে পরিণত হচ্ছে, যা স্থানীয় কেনাকাটায় বৈশ্বিক মান নিয়ে আসছে।",
    "our_story.choose_us": "কেন আমাদের বেছে নেবেন",
    "our_story.authentic_title": "১০০% খাঁটি পণ্য",
    "our_story.authentic_desc": "আমরা আমাদের সমস্ত পণ্য সরাসরি অনুমোদিত ডিস্ট্রিবিউটর এবং ম্যানুফ্যাকচারারদের কাছ থেকে সংগ্রহ করি। DAVALA থেকে আপনার কেনা প্রতিটি পণ্য খাঁটি হওয়ার গ্যারান্টিযুক্ত।",
    "our_story.curated_title": "আপনার ত্বকের জন্য কিউরেটেড",
    "our_story.curated_desc": "আমাদের স্কিনকেয়ার বিশেষজ্ঞ দল কার্যকারিতা, উপাদান এবং বাংলাদেশের আবহাওয়ার সাথে সামঞ্জস্যের ভিত্তিতে প্রতিটি পণ্য বেছে নেয়।",
    "our_story.values_title": "আমাদের মূল্যবোধ",
    "our_story.authenticity": "নির্ভরযোগ্যতা",
    "our_story.authenticity_desc": "বিশ্বস্ত ব্র্যান্ডের আসল পণ্য। আপনার ত্বকের স্বাস্থ্য আমাদের অগ্রাধিকার।",
    "our_story.accessibility": "সহজলভ্যতা",
    "our_story.accessibility_desc": "প্রিমিয়াম স্কিনকেয়ারের দাম খুব বেশি হওয়া উচিত নয়। আমরা সারাদেশে প্রতিযোগিতামূলক দাম অফার করি।",
    "our_story.care": "সেবা",
    "our_story.care_desc": "ব্যক্তিগত পরামর্শ থেকে শুরু করে দ্রুত ডেলিভারি পর্যন্ত, আমরা আপনার স্কিনকেয়ার যাত্রায় আপনার পাশে আছি।",

    // Sustainability
    "sustain.title": "টেকসই",
    "sustain.subtitle": "আপনার জন্য বিশুদ্ধ সৌন্দর্য, সবার জন্য একটি পরিচ্ছন্ন পৃথিবী",
    "sustain.clean_beauty": "আমাদের ক্লিন বিউটি অঙ্গীকার",
    "sustain.eco_title": "পরিবেশ বান্ধব উপাদান",
    "sustain.eco_desc": "আমরা টেকসই এবং বায়োডিগ্রেডেবল উপাদান ব্যবহার করে এমন পণ্যগুলোকে প্রাধান্য দেই। আমরা ক্ষতিকারক রাসায়নিকযুক্ত ব্র্যান্ডগুলো এড়িয়ে চলি।",
    "sustain.cruelty_title": "সম্পূর্ণ নিষ্ঠুরতা মুক্ত",
    "sustain.cruelty_desc": "প্রকৃত সৌন্দর্যের জন্য কখনোই ক্ষতির প্রয়োজন হয় না। আমরা ১০০% নিষ্ঠুরতা মুক্ত ব্র্যান্ডের সাথে অংশীদারিত্ব করি।",
    "sustain.impact_goals": "আমাদের প্রভাব লক্ষ্য",
    "sustain.packaging_title": "টেকসই প্যাকেজিং",
    "sustain.refillable_title": "রিফিলেবল অপশন",
    "sustain.refillable_desc": "আমরা একবার ব্যবহারযোগ্য প্লাস্টিক বর্জ্য কমাতে রিফিলেবল পণ্য বাড়িয়ে চলেছি।",
    "sustain.minimal_title": "ন্যূনতম প্যাকেজিং",
    "sustain.minimal_desc": "আমাদের ডেলিভারি বক্সগুলো রিসাইকেল করা উপাদান দিয়ে তৈরি এবং এগুলো বাসা-বাড়িতে পচনশীল।",
    "sustain.certifications": "সার্টিফিকেশন",

    // Shade Guide
    "shade.title": "শেড গাইড",
    "shade.subtitle": "আমাদের বিস্তৃত বিউটি গাইডের মাধ্যমে আপনার জন্য সঠিক পণ্যটি খুঁজে নিন",
    "shade.undertone_title": "আপনার আন্ডারটোন নির্ধারণ করুন",
    "shade.cool_title": "কুল (C)",
    "shade.cool_desc": "আপনার ত্বকে গোলাপী বা লালচে আভা আছে। আপনাকে রূপার গয়নায় সবচেয়ে ভালো দেখায়।",
    "shade.warm_title": "ওয়ার্ম (W)",
    "shade.warm_desc": "আপনার ত্বকে হলুদ বা সোনালি আভা আছে। আপনাকে সোনালি গয়নায় সবচেয়ে ভালো দেখায়।",
    "shade.neutral_title": "নিউট্রাল (N)",
    "shade.neutral_desc": "আপনার ত্বকে উষ্ণ এবং শীতল উভয় আভা আছে। আপনাকে রুপালি ও সোনালি উভয় গয়নাতেই মানায়।",
    "shade.tone_table": "ত্বকের টোন",
    "shade.range_table": "শেড লেভেল",
    "shade.match_table": "সাধারণ ম্যাচ",
    "shade.lips_eyes": "লিপস্টিক এবং চোখের শেড",
    "shade.lipstick_finishes": "লিপস্টিক ফিনিশ",
    "shade.eye_textures": "আইশ্যাডো টেক্সচার",
    "shade.advice_title": "ব্যক্তিগত পরামর্শ প্রয়োজন?",
    "shade.advice_desc": "আপনার নিখুঁত শেড সম্পর্কে নিশ্চিত নন? আমাদের বিউটি কনসালট্যান্টরা আপনাকে হোয়াটসঅ্যাপের মাধ্যমে সাহায্য করতে পারেন!",
    "shade.upload_photo": "আমার ছবি আপলোড করুন",
    "shade.whatsapp_consult": "হোয়াটসঅ্যাপ কনসালটেশন",

    // Store Locator
    "locator.title": "স্টোর লোকেটর",
    "locator.subtitle": "ব্যক্তিগত বিউটি অভিজ্ঞতার জন্য সরাসরি আমাদের স্টোর ভিজিট করুন",
    "locator.map_title": "ইন্টারেক্টিভ স্টোর ম্যাপ",
    "locator.locations": "আমাদের অবস্থান",
    "locator.services": "উপলভ্য সেবাসমূহ",
    "locator.directions": "দিকনির্দেশ পান",
    "locator.appointment": "অ্যাপয়েন্টমেন্ট নিন",
    "locator.consultation_title": "বিউটি কনসালটেশন",
    "locator.consultation_desc": "ব্যক্তিগত বিউটি কনসালটেশনের মাধ্যমে প্রিমিয়াম সেবা অনুভব করুন।",
    "locator.virtual_title": "ভার্চুয়াল কনসালটেশন",
    "locator.virtual_desc": "ভিডিও কলের মাধ্যমে আমাদের বিউটি বিশেষজ্ঞদের সাথে অনলাইন পরামর্শ নিন।",

    // Customer Care
    "care.title": "গ্রাহক সেবা",
    "care.subtitle": "আপনার সব স্কিনকেয়ার প্রয়োজনে আমরা আপনার পাশে আছি",
    "care.contact_info": "যোগাযোগের তথ্য",
    "care.whatsapp_chat": "হোয়াটসঅ্যাপে চ্যাট করুন",
    "care.faq_title": "সাধারণ জিজ্ঞাসা",
    "care.form_title": "যোগাযোগের ফর্ম",
    "care.name": "নাম",
    "care.phone": "ফোন",
    "care.email": "ইমেইল",
    "care.order_number": "অর্ডার নম্বর (ঐচ্ছিক)",
    "care.help_message": "আমরা আপনাকে কীভাবে সাহায্য করতে পারি?",
    "care.send": "মেসেজ পাঠান",
    "care.faq.q1": "আপনাদের ডেলিভারি অপশনগুলো কী কী?",
    "care.faq.a1": "আমরা সারা বাংলাদেশে ডেলিভারি করি! ঢাকার ভিতরে ১-২ দিন (৳৮০), এবং ঢাকার বাইরে ২-৪ দিন (৳১৫০) সময় লাগে।",
    "care.faq.q2": "আপনাদের রিটার্ন পলিসি কী?",
    "care.faq.a2": "আমরা অব্যবহৃত পণ্যের ক্ষেত্রে ৩ দিনের মধ্যে রিটার্ন গ্রহণ করি। বিস্তারিত জানতে হোয়াটসঅ্যাপ করুন।",
    "care.faq.q3": "আপনাদের পণ্যগুলো কি ১০০% খাঁটি?",
    "care.faq.a3": "হ্যাঁ! আমাদের সব পণ্য ১০০% খাঁটি এবং সরাসরি অনুমোদিত ডিস্ট্রিবিউটরদের কাছ থেকে সংগৃহীত।",
    "care.faq.q4": "আমি কীভাবে আমার ফাউন্ডেশন শেড খুঁজে পাব?",
    "care.faq.a4": "আমাদের শেড গাইড ব্যবহার করুন অথবা প্রাকৃতিক আলোতে একটি ছবি তুলে আমাদের হোয়াটসঅ্যাপে মেসেজ দিন।",
    "care.faq.q5": "আপনাদের পণ্যগুলো কি সংবেদনশীল ত্বকের জন্য নিরাপদ?",
    "care.faq.a5": "আমাদের অনেক পণ্য চর্মরোগ বিশেষজ্ঞ দ্বারা পরীক্ষিত। নির্দিষ্ট পরামর্শের জন্য হোয়াটসঅ্যাপে যোগাযোগ করুন।",
    "care.faq.q6": "আপনাদের পণ্যগুলো কোথা থেকে সংগ্রহ করা হয়?",
    "care.faq.a6": "আমরা সরাসরি কোরিয়া, জাপান এবং ইউকে-র অনুমোদিত ডিস্ট্রিবিউটরদের কাছ থেকে পণ্য সংগ্রহ করি।",
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");
  const { data: settings } = useSiteSettings();

  // Get setting value helper
  const getSetting = (key: string, defaultValue: string = "") => {
    return settings?.find(s => s.key === key)?.value || defaultValue;
  };

  const currency = (getSetting("currency", "taka") as Currency);
  const deliveryDhakaPrice = parseInt(getSetting("delivery_dhaka_price", "80"));
  const deliveryOutsideDhakaPrice = parseInt(getSetting("delivery_outside_dhaka_price", "150"));

  const contactInfo = {
    addressLine1: getSetting("address_line1", "Gulshan-2, Dhaka"),
    addressLine2: getSetting("address_line2", "Dhaka, Bangladesh"),
    phone: getSetting("phone", "+880 1234-567890"),
    email: getSetting("email", "hello@davala.beauty"),
    whatsapp: getSetting("whatsapp_number", "+880 1234-567890"),
    instagram: getSetting("instagram_url", "https://instagram.com/davala"),
    tiktok: getSetting("tiktok_url", "https://tiktok.com/@davala"),
    facebook: getSetting("facebook_url", "https://facebook.com/davala"),
  };

  const paymentSettings = {
    showBkash: getSetting("show_bkash", "false") === "true",
    bkashNumber: getSetting("bkash_number", ""),
    showNagad: getSetting("show_nagad", "false") === "true",
    nagadNumber: getSetting("nagad_number", ""),
    showBank: getSetting("show_bank", "false") === "true",
    bankInfo: getSetting("bank_info", ""),
    showCod: getSetting("show_cod", "false") === "true",
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Format number to Bengali digits if language is bn
  const formatNumber = (num: number): string => {
    if (language === 'bn') {
      return toBengaliNumber(num);
    }
    return num.toString();
  };

  const formatPrice = (price: number): string => {
    // Exact value, no conversion as requested
    const takaPrice = Math.round(price);

    if (language === 'bn') {
      return `৳${toBengaliNumber(takaPrice)}`;
    }
    return `৳${takaPrice.toLocaleString()}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        t,
        formatPrice,
        formatNumber,
        deliveryDhakaPrice,
        deliveryOutsideDhakaPrice,
        contactInfo,
        paymentSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
