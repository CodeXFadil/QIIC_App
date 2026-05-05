const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const zones = [
  { name: 'Doha',            code: 'DOH', memberCount: 1250 },
  { name: 'Industrial Area', code: 'IND', memberCount: 920  },
  { name: 'Al Wakrah',       code: 'WKR', memberCount: 680  },
  { name: 'Al Rayyan',       code: 'RYN', memberCount: 540  },
  { name: 'Al Khor',         code: 'KHR', memberCount: 410  },
  { name: 'Abu Hamour',      code: 'ABH', memberCount: 370  },
  { name: 'Lusail',          code: 'LUS', memberCount: 320  },
  { name: 'Ain Khaled',      code: 'AKH', memberCount: 290  },
  { name: 'West Bay',        code: 'WBY', memberCount: 210  },
  { name: 'Muaither',        code: 'MUT', memberCount: 175  },
  { name: 'Umm Salal',       code: 'UMS', memberCount: 195  },
  { name: 'The Pearl',       code: 'PRL', memberCount: 150  },
  { name: 'Al Shamal',       code: 'SHM', memberCount: 0    },
  { name: 'Al Thakhira',     code: 'THK', memberCount: 0    },
  { name: 'Al Kheesa',       code: 'KHS', memberCount: 0    },
  { name: 'Dukhan',          code: 'DKH', memberCount: 0    },
  { name: 'Abu Nakhla',      code: 'ANK', memberCount: 0    },
]

async function main() {
  console.log('Seeding zones...')
  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { code: zone.code },
      update: { memberCount: zone.memberCount },
      create: zone,
    })
  }
  console.log(`Seeded ${zones.length} zones.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
