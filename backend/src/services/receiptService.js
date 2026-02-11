const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { getTierMultiplier, calculateTier } = require('../utils/tiers');
const { createNotification } = require('../utils/notify');

const generateReceiptHash = (qrData) => {
  return crypto.createHash('sha256').update(qrData).digest('hex');
};

const fetchReceipt = async (qrUrl) => {
  try {
    const pageResponse = await fetch(qrUrl);
    const html = await pageResponse.text();

    const invoiceMatch = html.match(/InvoiceNumber\(['"]([^'"]+)['"]\)/);
    const tokenMatch = html.match(/Token\(['"]([^'"]+)['"]\)/);

    if (!invoiceMatch || !tokenMatch) {
      throw new Error('Could not extract receipt identifiers');
    }

    const invoiceNumber = invoiceMatch[1];
    const token = tokenMatch[1];
    console.log(`InvoiceNumber: ${invoiceNumber}, Token: ${token}`);

    // Detect store name from HTML
    let storeName = '';
    const storeNames = ['LIDL', 'MAXI', 'IDEA', 'RODA', 'UNIVEREXPORT', 'AMAN', 'DIS', 'TEMPO', 'MERCATOR', 'GOMEX'];
    for (const name of storeNames) {
      if (html.toUpperCase().includes(name)) {
        storeName = name.charAt(0) + name.slice(1).toLowerCase();
        break;
      }
    }

    // Extract PIB from HTML
    let storeFiscalId = '';
    const pibMatch = html.match(/(\d{9})/);
    if (pibMatch) storeFiscalId = pibMatch[1];

    // Extract store location from HTML
    let storeLocation = '';
    const decoded = html.replace(/&#x([0-9A-Fa-f]+);/g, (m, code) => String.fromCharCode(parseInt(code, 16)));

    // Cyrillic to Latin mapping for Serbian cities
    const cyrillicToLatin = {
      'Белград': 'Beograd', 'Нови Сад': 'Novi Sad', 'Ниш': 'Niš',
      'Суботица': 'Subotica', 'Крагујевац': 'Kragujevac', 'Зрењанин': 'Zrenjanin',
      'Панчево': 'Pančevo', 'Чачак': 'Čačak', 'Нови Пазар': 'Novi Pazar',
      'Краљево': 'Kraljevo', 'Смедерево': 'Smederevo', 'Лесковац': 'Leskovac',
      'Ужице': 'Užice', 'Ваљево': 'Valjevo', 'Крушевац': 'Kruševac',
      'Врање': 'Vranje', 'Шабац': 'Šabac', 'Сомбор': 'Sombor',
      'Пожаревац': 'Požarevac', 'Пирот': 'Pirot', 'Зајечар': 'Zaječar',
      'Кикинда': 'Kikinda', 'Сремска Митровица': 'Sremska Mitrovica',
      'Јагодина': 'Jagodina', 'Вршац': 'Vršac', 'Бор': 'Bor',
      'Прокупље': 'Prokuplje', 'Лозница': 'Loznica', 'Кањижа': 'Kanjiža',
      'Сента': 'Senta', 'Ада': 'Ada', 'Бачка Топола': 'Bačka Topola',
    };

    // Latin city names to match
    const latinCities = ['Beograd', 'Novi Sad', 'Niš', 'Nis', 'Kragujevac', 'Subotica', 'Zrenjanin',
      'Pančevo', 'Pancevo', 'Čačak', 'Cacak', 'Novi Pazar', 'Kraljevo', 'Smederevo',
      'Leskovac', 'Užice', 'Uzice', 'Valjevo', 'Kruševac', 'Krusevac', 'Vranje',
      'Šabac', 'Sabac', 'Sombor', 'Požarevac', 'Pozarevac', 'Pirot', 'Zaječar', 'Zajecar',
      'Kikinda', 'Sremska Mitrovica', 'Jagodina', 'Vršac', 'Vrsac', 'Bor', 'Prokuplje',
      'Loznica', 'Kanjiža', 'Kanjiza', 'Senta', 'Ada', 'Bačka Topola', 'Backa Topola'];

    // All searchable names: Latin + Cyrillic, sorted longest-first to prefer specific matches
    const allCities = [...new Set([...latinCities, ...Object.keys(cyrillicToLatin)])]
      .sort((a, b) => b.length - a.length);

    for (const city of allCities) {
      // Use word boundary matching to avoid short names (Ada, Bor, Niš) matching inside other words
      const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,.:;/\\-])${escaped}(?:$|[\\s,.:;/\\-])`, 'i');
      if (regex.test(decoded) || regex.test(html)) {
        storeLocation = cyrillicToLatin[city] || city;
        break;
      }
    }

    // Call specifications endpoint for items
    const items = [];
    try {
      console.log('Calling POST /specifications...');
      const specResponse = await fetch('https://suf.purs.gov.rs/specifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: `invoiceNumber=${encodeURIComponent(invoiceNumber)}&token=${encodeURIComponent(token)}`,
      });

      const specData = await specResponse.json();
      console.log('Specifications response:', JSON.stringify(specData, null, 2));

      if (specData && specData.success && specData.items) {
        for (const item of specData.items) {
          items.push({
            name: item.name || 'Unknown',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            price: item.total || 0,
            gtin: item.gtin || '',
            label: item.label || '',
          });
        }
      }
    } catch (specErr) {
      console.error('Specifications call failed:', specErr.message);
    }

    const receiptData = {
      storeName: storeName || 'Unknown Store',
      storeFiscalId: storeFiscalId || `UNKNOWN-${Date.now()}`,
      storeLocation: storeLocation || null,
      date: new Date().toISOString(),
      items,
    };

    console.log('\n===== FINAL PARSED =====');
    console.log(JSON.stringify(receiptData, null, 2));
    console.log('===== END =====\n');

    return receiptData;
  } catch (error) {
    console.error('Fetch receipt error:', error);
    throw new Error('Failed to fetch receipt from fiscal service');
  }
};

const matchProducts = async (items) => {
  const matched = [];
  const unmatched = [];

  // Preload all known products for reverse keyword matching
  const knownProducts = await prisma.product.findMany({
    where: { status: 'KNOWN' },
  });

  // Normalize Serbian diacritics for fuzzy comparison
  const normalize = (str) => str.toLowerCase()
    .replace(/č/g, 'c').replace(/ć/g, 'c')
    .replace(/š/g, 's').replace(/ž/g, 'z')
    .replace(/đ/g, 'dj');

  // Extract meaningful keywords (skip short words, numbers, units)
  const extractKeywords = (name) => {
    return normalize(name)
      .split(/\s+/)
      .filter(w => w.length >= 3 && !/^\d+([.,/]\d+)?(%|g|kg|l|ml|kom|din|rsd)?$/i.test(w));
  };

  // Pre-compute keywords for each known product
  const productKeywordsMap = knownProducts.map(p => ({
    product: p,
    keywords: extractKeywords(p.name),
  }));

  for (const item of items) {
    const words = item.name.split(/\s+/);

    // --- Strategy 1: Original DB query matching (full name, first word, first two words) ---
    const searchTerms = [item.name];
    if (words.length > 1) {
      searchTerms.push(words[0]);
      searchTerms.push(words.slice(0, 2).join(' '));
    }

    let product = null;
    for (const term of searchTerms) {
      product = await prisma.product.findFirst({
        where: {
          OR: [
            { identifier: { equals: term, mode: 'insensitive' } },
            { name: { equals: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { identifier: { contains: term, mode: 'insensitive' } },
          ],
          status: 'KNOWN',
        },
      });
      if (product) break;
    }

    // --- Strategy 2: Reverse keyword matching ---
    // Check if ALL keywords from a known product appear in the receipt item name.
    // Handles cases like receipt "PREMIA MLEKO SVEŽE 2.8% 1/1" matching product "Mleko 1L"
    // because keyword "mleko" from the product is found in the receipt item.
    // Also normalizes Serbian diacritics (č→c, š→s, etc.) for better matching.
    if (!product) {
      const itemKeywords = extractKeywords(item.name);
      let bestMatch = null;
      let bestScore = 0;

      for (const { product: p, keywords: pKeywords } of productKeywordsMap) {
        if (pKeywords.length === 0) continue;

        const matchCount = pKeywords.filter(pk =>
          itemKeywords.some(ik => ik === pk)
        ).length;

        // ALL product keywords must appear in the receipt item
        if (matchCount === pKeywords.length && matchCount > bestScore) {
          bestScore = matchCount;
          bestMatch = p;
        }
      }

      if (bestMatch) product = bestMatch;
    }

    if (product) {
      matched.push({
        ...item, productId: product.id, productName: product.name,
        pointsValue: product.pointsValue,
        totalPoints: product.pointsValue * (item.quantity || 1),
      });
    } else {
      unmatched.push({ ...item, productId: null, pointsValue: 0 });
    }
  }

  const totalPoints = matched.reduce((sum, item) => sum + item.totalPoints, 0);
  return { matched, unmatched, totalPoints };
};

const processReceipt = async (qrData, userId) => {
  const receiptHash = generateReceiptHash(qrData);
  const existing = await prisma.transaction.findUnique({ where: { receiptHash } });
  if (existing) throw new Error('DUPLICATE_RECEIPT');

  const receiptData = await fetchReceipt(qrData);

  let store = await prisma.store.findUnique({ where: { fiscalId: receiptData.storeFiscalId } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: receiptData.storeName,
        fiscalId: receiptData.storeFiscalId,
        location: receiptData.storeLocation,
      },
    });
  } else if (receiptData.storeLocation && !store.location) {
    store = await prisma.store.update({
      where: { id: store.id },
      data: { location: receiptData.storeLocation },
    });
  }

  const { matched, unmatched, totalPoints: basePoints } = await matchProducts(receiptData.items);

  // Get user's tier for multiplier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, totalPointsEarned: true },
  });

  const multiplier = getTierMultiplier(user?.tier || 'BRONZE');
  const totalPoints = Math.round(basePoints * multiplier);
  const tierBonusPoints = totalPoints - basePoints;

  const transaction = await prisma.transaction.create({
    data: { userId, storeId: store.id, receiptHash, totalPoints, items: { matched, unmatched } },
  });

  if (totalPoints > 0) {
    const newTotalEarned = (user?.totalPointsEarned || 0) + totalPoints;
    const oldTier = user?.tier || 'BRONZE';
    const newTier = calculateTier(newTotalEarned);

    await prisma.user.update({
      where: { id: userId },
      data: {
        pointsBalance: { increment: totalPoints },
        totalPointsEarned: { increment: totalPoints },
        ...(newTier !== oldTier && { tier: newTier }),
      },
    });

    // Notify points earned
    createNotification(userId, {
      title: 'Points Earned!',
      message: `You earned ${totalPoints} points at ${store.name}!${tierBonusPoints > 0 ? ` (includes ${tierBonusPoints} tier bonus)` : ''}`,
      type: 'POINTS_EARNED',
      data: { points: totalPoints, storeName: store.name, tierBonus: tierBonusPoints },
    }).catch(() => {});

    // Check for tier upgrade
    if (newTier !== oldTier) {
      createNotification(userId, {
        title: 'Tier Upgrade!',
        message: `Congratulations! You've been promoted to ${newTier} tier! You now earn ${multiplier}x points on every scan.`,
        type: 'TIER_UPGRADE',
        data: { oldTier, newTier, multiplier: getTierMultiplier(newTier) },
      }).catch(() => {});
    }
  }

  // Auto-submit review requests for unmatched products
  for (const item of unmatched) {
    const identifier = item.name || '';
    if (!identifier) continue;

    const existingReview = await prisma.reviewRequest.findFirst({
      where: { productIdentifier: identifier, status: 'PENDING' },
    });

    if (!existingReview) {
      await prisma.reviewRequest.create({
        data: {
          productName: identifier,
          productIdentifier: identifier,
          submittedByUserId: userId,
        },
      });
    }
  }

  return { transaction, store, matched, unmatched, totalPoints, tierMultiplier: multiplier, tierBonusPoints };
};

module.exports = { processReceipt, fetchReceipt, matchProducts, generateReceiptHash };
