import type {
  Product,
  Category,
  Review,
  Coupon,
  Order,
  DashboardStats,
  RevenueChartPoint,
  TopProduct,
  LowStockProduct,
  RecentOrder,
  AdminUser,
  InventoryLog,
} from '@/types';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

export const mockCategories: Category[] = [
  { _id: 'cat1', name: 'Smartphones', slug: 'smartphones', parentCategory: null, image: img('phone'), productCount: 120 },
  { _id: 'cat2', name: 'Laptops', slug: 'laptops', parentCategory: null, image: img('laptop'), productCount: 85 },
  { _id: 'cat3', name: 'Audio', slug: 'audio', parentCategory: null, image: img('audio'), productCount: 64 },
  { _id: 'cat4', name: 'Wearables', slug: 'wearables', parentCategory: null, image: img('wear'), productCount: 48 },
  { _id: 'cat5', name: 'Cameras', slug: 'cameras', parentCategory: null, image: img('cam'), productCount: 32 },
  { _id: 'cat6', name: 'Gaming', slug: 'gaming', parentCategory: null, image: img('game'), productCount: 56 },
  { _id: 'cat7', name: 'Home Appliances', slug: 'home-appliances', parentCategory: null, image: img('home'), productCount: 40 },
  { _id: 'cat8', name: 'Accessories', slug: 'accessories', parentCategory: null, image: img('acc'), productCount: 95 },
  {
    _id: 'cat1a', name: 'Android Phones', slug: 'android-phones', parentCategory: 'cat1', image: img('aphone'), productCount: 70,
  },
  {
    _id: 'cat1b', name: 'iOS Phones', slug: 'ios-phones', parentCategory: 'cat1', image: img('iphone'), productCount: 50,
  },
  {
    _id: 'cat2a', name: 'Gaming Laptops', slug: 'gaming-laptops', parentCategory: 'cat2', image: img('glaptop'), productCount: 35,
  },
  {
    _id: 'cat2b', name: 'Ultrabooks', slug: 'ultrabooks', parentCategory: 'cat2', image: img('ultra'), productCount: 30,
  },
  {
    _id: 'cat2c', name: 'Business Laptops', slug: 'business-laptops', parentCategory: 'cat2', image: img('blaptop'), productCount: 20,
  },
  {
    _id: 'cat3a', name: 'Headphones', slug: 'headphones', parentCategory: 'cat3', image: img('headph'), productCount: 30,
  },
  {
    _id: 'cat3b', name: 'Earbuds', slug: 'earbuds', parentCategory: 'cat3', image: img('earbuds'), productCount: 34,
  },
  {
    _id: 'cat3c', name: 'Speakers', slug: 'speakers', parentCategory: 'cat3', image: img('speak'), productCount: 20,
  },
  {
    _id: 'cat4a', name: 'Smartwatches', slug: 'smartwatches', parentCategory: 'cat4', image: img('swatch'), productCount: 28,
  },
  {
    _id: 'cat4b', name: 'Fitness Bands', slug: 'fitness-bands', parentCategory: 'cat4', image: img('fband'), productCount: 20,
  },
  {
    _id: 'cat5a', name: 'DSLR', slug: 'dslr', parentCategory: 'cat5', image: img('dslr'), productCount: 15,
  },
  {
    _id: 'cat5b', name: 'Mirrorless', slug: 'mirrorless', parentCategory: 'cat5', image: img('mirror'), productCount: 17,
  },
  {
    _id: 'cat6a', name: 'Consoles', slug: 'consoles', parentCategory: 'cat6', image: img('cons'), productCount: 20,
  },
  {
    _id: 'cat6b', name: 'Controllers', slug: 'controllers', parentCategory: 'cat6', image: img('ctrl'), productCount: 36,
  },
  {
    _id: 'cat7a', name: 'Smart TVs', slug: 'smart-tvs', parentCategory: 'cat7', image: img('tv'), productCount: 25,
  },
  {
    _id: 'cat7b', name: 'Refrigerators', slug: 'refrigerators', parentCategory: 'cat7', image: img('fridge'), productCount: 15,
  },
];

