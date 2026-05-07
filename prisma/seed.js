const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const zones = [
  { name: 'Doha',            code: 'DOH', memberCount: 1250, latitude: 25.2854, longitude: 51.5310 },
  { name: 'Industrial Area', code: 'IND', memberCount: 920,  latitude: 25.1527, longitude: 51.4475 },
  { name: 'Al Wakrah',       code: 'WKR', memberCount: 680,  latitude: 25.1704, longitude: 51.5966 },
  { name: 'Al Rayyan',       code: 'RYN', memberCount: 540,  latitude: 25.2913, longitude: 51.4241 },
  { name: 'Al Khor',         code: 'KHR', memberCount: 410,  latitude: 25.6804, longitude: 51.4963 },
  { name: 'Abu Hamour',      code: 'ABH', memberCount: 370,  latitude: 25.2361, longitude: 51.4683 },
  { name: 'Lusail',          code: 'LUS', memberCount: 320,  latitude: 25.4186, longitude: 51.4897 },
  { name: 'Ain Khaled',      code: 'AKH', memberCount: 290,  latitude: 25.1147, longitude: 51.5052 },
  { name: 'West Bay',        code: 'WBY', memberCount: 210,  latitude: 25.3285, longitude: 51.5304 },
  { name: 'Muaither',        code: 'MUT', memberCount: 175,  latitude: 25.2664, longitude: 51.3958 },
  { name: 'Umm Salal',       code: 'UMS', memberCount: 195,  latitude: 25.4046, longitude: 51.3966 },
  { name: 'The Pearl',       code: 'PRL', memberCount: 150,  latitude: 25.3742, longitude: 51.5520 },
  { name: 'Al Shamal',       code: 'SHM', memberCount: 0,    latitude: 26.1586, longitude: 51.2150 },
  { name: 'Al Thakhira',     code: 'THK', memberCount: 0,    latitude: 25.7299, longitude: 51.5923 },
  { name: 'Al Kheesa',       code: 'KHS', memberCount: 0,    latitude: 25.5052, longitude: 51.5296 },
  { name: 'Dukhan',          code: 'DKH', memberCount: 0,    latitude: 25.4312, longitude: 50.7891 },
  { name: 'Abu Nakhla',      code: 'ANK', memberCount: 0,    latitude: 25.0856, longitude: 51.5063 },
]

async function main() {
  console.log('Seeding zones...')
  for (const zone of zones) {
    await prisma.zone.upsert({
      where:  { code: zone.code },
      update: { memberCount: zone.memberCount, latitude: zone.latitude, longitude: zone.longitude },
      create: zone,
    })
  }
  console.log(`Seeded ${zones.length} zones.`)

  // Seed default admin user
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@qiic.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminHash     = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: { passwordHash: adminHash, role: 'admin' },
    create: { email: adminEmail, passwordHash: adminHash, role: 'admin', name: 'Admin' },
  })
  console.log(`Admin user ready: ${adminEmail}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
