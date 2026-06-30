import 'dotenv/config';
import { connectDatabase } from '../src/config/db.js';
import Person from '../src/models/Person.js';

const seedPeople = [
  {
    name: 'An Le',
    role: 'Managing Director',
    bio: 'Focused on governance, transactions, and client leadership across complex projects.',
    expertise: ['Strategy', 'Transactions', 'Leadership'],
    email: 'an.le@adl.vn',
    avatar: 'AL',
    order: 1,
    featured: true,
  },
  {
    name: 'Bao Tran',
    role: 'Principal Advisor',
    bio: 'Advises on commercial structuring, negotiation, and day-to-day business decisions.',
    expertise: ['Commercial', 'Negotiation', 'Operations'],
    email: 'bao.tran@adl.vn',
    avatar: 'BT',
    order: 2,
    featured: true,
  },
  {
    name: 'Chi Tran',
    role: 'Risk & Compliance Lead',
    bio: 'Brings structure to policies, controls, and internal processes that need to scale.',
    expertise: ['Compliance', 'Controls', 'Policy'],
    email: 'chi.tran@adl.vn',
    avatar: 'CT',
    order: 3,
    featured: false,
  },
  {
    name: 'Duc Pham',
    role: 'Client Partnerships Lead',
    bio: 'Keeps communication clear, timelines visible, and stakeholders aligned throughout.',
    expertise: ['Coordination', 'Delivery', 'Support'],
    email: 'duc.pham@adl.vn',
    avatar: 'DP',
    order: 4,
    featured: false,
  },
];

async function run() {
  await connectDatabase();
  await Person.deleteMany({});
  await Person.insertMany(seedPeople);
  console.log(`Seeded ${seedPeople.length} people.`);
  process.exit(0);
}

run().catch((error) => {
  console.error('Seed failed:', error.message);

  if (error.cause) {
    console.error('Cause:', error.cause.message);
  }

  process.exit(1);
});