const brands = ['Samsung', 'Apple', 'Sony', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Bose', 'JBL', 'Xiaomi', 'OnePlus', 'Nikon', 'Canon', 'LG', 'Microsoft', 'Nvidia', 'Logitech', 'GoPro'];

const phoneNames = [
  'Galaxy S24 Ultra', 'iPhone 15 Pro Max', 'Pixel 8 Pro', 'OnePlus 12', 'Galaxy Z Fold5',
  'iPhone 15', 'Xiaomi 14 Pro', 'Pixel 8', 'Galaxy A55', 'OnePlus 12R',
];
const laptopNames = [
  'MacBook Pro 16', 'XPS 15', 'ThinkPad X1 Carbon', 'ROG Strix G16', 'ZenBook Duo',
  'Spectre x360', 'Legion Pro 7i', 'MacBook Air M3', 'IdeaPad Gaming 3', 'Surface Laptop 5',
];
const audioNames = [
  'WH-1000XM5', 'AirPods Pro 2', 'Galaxy Buds3 Pro', 'JBL Charge 5', 'QuietComfort Ultra',
  'Pixel Buds Pro', 'HomePod mini', 'Marshall Emberton', 'Soundcore Liberty 4', 'Bose QC45',
];
const wearableNames = [
  'Galaxy Watch6', 'Apple Watch Ultra 2', 'Pixel Watch 2', 'Fitbit Charge 6', 'Amazfit GTR 4',
  'Apple Watch SE', 'Galaxy Watch6 Classic', 'Mi Band 8', 'Garmin Forerunner 265', 'OnePlus Watch 2',
];
const cameraNames = [
  'EOS R6 Mark II', 'A7 IV', 'Z6 III', 'EOS R50', 'A6700',
  'OM-5', 'G7 X Mark III', 'Fujifilm X-T5', 'Nikon Z fc', 'GoPro HERO12',
];
const gamingNames = [
  'PS5 Slim', 'Xbox Series X', 'DualSense Edge', 'Xbox Elite Controller', 'Steam Deck OLED',
  'RTX 4080 SUPER', 'Razer DeathAdder V3', 'Logitech G502 X', 'PS5 Pulse Headset', 'Xbox Wireless Headset',
];
const tvNames = [
  'Samsung QN90C 55"', 'LG C3 OLED 65"', 'Sony Bravia X90L 50"', 'TCL 6-Series 55"', 'Hisense U8K 65"',
  'Samsung Frame 43"', 'LG B3 OLED 55"', 'Sony A95L 65"', 'Vu 55 Quantum', 'Mi TV 5X 43"',
];
const accessoryNames = [
  'Anker PowerCore 20000', 'Logitech MX Master 3S', 'Belkin Boost Charge Pad', 'Samsung T7 Shield 1TB', 'Apple Magic Keyboard',
  'Logitech MX Keys', 'Anker 737 Charger', 'Elgato Stream Deck', 'Razer BlackWidow V4', 'Keychron K2',
];

const allNames: Record<string, string[]> = {
  cat1: phoneNames, cat2: laptopNames, cat3: audioNames, cat4: wearableNames,
  cat5: cameraNames, cat6: gamingNames, cat7: tvNames, cat8: accessoryNames,
};

const specGroups = {
  Display: [
    { key: 'Screen Size', values: ['6.8"', '6.7"', '6.2"', '6.1"', '15.6"', '14"', '16.2"', '13.6"', '55"', '65"'] },
    { key: 'Resolution', values: ['3088x1440', '2796x1290', '2400x1080', '3456x2234', '2560x1440', '3840x2160'] },
    { key: 'Panel Type', values: ['AMOLED', 'Super Retina XDR', 'OLED', 'IPS LCD', 'QLED', 'OLED evo'] },
    { key: 'Refresh Rate', values: ['120Hz', '144Hz', '60Hz', '240Hz'] },
  ],
  Performance: [
    { key: 'Processor', values: ['Snapdragon 8 Gen 3', 'A17 Pro', 'Tensor G3', 'Snapdragon 8 Gen 2', 'Intel Core i9-13900H', 'Apple M3 Pro', 'AMD Ryzen 9 7945HX', 'Intel Core Ultra 7'] },
    { key: 'RAM', values: ['8GB', '12GB', '16GB', '32GB', '6GB'] },
    { key: 'Storage', values: ['128GB', '256GB', '512GB', '1TB', '2TB'] },
    { key: 'GPU', values: ['Adreno 750', 'Apple GPU 5-core', 'Mali-G715', 'RTX 4080', 'RTX 4060', 'Intel Arc'] },
  ],
  Battery: [
    { key: 'Capacity', values: ['5000mAh', '4500mAh', '4000mAh', '100Wh', '80Wh', '72Wh'] },
    { key: 'Charging', values: ['45W', '25W', '30W', '100W', '65W', '140W'] },
    { key: 'Battery Life', values: ['30 hours', '24 hours', '20 hours', '18 hours', '15 hours'] },
  ],
  Camera: [
    { key: 'Rear Camera', values: ['200MP + 50MP + 12MP', '48MP + 12MP + 12MP', '50MP + 48MP + 48MP', 'Not Applicable'] },
    { key: 'Front Camera', values: ['12MP', '10MP', '8MP', 'Not Applicable'] },
    { key: 'Video', values: ['8K@30fps', '4K@60fps', '4K@30fps', '1080p@60fps'] },
  ],
  Connectivity: [
    { key: '5G', values: ['Yes', 'No'] },
    { key: 'Wi-Fi', values: ['Wi-Fi 7', 'Wi-Fi 6E', 'Wi-Fi 6'] },
    { key: 'Bluetooth', values: ['5.4', '5.3', '5.2'] },
    { key: 'NFC', values: ['Yes', 'No'] },
    { key: 'USB', values: ['Type-C 3.2', 'Type-C 4.0', 'Lightning'] },
  ],
  Build: [
    { key: 'Weight', values: ['232g', '221g', '190g', '1.8kg', '2.1kg', '1.6kg', '3.5kg'] },
    { key: 'Dimensions', values: ['162.3 x 79 x 8.6 mm', '146.6 x 70.6 x 8.2 mm', '355 x 252 x 22 mm'] },
    { key: 'Water Resistance', values: ['IP68', 'IP67', 'IPX4', 'None'] },
    { key: 'Material', values: ['Titanium', 'Aluminum', 'Glass', 'Plastic'] },
  ],
};

function generateSpecs(catId: string): { group: string; key: string; value: string }[] {
  const specs: { group: string; key: string; value: string }[] = [];
  Object.entries(specGroups).forEach(([group, items]) => {
    items.slice(0, 2 + Math.floor(Math.random() * 3)).forEach((item) => {
      specs.push({
        group,
        key: item.key,
        value: item.values[Math.floor(Math.random() * item.values.length)],
      });
    });
  });
  return specs;
}

function generateProducts(): Product[] {
  const products: Product[] = [];
  let id = 1;

  Object.entries(allNames).forEach(([catId, names]) => {
    const subCats = mockCategories.filter((c) => c.parentCategory === catId);
    names.forEach((name, idx) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const price = Math.floor(Math.random() * 150000) + 1500;
      const hasDiscount = Math.random() > 0.4;
      const discountPrice = hasDiscount ? Math.floor(price * (0.7 + Math.random() * 0.2)) : null;
      const stock = Math.floor(Math.random() * 200);
      const status = stock === 0 ? 'out-of-stock' : Math.random() > 0.85 ? 'draft' : 'active';
      const numImages = 3 + Math.floor(Math.random() * 3);
      const images = Array.from({ length: numImages }, (_, i) => img(`prod${id}-${i}`));

      products.push({
        _id: `prod${id}`,
        name: `${brand} ${name}`,
        slug: `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        brand,
        sku: `SKU-${String(id).padStart(5, '0')}`,
        category: catId,
        subCategories: subCats.length ? [subCats[idx % subCats.length]._id] : [],
        price,
        discountPrice,
        stock,
        images,
        thumbnail: images[0],
        shortDescription: `The ${brand} ${name} delivers flagship performance with cutting-edge technology and premium build quality. Experience the ultimate in ${catId === 'cat1' ? 'mobile computing' : catId === 'cat2' ? 'laptop productivity' : 'audio excellence'}.`,
        longDescription: `<p>The <strong>${brand} ${name}</strong> represents the pinnacle of engineering and design. Built for those who demand the best, it combines powerful performance with stunning aesthetics.</p><h3>Key Highlights</h3><ul><li>Industry-leading performance</li><li>Premium build quality</li><li>All-day battery life</li><li>Advanced connectivity options</li></ul><p>Whether you're a professional, creator, or enthusiast, the ${name} adapts to your needs with unparalleled versatility.</p>`,
        specifications: generateSpecs(catId),
        whatsInTheBox: [`${brand} ${name}`, 'USB-C Cable', 'Quick Start Guide', 'Warranty Card', 'Power Adapter'],
        warranty: {
          duration: '1 Year',
          type: 'Manufacturer Warranty',
          details: 'Covers manufacturing defects. Does not cover physical damage.',
        },
        termsAndConditions: 'Subject to manufacturer warranty terms. Returns accepted within 7 days for unopened products.',
        status: status as Product['status'],
        isFeatured: Math.random() > 0.7,
        ratingsAvg: 3.5 + Math.random() * 1.5,
        ratingsCount: Math.floor(Math.random() * 500) + 10,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
      });
      id++;
    });
  });

  return products;
}

