const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        plan: 'enterprise',
        qrLimit: 1000
      }
    }),
    prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Test User',
        plan: 'pro',
        qrLimit: 100
      }
    }),
    prisma.user.upsert({
      where: { email: 'free@example.com' },
      update: {},
      create: {
        email: 'free@example.com',
        password: hashedPassword,
        name: 'Free User',
        plan: 'free',
        qrLimit: 10
      }
    })
  ]);

  console.log('✅ Users created:', users.length);

  // Create sample QR codes for each user
  const qrCodes = [];

  for (const user of users) {
    const userQrCodes = await Promise.all([
      // URL QR codes
      prisma.qRCode.create({
        data: {
          userId: user.id,
          name: 'Company Website',
          data: 'https://example.com',
          type: 'url',
          shortCode: `url_${user.id.slice(-6)}_1`,
          styleConfig: JSON.stringify({
            size: 256,
            foreground: '#000000',
            background: '#FFFFFF',
            errorCorrectionLevel: 'M'
          })
        }
      }),
      prisma.qRCode.create({
        data: {
          userId: user.id,
          name: 'Product Page',
          data: 'https://example.com/products',
          type: 'url',
          shortCode: `url_${user.id.slice(-6)}_2`,
          styleConfig: JSON.stringify({
            size: 256,
            foreground: '#1f2937',
            background: '#f3f4f6',
            errorCorrectionLevel: 'M'
          })
        }
      }),
      // Text QR codes
      prisma.qRCode.create({
        data: {
          userId: user.id,
          name: 'Welcome Message',
          data: 'Welcome to our platform! Scan this QR code to get started.',
          type: 'text',
          shortCode: `text_${user.id.slice(-6)}_1`,
          styleConfig: JSON.stringify({
            size: 256,
            foreground: '#059669',
            background: '#ecfdf5',
            errorCorrectionLevel: 'M'
          })
        }
      }),
      // WiFi QR codes
      prisma.qRCode.create({
        data: {
          userId: user.id,
          name: 'Office WiFi',
          data: JSON.stringify({
            ssid: 'Office_WiFi',
            security: 'WPA2',
            password: 'office123456'
          }),
          type: 'wifi',
          shortCode: `wifi_${user.id.slice(-6)}_1`,
          styleConfig: JSON.stringify({
            size: 256,
            foreground: '#3b82f6',
            background: '#eff6ff',
            errorCorrectionLevel: 'M'
          })
        }
      }),
      // Contact QR codes
      prisma.qRCode.create({
        data: {
          userId: user.id,
          name: 'Business Card',
          data: JSON.stringify({
            name: user.name,
            email: user.email,
            phone: '+1-555-0123',
            company: 'Example Corp'
          }),
          type: 'contact',
          shortCode: `contact_${user.id.slice(-6)}_1`,
          styleConfig: JSON.stringify({
            size: 256,
            foreground: '#7c3aed',
            background: '#f3f4f6',
            errorCorrectionLevel: 'M'
          })
        }
      })
    ]);

    qrCodes.push(...userQrCodes);
  }

  console.log('✅ QR codes created:', qrCodes.length);

  // Create sample scan data
  const scans = [];
  const devices = ['mobile', 'desktop', 'tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const countries = ['US', 'UK', 'CA', 'DE', 'FR', 'AU', 'JP'];
  const cities = ['New York', 'London', 'Toronto', 'Berlin', 'Paris', 'Sydney', 'Tokyo'];

  for (const qrCode of qrCodes) {
    // Generate 5-20 scans per QR code
    const scanCount = Math.floor(Math.random() * 16) + 5;
    
    for (let i = 0; i < scanCount; i++) {
      const scanDate = new Date();
      scanDate.setDate(scanDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
      
      const scan = await prisma.scan.create({
        data: {
          qrId: qrCode.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: `Mozilla/5.0 (${devices[Math.floor(Math.random() * devices.length)]})`,
          deviceType: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          os: 'iOS',
          country: countries[Math.floor(Math.random() * countries.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
          referrer: Math.random() > 0.5 ? 'https://google.com' : null,
          scannedAt: scanDate,
          userId: qrCode.userId
        }
      });
      
      scans.push(scan);
    }
  }

  console.log('✅ Scan data created:', scans.length);

  // Create some daily stats for analytics
  const dailyStats = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    for (const qrCode of qrCodes.slice(0, 3)) { // Only for first 3 QR codes
      const totalScans = Math.floor(Math.random() * 50) + 1;
      const uniqueScans = Math.floor(totalScans * (0.7 + Math.random() * 0.3)); // 70-100% of total
      
      await prisma.dailyStats.create({
        data: {
          qrId: qrCode.id,
          date: date,
          totalScans: totalScans,
          uniqueScans: uniqueScans
        }
      });
    }
  }

  console.log('✅ Daily stats created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   QR Codes: ${qrCodes.length}`);
  console.log(`   Scans: ${scans.length}`);
  console.log('\n🔑 Test Accounts:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   Pro: user@example.com / password123');
  console.log('   Free: free@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
