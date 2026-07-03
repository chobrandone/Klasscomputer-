/**
 * Seeds the database with demo data for Klass Computer.
 * Run with: npm run seed  (safe to re-run — it wipes and recreates demo data)
 */
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Banner } from '../banners/banners.module';
import { BlogPost } from '../blog/blog.module';
import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { Coupon } from '../coupons/coupon.entity';
import { ProductVariant, VariantOption } from '../products/product-variant.entity';
import { Product } from '../products/product.entity';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';

/** Curated Unsplash photos (all URL-verified) that match each product's category. */
const u = (id: string, w = 800, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** images per catalog index: [main, hover-alt, gallery-alt] */
const PRODUCT_IMAGES: string[][] = [
  /* 0  Dell XPS 15          */ ['photo-1496181133206-80ce9b88a853', 'photo-1593642632823-8f785ba67e45', 'photo-1580894894513-541e068a3e2b'],
  /* 1  HP Pavilion Gaming   */ ['photo-1603302576837-37561b2e2302', 'photo-1602080858428-57174f9431cf', 'photo-1541807084-5c52b6b3adef'],
  /* 2  ThinkPad X1 Carbon   */ ['photo-1593642702821-c8da6771f0c6', 'photo-1593642634315-48f5414c3ad9', 'photo-1573164713988-8665fc963095'],
  /* 3  Asus ROG Strix G16   */ ['photo-1605134513573-384dcf99a44c', 'photo-1603302576837-37561b2e2302', 'photo-1548611716-3000815a5803'],
  /* 4  MacBook Air M3       */ ['photo-1611186871348-b1ce696e52c9', 'photo-1517336714731-489689fd1ca8', 'photo-1541807084-5c52b6b3adef'],
  /* 5  MSI Katana 15        */ ['photo-1592919505780-303950717480', 'photo-1605134513573-384dcf99a44c', 'photo-1602080858428-57174f9431cf'],
  /* 6  IdeaPad Slim 3       */ ['photo-1522199755839-a2bacb67c546', 'photo-1593642634315-48f5414c3ad9', 'photo-1580894894513-541e068a3e2b'],
  /* 7  HP EliteDesk Tower   */ ['photo-1587202372775-e229f172b9d7', 'photo-1547082299-de196ea013d6', 'photo-1563297007-0686b7003af7'],
  /* 8  Dell OptiPlex SFF    */ ['photo-1547082299-de196ea013d6', 'photo-1587202372775-e229f172b9d7', 'photo-1600861194942-f883de0dfe96'],
  /* 9  ROG Gaming Desktop   */ ['photo-1591488320449-011701bb6704', 'photo-1587831990711-23ca6441447b', 'photo-1548611716-3000815a5803'],
  /* 10 Apple iMac 24        */ ['photo-1517059224940-d4af9eec41b7', 'photo-1527443224154-c4a3942d3acf', 'photo-1547394765-185e1e68f34e'],
  /* 11 Odyssey G5 27        */ ['photo-1598550476439-6847785fcea6', 'photo-1614624532983-4ce03382d63d', 'photo-1548611716-3000815a5803'],
  /* 12 UltraSharp 4K        */ ['photo-1547394765-185e1e68f34e', 'photo-1616588589676-62b3bd4ff6d2', 'photo-1586210579191-33b45e38fa2c'],
  /* 13 ViewFinity S6 32     */ ['photo-1614624532983-4ce03382d63d', 'photo-1547394765-185e1e68f34e', 'photo-1461749280684-dccba630e2f6'],
  /* 14 MX Master 3S         */ ['photo-1527864550417-7fd91fc51a46', 'photo-1615663245857-ac93bb7c39e7', 'photo-1600185365483-26d7a4cc7519'],
  /* 15 MX Keys S            */ ['photo-1587829741301-dc798b83add3', 'photo-1595225476474-87563907a212', 'photo-1600185365483-26d7a4cc7519'],
  /* 16 Corsair K70 RGB      */ ['photo-1618384887929-16ec33fab9ef', 'photo-1595225476474-87563907a212', 'photo-1591370874773-6702e8f12fd8'],
  /* 17 Samsung 990 Pro      */ ['photo-1597872200969-2b65d56bd16b', 'photo-1531492746076-161ca9bcad58', 'photo-1593640408182-31c70c8268f5'],
  /* 18 T7 Shield SSD        */ ['photo-1588508065123-287b28e013da', 'photo-1593640408182-31c70c8268f5', 'photo-1625842268584-8f3296236761'],
  /* 19 Corsair Vengeance    */ ['photo-1531492746076-161ca9bcad58', 'photo-1587614382346-4ec70e388b28', 'photo-1587202372775-e229f172b9d7'],
  /* 20 Archer AX73 Router   */ ['photo-1606904825846-647eb07f5be2', 'photo-1587825140708-dfaf72ae4b04', 'photo-1544197150-b99a580bb7a8'],
  /* 21 Deco X50 Mesh        */ ['photo-1587825140708-dfaf72ae4b04', 'photo-1558494949-ef010cbdcc31', 'photo-1544197150-b99a580bb7a8'],
  /* 22 C920 Webcam          */ ['photo-1587826080692-f439cd0b70da', 'photo-1629429407759-01cd3d7cfb38', 'photo-1563297007-0686b7003af7'],
  /* 23 HP 65W USB-C         */ ['photo-1625842268584-8f3296236761', 'photo-1555617981-dac3880eac6e', 'photo-1600861194942-f883de0dfe96'],
  /* 24 ZenScreen Portable   */ ['photo-1585792180666-f7347c490ee2', 'photo-1616588589676-62b3bd4ff6d2', 'photo-1522199755839-a2bacb67c546'],
  /* 25 Thunderbolt Dock     */ ['photo-1593305841991-05c297ba4575', 'photo-1555617981-dac3880eac6e', 'photo-1544197150-b99a580bb7a8'],
  /* 26 MSI Optix 27         */ ['photo-1616588589676-62b3bd4ff6d2', 'photo-1598550476439-6847785fcea6', 'photo-1550745165-9bc0b252726f'],
  /* 27 Legion Tower 5i      */ ['photo-1587831990711-23ca6441447b', 'photo-1591488320449-011701bb6704', 'photo-1602080858428-57174f9431cf'],
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const db = app.get(DataSource);

  console.log('🌱 Seeding Klass Computer database...');

  // Wipe in FK-safe order
  for (const entity of [
    'reviews', 'variant_options', 'product_variants', 'order_items', 'orders',
    'cart_items', 'wishlist_items', 'products', 'categories', 'brands',
    'banners', 'blog_posts', 'coupons', 'refresh_tokens', 'addresses', 'users',
    'newsletter_subscribers',
  ]) {
    await db.query(`DELETE FROM ${entity}`).catch(() => undefined);
  }

  // ── Users ───────────────────────────────────────────────────
  const usersRepo = db.getRepository(User);
  const admin = await usersRepo.save(
    usersRepo.create({
      firstName: 'Klass',
      lastName: 'Admin',
      email: 'admin@klasscomputer.cm',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      role: 'superadmin',
      phone: '+237 670 000 000',
    }),
  );
  const customers: User[] = [];
  const names = [
    ['Brandone', 'Echo'], ['Marie', 'Ngo'], ['Paul', 'Kamdem'],
    ['Sandrine', 'Fotso'], ['Eric', 'Mbarga'],
  ];
  for (const [firstName, lastName] of names) {
    customers.push(
      await usersRepo.save(
        usersRepo.create({
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}@example.com`,
          passwordHash: await bcrypt.hash('Customer123!', 10),
          role: 'customer',
        }),
      ),
    );
  }

  // ── Categories ─────────────────────────────────────────────
  const catRepo = db.getRepository(Category);
  const mk = (data: Partial<Category>) => catRepo.save(catRepo.create(data));

  const laptops = await mk({ name: 'Laptops', slug: 'laptops', image: u('photo-1496181133206-80ce9b88a853', 800, 600), sortOrder: 1 });
  const desktops = await mk({ name: 'Desktops', slug: 'desktops', image: u('photo-1591488320449-011701bb6704', 800, 600), sortOrder: 2 });
  const accessories = await mk({ name: 'Accessories', slug: 'accessories', image: u('photo-1600185365483-26d7a4cc7519', 800, 600), sortOrder: 3 });
  const peripherals = await mk({ name: 'Peripherals', slug: 'peripherals', image: u('photo-1587829741301-dc798b83add3', 800, 600), sortOrder: 4 });

  const gaming = await mk({ name: 'Gaming Laptops', slug: 'gaming-laptops', parent: laptops, sortOrder: 1 });
  const ultrabooks = await mk({ name: 'Ultrabooks', slug: 'ultrabooks', parent: laptops, sortOrder: 2 });
  const monitors = await mk({ name: 'Monitors', slug: 'monitors', parent: peripherals, sortOrder: 1 });
  const keyboards = await mk({ name: 'Keyboards & Mice', slug: 'keyboards-mice', parent: peripherals, sortOrder: 2 });
  const storage = await mk({ name: 'Storage', slug: 'storage', parent: accessories, sortOrder: 1 });
  const networking = await mk({ name: 'Networking', slug: 'networking', parent: accessories, sortOrder: 2 });

  // ── Brands ─────────────────────────────────────────────────
  const brandRepo = db.getRepository(Brand);
  const brandMap: Record<string, Brand> = {};
  for (const name of ['Dell', 'HP', 'Lenovo', 'Asus', 'Apple', 'MSI', 'Logitech', 'Samsung', 'TP-Link', 'Corsair']) {
    brandMap[name] = await brandRepo.save(
      brandRepo.create({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }),
    );
  }

  // ── Products ───────────────────────────────────────────────
  const productRepo = db.getRepository(Product);
  const variantRepo = db.getRepository(ProductVariant);

  type P = {
    name: string; brand: string; cat: Category; price: number; salePrice?: number;
    stock: number; featured?: boolean; newArrival?: boolean; topSeller?: boolean;
    sold?: number; short: string; specs: Record<string, string>;
    variants?: { name: string; options: { value: string; priceModifier?: number }[] }[];
  };

  const catalog: P[] = [
    { name: 'Dell XPS 15 9530', brand: 'Dell', cat: ultrabooks, price: 1250000, salePrice: 1099000, stock: 8, featured: true, topSeller: true, sold: 42, short: '15.6" OLED, Intel Core i7-13700H, RTX 4050', specs: { Processor: 'Intel Core i7-13700H', Display: '15.6" 3.5K OLED', Graphics: 'NVIDIA RTX 4050 6GB', Battery: '86Wh', Weight: '1.86 kg' }, variants: [{ name: 'RAM', options: [{ value: '16GB' }, { value: '32GB', priceModifier: 150000 }] }, { name: 'Storage', options: [{ value: '512GB SSD' }, { value: '1TB SSD', priceModifier: 90000 }] }] },
    { name: 'HP Pavilion Gaming 15', brand: 'HP', cat: gaming, price: 750000, salePrice: 675000, stock: 12, topSeller: true, sold: 38, short: 'Ryzen 5 5600H, GTX 1650, 144Hz display', specs: { Processor: 'AMD Ryzen 5 5600H', Display: '15.6" FHD 144Hz', Graphics: 'GTX 1650 4GB', RAM: '8GB DDR4', Storage: '512GB SSD' } },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', cat: ultrabooks, price: 1450000, stock: 5, featured: true, newArrival: true, sold: 15, short: 'Business flagship — i7, 16GB, 1TB, 14" 2.8K OLED', specs: { Processor: 'Intel Core i7-1355U', Display: '14" 2.8K OLED', RAM: '16GB LPDDR5', Storage: '1TB SSD', Weight: '1.12 kg' } },
    { name: 'Asus ROG Strix G16', brand: 'Asus', cat: gaming, price: 1350000, salePrice: 1245000, stock: 6, featured: true, topSeller: true, sold: 29, short: 'i7-13650HX, RTX 4060, 165Hz — pure gaming power', specs: { Processor: 'Intel Core i7-13650HX', Graphics: 'RTX 4060 8GB', Display: '16" FHD+ 165Hz', RAM: '16GB DDR5', Storage: '1TB SSD' }, variants: [{ name: 'Color', options: [{ value: 'Eclipse Gray' }, { value: 'Volt Green' }] }] },
    { name: 'MacBook Air 13 M3', brand: 'Apple', cat: ultrabooks, price: 1150000, stock: 10, featured: true, newArrival: true, sold: 33, short: 'Apple M3 chip, 18h battery, fanless design', specs: { Chip: 'Apple M3', Display: '13.6" Liquid Retina', RAM: '8GB unified', Storage: '256GB SSD', Battery: 'Up to 18 hours' }, variants: [{ name: 'Color', options: [{ value: 'Midnight' }, { value: 'Starlight' }, { value: 'Space Grey' }] }, { name: 'RAM', options: [{ value: '8GB' }, { value: '16GB', priceModifier: 180000 }] }] },
    { name: 'MSI Katana 15', brand: 'MSI', cat: gaming, price: 980000, salePrice: 899000, stock: 0, sold: 21, short: 'i7-13620H, RTX 4050, forged for battle', specs: { Processor: 'Intel Core i7-13620H', Graphics: 'RTX 4050 6GB', Display: '15.6" FHD 144Hz', RAM: '16GB DDR5' } },
    { name: 'Lenovo IdeaPad Slim 3', brand: 'Lenovo', cat: laptops, price: 385000, stock: 20, topSeller: true, sold: 56, short: 'Everyday laptop — Ryzen 5, 8GB, 512GB SSD', specs: { Processor: 'AMD Ryzen 5 7520U', Display: '15.6" FHD', RAM: '8GB', Storage: '512GB SSD' } },
    { name: 'HP EliteDesk 800 G9 Tower', brand: 'HP', cat: desktops, price: 720000, stock: 7, sold: 12, short: 'i7-12700, 16GB, 512GB — office workhorse', specs: { Processor: 'Intel Core i7-12700', RAM: '16GB DDR5', Storage: '512GB NVMe', Ports: 'USB-C, DP ×2' } },
    { name: 'Dell OptiPlex 7010 SFF', brand: 'Dell', cat: desktops, price: 590000, salePrice: 545000, stock: 9, sold: 18, short: 'Compact business desktop, i5-13500', specs: { Processor: 'Intel Core i5-13500', RAM: '8GB DDR4', Storage: '256GB SSD + 1TB HDD' } },
    { name: 'Asus ROG Gaming Desktop G22CH', brand: 'Asus', cat: desktops, price: 1650000, stock: 3, featured: true, newArrival: true, sold: 8, short: 'i9-13900F, RTX 4070, compact gaming tower', specs: { Processor: 'Intel Core i9-13900F', Graphics: 'RTX 4070 12GB', RAM: '32GB DDR5', Storage: '1TB NVMe' } },
    { name: 'Apple iMac 24 M3', brand: 'Apple', cat: desktops, price: 1550000, stock: 4, newArrival: true, sold: 9, short: 'All-in-one 4.5K Retina, M3 chip, 7 colours', specs: { Chip: 'Apple M3', Display: '24" 4.5K Retina', RAM: '8GB', Storage: '256GB SSD' }, variants: [{ name: 'Color', options: [{ value: 'Blue' }, { value: 'Silver' }, { value: 'Pink' }] }] },
    { name: 'Samsung Odyssey G5 27"', brand: 'Samsung', cat: monitors, price: 245000, salePrice: 219000, stock: 15, topSeller: true, sold: 47, short: 'QHD 165Hz curved gaming monitor', specs: { Size: '27" VA curved', Resolution: '2560×1440', 'Refresh rate': '165Hz', Response: '1ms MPRT' } },
    { name: 'Dell UltraSharp U2723QE 4K', brand: 'Dell', cat: monitors, price: 420000, stock: 6, featured: true, sold: 14, short: '27" 4K IPS Black, USB-C hub, factory calibrated', specs: { Size: '27" IPS Black', Resolution: '3840×2160', 'Color': '98% DCI-P3', Hub: 'USB-C 90W PD' } },
    { name: 'LG-style Samsung ViewFinity S6 32"', brand: 'Samsung', cat: monitors, price: 310000, stock: 11, sold: 10, short: '32" QHD monitor for creators', specs: { Size: '32" VA', Resolution: '2560×1440', HDR: 'HDR10' } },
    { name: 'Logitech MX Master 3S', brand: 'Logitech', cat: keyboards, price: 68000, stock: 25, topSeller: true, sold: 88, short: 'The legendary productivity mouse — 8K DPI, quiet clicks', specs: { Sensor: '8000 DPI', Buttons: '7', Battery: '70 days', Connect: 'Bluetooth / Bolt' }, variants: [{ name: 'Color', options: [{ value: 'Graphite' }, { value: 'Pale Grey' }] }] },
    { name: 'Logitech MX Keys S Keyboard', brand: 'Logitech', cat: keyboards, price: 75000, salePrice: 69000, stock: 18, sold: 41, short: 'Low-profile wireless keyboard with smart backlight', specs: { Layout: 'Full-size', Backlight: 'Smart adaptive', Battery: '10 days (backlit)' } },
    { name: 'Corsair K70 RGB Pro', brand: 'Corsair', cat: keyboards, price: 110000, stock: 9, newArrival: true, sold: 17, short: 'Mechanical gaming keyboard — Cherry MX Red, 8000Hz', specs: { Switches: 'Cherry MX Red', Polling: '8000Hz', Frame: 'Aluminium', RGB: 'Per-key' } },
    { name: 'Samsung 990 Pro 2TB NVMe', brand: 'Samsung', cat: storage, price: 145000, salePrice: 129000, stock: 30, topSeller: true, sold: 64, short: 'PCIe 4.0 SSD — 7,450 MB/s read', specs: { Capacity: '2TB', Interface: 'PCIe 4.0 x4', Read: '7450 MB/s', Write: '6900 MB/s', Endurance: '1200 TBW' } },
    { name: 'Samsung T7 Shield 1TB Portable SSD', brand: 'Samsung', cat: storage, price: 85000, stock: 22, sold: 35, short: 'Rugged IP65 portable SSD, 1050 MB/s', specs: { Capacity: '1TB', Speed: '1050 MB/s', Rating: 'IP65', Drop: '3m' }, variants: [{ name: 'Color', options: [{ value: 'Black' }, { value: 'Beige' }, { value: 'Blue' }] }] },
    { name: 'Corsair Vengeance 32GB DDR5-6000', brand: 'Corsair', cat: storage, price: 98000, stock: 14, sold: 22, short: '2×16GB DDR5 kit for gaming builds', specs: { Capacity: '32GB (2×16GB)', Speed: 'DDR5-6000', Latency: 'CL36' } },
    { name: 'TP-Link Archer AX73 WiFi 6 Router', brand: 'TP-Link', cat: networking, price: 92000, salePrice: 82000, stock: 16, sold: 27, short: 'AX5400 dual-band WiFi 6, covers large homes', specs: { Standard: 'WiFi 6 AX5400', Bands: 'Dual-band', Ports: '4× Gigabit LAN', Antennas: '6' } },
    { name: 'TP-Link Deco X50 Mesh (3-pack)', brand: 'TP-Link', cat: networking, price: 185000, stock: 8, newArrival: true, sold: 11, short: 'Whole-home mesh WiFi 6 — up to 600 m²', specs: { Coverage: '600 m²', Units: '3', Standard: 'WiFi 6 AX3000' } },
    { name: 'Logitech C920 HD Pro Webcam', brand: 'Logitech', cat: accessories, price: 55000, stock: 19, sold: 31, short: 'Full HD 1080p webcam with stereo mics', specs: { Resolution: '1080p/30fps', Focus: 'Autofocus', Mics: 'Dual stereo' } },
    { name: 'HP 65W USB-C Travel Adapter', brand: 'HP', cat: accessories, price: 32000, stock: 40, sold: 52, short: 'Compact 65W USB-C charger for laptops & phones', specs: { Output: '65W USB-C PD', Input: '100-240V' } },
    { name: 'Asus ZenScreen 15.6" Portable Monitor', brand: 'Asus', cat: monitors, price: 175000, stock: 7, newArrival: true, sold: 13, short: 'USB-C portable display for work on the go', specs: { Size: '15.6" IPS', Resolution: '1920×1080', Weight: '0.78 kg', Connect: 'USB-C / mini-HDMI' } },
    { name: 'Dell WD22TB4 Thunderbolt Dock', brand: 'Dell', cat: accessories, price: 195000, salePrice: 179000, stock: 5, sold: 9, short: 'Thunderbolt 4 dock — 90W PD, dual 4K', specs: { Ports: 'TB4, HDMI, DP ×2, RJ45', Power: '90W PD' } },
    { name: 'MSI Optix MAG274QRF-QD 27"', brand: 'MSI', cat: monitors, price: 335000, stock: 4, sold: 7, short: 'Quantum Dot 165Hz esports monitor', specs: { Panel: 'Rapid IPS QD', Resolution: '2560×1440', 'Refresh rate': '165Hz' } },
    { name: 'Lenovo Legion Tower 5i', brand: 'Lenovo', cat: desktops, price: 1180000, salePrice: 1085000, stock: 6, topSeller: true, sold: 16, short: 'i7-13700F, RTX 4060 Ti gaming tower', specs: { Processor: 'Intel Core i7-13700F', Graphics: 'RTX 4060 Ti 8GB', RAM: '16GB DDR5', Storage: '1TB NVMe' } },
  ];

  const savedProducts: Product[] = [];
  for (let i = 0; i < catalog.length; i++) {
    const p = catalog[i];
    const slug = p.name.toLowerCase().replace(/["']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const product = await productRepo.save(
      productRepo.create({
        name: p.name,
        slug,
        shortDescription: p.short,
        description: `<p><strong>${p.name}</strong> — ${p.short}.</p><p>Backed by the Klass Computer 12-month warranty with free technical support in Douala and nationwide delivery across Cameroon. All products are 100% genuine with official manufacturer warranty.</p><p>Visit our showroom for a hands-on demo, or order online and get fast delivery to your door.</p>`,
        price: p.price,
        salePrice: p.salePrice || null,
        isSale: Boolean(p.salePrice),
        stock: p.stock,
        sku: `KC-${String(1000 + i)}`,
        images: (PRODUCT_IMAGES[i] || PRODUCT_IMAGES[0]).map((id) => u(id)),
        specifications: p.specs,
        isFeatured: Boolean(p.featured),
        isNewArrival: Boolean(p.newArrival),
        isTopSeller: Boolean(p.topSeller),
        soldCount: p.sold || 0,
        category: p.cat,
        brand: brandMap[p.brand],
      }),
    );
    savedProducts.push(product);
    for (const v of p.variants || []) {
      await variantRepo.save(
        variantRepo.create({
          name: v.name,
          product,
          options: v.options.map(
            (o) => ({ value: o.value, priceModifier: o.priceModifier || 0 }) as VariantOption,
          ),
        }),
      );
    }
  }

  // ── Reviews ────────────────────────────────────────────────
  const reviewRepo = db.getRepository(Review);
  const comments: [number, string, string][] = [
    [5, 'Excellent quality', 'Exactly as described — fast delivery to Douala and works perfectly. Highly recommend Klass Computer!'],
    [4, 'Very good value', 'Solid product for the price. Packaging was great and the team answered all my questions.'],
    [5, 'Best purchase this year', 'Performance is outstanding. Customer service helped me choose the right configuration.'],
    [4, 'Happy customer', 'Works as expected. Delivery took 2 days to Yaoundé which was faster than promised.'],
    [3, 'Good but pricey', 'Nice product overall, though I found the price slightly high. Quality is undeniable.'],
    [5, 'Perfect for gaming', 'Runs all my games smoothly. Zero regrets, will definitely buy here again.'],
  ];
  let reviewIndex = 0;
  for (const product of savedProducts) {
    const numReviews = (reviewIndex % 4) + 1;
    for (let j = 0; j < numReviews; j++) {
      const [rating, title, comment] = comments[(reviewIndex + j) % comments.length];
      await reviewRepo.save(
        reviewRepo.create({
          rating,
          title,
          comment,
          user: customers[(reviewIndex + j) % customers.length],
          product,
        }),
      );
    }
    const productReviews = await reviewRepo.find({ where: { product: { id: product.id } } });
    const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
    await productRepo.update(product.id, {
      ratings: Math.round(avg * 10) / 10,
      reviewCount: productReviews.length,
    });
    reviewIndex++;
  }

  // ── Banners ────────────────────────────────────────────────
  const bannerRepo = db.getRepository(Banner);
  await bannerRepo.save([
    bannerRepo.create({ type: 'hero', tag: 'New Arrivals 2026', title: 'Power Up Your Setup', subtitle: 'The latest gaming laptops with RTX 40-series graphics — up to 15% off this week only.', image: u('photo-1603302576837-37561b2e2302', 1600, 700), link: '/category/gaming-laptops', ctaLabel: 'Shop Gaming', sortOrder: 1 }),
    bannerRepo.create({ type: 'hero', tag: 'Work Smarter', title: 'Ultrabooks Built for Business', subtitle: 'ThinkPad, XPS & MacBook — premium performance with all-day battery life.', image: u('photo-1496181133206-80ce9b88a853', 1600, 700), link: '/category/ultrabooks', ctaLabel: 'Explore Ultrabooks', sortOrder: 2 }),
    bannerRepo.create({ type: 'hero', tag: 'Free Shipping', title: 'Accessories From 32,000 XAF', subtitle: 'SSDs, routers, docks, webcams and more — free shipping above 50,000 XAF.', image: u('photo-1587829741301-dc798b83add3', 1600, 700), link: '/category/accessories', ctaLabel: 'Shop Accessories', sortOrder: 3 }),
    bannerRepo.create({ type: 'promo', tag: 'Limited Offer', title: 'New Arrivals — Gaming PCs', subtitle: 'RTX 4070 towers in stock now. Trade in your old rig and save.', image: u('photo-1591488320449-011701bb6704', 1600, 500), link: '/shop?sort=newest', ctaLabel: 'Shop New Arrivals', sortOrder: 1 }),
  ]);

  // ── Blog ───────────────────────────────────────────────────
  const blogRepo = db.getRepository(BlogPost);
  await blogRepo.save([
    blogRepo.create({
      title: 'How to Choose the Right Laptop in 2026',
      slug: 'how-to-choose-the-right-laptop-2026',
      excerpt: 'RAM, CPU, GPU, battery — we break down exactly what matters for students, creators and gamers.',
      content: '<h2>Start with your use case</h2><p>The perfect laptop for a video editor is very different from the ideal student machine. Before comparing specs, be honest about what you will actually do most days.</p><h2>CPU &amp; RAM</h2><p>For office work and browsing, a modern Core i5 or Ryzen 5 with 8GB of RAM is plenty. Creators and developers should target 16GB+ and 8-core processors.</p><h2>Graphics</h2><p>Gamers should look at RTX 4050 and above. If you never game or render, integrated graphics saves money and battery.</p><h2>Battery &amp; build</h2><p>Look for 60Wh+ batteries and aluminium chassis if you travel. Visit our showroom in Douala to feel the difference in person.</p>',
      coverImage: u('photo-1541807084-5c52b6b3adef', 1200, 630),
      tags: ['Buying Guide', 'Laptops'],
    }),
    blogRepo.create({
      title: 'SSD vs HDD: Why Your Next Upgrade Should Be an SSD',
      slug: 'ssd-vs-hdd-why-upgrade',
      excerpt: 'A 10-year-old PC with an SSD can feel faster than a new PC with a hard drive. Here is why.',
      content: '<h2>The single best upgrade</h2><p>Swapping a hard drive for an NVMe SSD cuts boot times from minutes to seconds. Applications open instantly and file transfers fly.</p><h2>What to buy</h2><p>The Samsung 990 Pro reads at 7,450 MB/s — over 40× faster than a typical laptop hard drive. For most users, even an entry-level SATA SSD is transformative.</p><p>Bring your laptop to Klass Computer and we will install and clone your drive the same day.</p>',
      coverImage: u('photo-1597872200969-2b65d56bd16b', 1200, 630),
      tags: ['Upgrades', 'Storage'],
    }),
    blogRepo.create({
      title: 'Building the Perfect Home Office on Any Budget',
      slug: 'perfect-home-office-any-budget',
      excerpt: 'From a 300k XAF starter setup to a dream 2M XAF battlestation — three complete builds.',
      content: '<h2>Starter (≈ 350,000 XAF)</h2><p>Lenovo IdeaPad Slim 3, a full-HD webcam and a reliable TP-Link router. Everything you need for remote work.</p><h2>Professional (≈ 900,000 XAF)</h2><p>Add a Dell UltraSharp 4K monitor, MX Keys keyboard and MX Master 3S mouse for all-day comfort.</p><h2>Dream setup (≈ 2,000,000 XAF)</h2><p>MacBook Air M3 or XPS 15, Thunderbolt dock, dual 4K monitors and a mesh WiFi 6 network throughout your home.</p>',
      coverImage: u('photo-1547082299-de196ea013d6', 1200, 630),
      tags: ['Guides', 'Home Office'],
    }),
  ]);

  // ── Coupons ────────────────────────────────────────────────
  const couponRepo = db.getRepository(Coupon);
  await couponRepo.save([
    couponRepo.create({ code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 50000, usageLimit: 500 }),
    couponRepo.create({ code: 'KLASS5000', type: 'fixed', value: 5000, minSubtotal: 100000 }),
  ]);

  console.log('✅ Seed complete!');
  console.log('   Admin login:    admin@klasscomputer.cm / Admin123!');
  console.log('   Customer login: brandone@example.com / Customer123!');
  console.log(`   Products: ${savedProducts.length}, Categories: 10, Brands: 10`);
  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