export const mockProducts: Product[] = generateProducts();

export const mockReviews: Review[] = mockProducts.slice(0, 20).flatMap((p, i) => {
  const reviewCount = 2 + Math.floor(Math.random() * 3);
  return Array.from({ length: reviewCount }, (_, j) => ({
    _id: `rev${i}-${j}`,
    product: p._id,
    user: `user${j + 1}`,
    userName: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh'][j % 5],
    rating: 3 + Math.floor(Math.random() * 3),
    title: ['Great product!', 'Worth the price', 'Excellent quality', 'Good but pricey', 'Highly recommended'][j % 5],
    comment: 'Been using this for a few weeks now and I am thoroughly impressed. The build quality is exceptional and performance exceeds expectations. Would definitely recommend to anyone looking for a reliable product in this category.',
    isVerifiedPurchase: Math.random() > 0.3,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
  }));
});

export const mockCoupons: Coupon[] = [
  { _id: 'c1', code: 'WELCOME10', type: 'percentage', value: 10, minCartValue: 500, maxDiscount: 500, startDate: '2024-01-01', endDate: '2024-12-31', usageLimit: 1000, usedCount: 342, isActive: true },
  { _id: 'c2', code: 'FLAT500', type: 'flat', value: 500, minCartValue: 5000, maxDiscount: undefined, startDate: '2024-01-01', endDate: '2024-12-31', usageLimit: 500, usedCount: 189, isActive: true },
  { _id: 'c3', code: 'MONSOON25', type: 'percentage', value: 25, minCartValue: 10000, maxDiscount: 2000, startDate: '2024-06-01', endDate: '2024-09-30', usageLimit: 200, usedCount: 156, isActive: true },
  { _id: 'c4', code: 'GAMING15', type: 'percentage', value: 15, minCartValue: 3000, maxDiscount: 1500, startDate: '2024-01-01', endDate: '2024-12-31', usageLimit: 300, usedCount: 78, isActive: true },
  { _id: 'c5', code: 'EXPIRED50', type: 'flat', value: 50, minCartValue: 1000, maxDiscount: undefined, startDate: '2023-01-01', endDate: '2023-12-31', usageLimit: 100, usedCount: 100, isActive: false },
];

export const mockOrders: Order[] = [
  {
    _id: 'ord1', orderNumber: 'EM000001234', user: 'user1',
    items: [
      { productId: 'prod1', name: mockProducts[0].name, slug: mockProducts[0].slug, price: mockProducts[0].price, image: mockProducts[0].thumbnail!, quantity: 1, sku: mockProducts[0].sku },
      { productId: 'prod2', name: mockProducts[1].name, slug: mockProducts[1].slug, price: mockProducts[1].price, image: mockProducts[1].thumbnail!, quantity: 2, sku: mockProducts[1].sku },
    ],
    address: { _id: 'addr1', label: 'Home', fullName: 'Rahul Sharma', phone: '9876543210', line1: '123 MG Road', line2: 'Apt 4B', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true },
    itemsTotal: mockProducts[0].price + mockProducts[1].price * 2,
    discountTotal: 500, grandTotal: mockProducts[0].price + mockProducts[1].price * 2 - 500,
    paymentMethod: 'COD', status: 'delivered',
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 10 * 86400000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 9 * 86400000).toISOString() },
      { status: 'shipped', timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
      { status: 'delivered', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
    ],
    couponCode: 'FLAT500', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    _id: 'ord2', orderNumber: 'EM000001235', user: 'user1',
    items: [
      { productId: 'prod3', name: mockProducts[2].name, slug: mockProducts[2].slug, price: mockProducts[2].price, image: mockProducts[2].thumbnail!, quantity: 1, sku: mockProducts[2].sku },
    ],
    address: { _id: 'addr1', label: 'Home', fullName: 'Rahul Sharma', phone: '9876543210', line1: '123 MG Road', line2: 'Apt 4B', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true },
    itemsTotal: mockProducts[2].price, discountTotal: 0, grandTotal: mockProducts[2].price,
    paymentMethod: 'COD', status: 'shipped',
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { status: 'processing', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { status: 'shipped', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'ord3', orderNumber: 'EM000001236', user: 'user1',
    items: [
      { productId: 'prod4', name: mockProducts[3].name, slug: mockProducts[3].slug, price: mockProducts[3].price, image: mockProducts[3].thumbnail!, quantity: 1, sku: mockProducts[3].sku },
      { productId: 'prod5', name: mockProducts[4].name, slug: mockProducts[4].slug, price: mockProducts[4].price, image: mockProducts[4].thumbnail!, quantity: 1, sku: mockProducts[4].sku },
    ],
    address: { _id: 'addr1', label: 'Home', fullName: 'Rahul Sharma', phone: '9876543210', line1: '123 MG Road', line2: 'Apt 4B', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true },
    itemsTotal: mockProducts[3].price + mockProducts[4].price, discountTotal: 0, grandTotal: mockProducts[3].price + mockProducts[4].price,
    paymentMethod: 'COD', status: 'placed',
    statusHistory: [{ status: 'placed', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString() }],
    createdAt: new Date(Date.now() - 0.5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 0.5 * 86400000).toISOString(),
  },
];

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 4589000,
  totalOrders: 1248,
  totalUsers: 3420,
  totalProducts: mockProducts.length,
  pendingOrders: 42,
};

export const mockRevenueChart: RevenueChartPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  total: Math.floor(Math.random() * 200000) + 50000,
}));

export const mockTopProducts: TopProduct[] = mockProducts
  .slice(0, 8)
  .map((p) => ({
    productId: p._id,
    name: p.name,
    image: p.thumbnail!,
    quantitySold: Math.floor(Math.random() * 300) + 50,
    revenue: Math.floor(Math.random() * 500000) + 100000,
  }))
  .sort((a, b) => b.quantitySold - a.quantitySold);

export const mockLowStock: LowStockProduct[] = mockProducts
  .filter((p) => p.stock < 15)
  .slice(0, 8)
  .map((p) => ({ _id: p._id, name: p.name, sku: p.sku, stock: p.stock, image: p.thumbnail! }));

export const mockRecentOrders: RecentOrder[] = mockOrders.map((o) => ({
  _id: o._id,
  orderNumber: o.orderNumber,
  customerName: 'Rahul Sharma',
  grandTotal: o.grandTotal,
  status: o.status,
  createdAt: o.createdAt,
}));

export const mockAdminUsers: AdminUser[] = Array.from({ length: 15 }, (_, i) => ({
  _id: `user${i + 1}`,
  name: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh', 'Ananya Gupta', 'Rohan Verma', 'Kavya Nair', 'Arjun Mehta', 'Pooja Joshi', 'Karan Malhotra', 'Divya Rao', 'Siddharth Kapoor', 'Nisha Agarwal', 'Aditya Pandey'][i],
  email: `user${i + 1}@example.com`,
  phone: `98${String(76543210 + i).slice(0, 8)}`,
  isVerified: Math.random() > 0.2,
  isActive: Math.random() > 0.1,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 300) * 86400000).toISOString(),
  orderCount: Math.floor(Math.random() * 20),
}));

export const mockInventoryLogs: InventoryLog[] = Array.from({ length: 15 }, (_, i) => ({
  _id: `log${i}`,
  product: 'prod1',
  change: [50, -5, -3, 100, -12, -8, 25, -2, -15, 200, -7, -4, -1, 10, -20][i],
  reason: ['initial', 'order', 'order', 'restock', 'order', 'order', 'restock', 'order', 'order', 'restock', 'order', 'order', 'order', 'correction', 'cancellation'][i],
  reference: ['', `EM00000${100 + i}`, `EM00000${200 + i}`, '', `EM00000${300 + i}`, `EM00000${400 + i}`, '', `EM00000${500 + i}`, `EM00000${600 + i}`, '', `EM00000${700 + i}`, `EM00000${800 + i}`, `EM00000${900 + i}`, 'MANUAL', `EM00000${110 + i}`][i] || undefined,
  timestamp: new Date(Date.now() - i * 3600000 * 12).toISOString(),
}));
