const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Athlete,
  TrainingPlan,
  NutritionPlan,
  Message,
  USER_ROLES
} = require('../models');

const PASSWORDS = {
  ADMIN: 'AdminPass123!',
  SPECIALIST: 'CoachPass123!',
  ATHLETE_ONE: 'AthleteOne123!',
  ATHLETE_TWO: 'AthleteTwo123!'
};

const hashPassword = (password) => bcrypt.hash(password, 10);

const createUser = async ({ email, password, firstName, lastName, role }) => {
  const passwordHash = await hashPassword(password);
  return User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role
  });
};

const createAthleteProfile = async (user, profile) => {
  return Athlete.create({
    userId: user.id,
    ...profile
  });
};

const seed = async () => {
  console.log('🔄 Seeding EnduranceHub database...');
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  console.log('✅ Database schema synced (force: true).');

  const admin = await createUser({
    email: 'admin@endurancehub.test',
    password: PASSWORDS.ADMIN,
    firstName: 'Asta',
    lastName: 'Administratorė',
    role: USER_ROLES.ADMIN
  });

  const specialist = await createUser({
    email: 'coach@endurancehub.test',
    password: PASSWORDS.SPECIALIST,
    firstName: 'Mantas',
    lastName: 'Specialistas',
    role: USER_ROLES.SPECIALIST
  });

  const athleteUserOne = await createUser({
    email: 'runner@endurancehub.test',
    password: PASSWORDS.ATHLETE_ONE,
    firstName: 'Rūta',
    lastName: 'Bėgikė',
    role: USER_ROLES.ATHLETE
  });

  const athleteUserTwo = await createUser({
    email: 'triathlete@endurancehub.test',
    password: PASSWORDS.ATHLETE_TWO,
    firstName: 'Tomas',
    lastName: 'Triatlonininkas',
    role: USER_ROLES.ATHLETE
  });

  const athleteOne = await createAthleteProfile(athleteUserOne, {
    dateOfBirth: '1994-05-12',
    heightCm: 172,
    weightKg: 62.5,
    restingHeartRate: 54,
    bio: 'Maratonams besiruošianti bėgikė.'
  });

  const athleteTwo = await createAthleteProfile(athleteUserTwo, {
    dateOfBirth: '1990-08-03',
    heightCm: 181,
    weightKg: 74,
    restingHeartRate: 50,
    bio: 'Triatlono sportininkas, ruošiasi „Ironman“ startui.'
  });

  const trainingPlans = await TrainingPlan.bulkCreate(
    [
      {
        athleteId: athleteOne.id,
        specialistId: specialist.id,
        title: 'Vilniaus maratono pasirengimas',
        description: '12 savaičių ciklas orientuotas į bėgimo ištvermę.',
        startDate: '2025-01-06',
        endDate: '2025-03-30',
        intensityLevel: 'HIGH'
      },
      {
        athleteId: athleteTwo.id,
        specialistId: specialist.id,
        title: 'Triatlono bazinis periodas',
        description: 'Dviračio, bėgimo ir plaukimo balansavimas 8 savaites.',
        startDate: '2025-02-03',
        endDate: '2025-03-30',
        intensityLevel: 'MEDIUM'
      }
    ],
    { returning: true }
  );

  const nutritionPlans = await NutritionPlan.bulkCreate(
    [
      {
        athleteId: athleteOne.id,
        specialistId: specialist.id,
        title: 'Maratono mityba',
        description: 'Angliavandenių pakrovimas prieš ilgesnes treniruotes.',
        caloriesPerDay: 2800,
        macronutrientRatio: { carbohydrates: 55, protein: 20, fat: 25 },
        startDate: '2025-01-06',
        endDate: '2025-03-30'
      },
      {
        athleteId: athleteTwo.id,
        specialistId: specialist.id,
        title: 'Triatlono mitybos planas',
        description: 'Balansuota dieta energijai ir atsistatymui.',
        caloriesPerDay: 3200,
        macronutrientRatio: { carbohydrates: 50, protein: 25, fat: 25 },
        startDate: '2025-02-03',
        endDate: '2025-04-27'
      }
    ],
    { returning: true }
  );

  await Message.bulkCreate([
    {
      senderId: specialist.id,
      recipientId: athleteUserOne.id,
      subject: 'Sveikinimai su nauju planu',
      body: 'Pirmadienį pradėk nuo lengvesnio bėgimo, neskubėk iškart į greičius.',
      readAt: new Date(),
      createdAt: new Date()
    },
    {
      senderId: athleteUserOne.id,
      recipientId: specialist.id,
      subject: 'Klausimas dėl tempų',
      body: 'Ar galiu 4 savaitę įtraukti vieną papildomą tempo treniruotę?',
      createdAt: new Date()
    },
    {
      senderId: athleteUserTwo.id,
      recipientId: specialist.id,
      subject: 'Dviračio treniruotės',
      body: 'Kaip keisti treniruotę, jei lauke stipriai lyja?',
      createdAt: new Date()
    }
  ]);

  console.log('🎉 Seed duomenys sėkmingai sukurti.');
  console.log('\n🔐 Demo paskyrų prisijungimai:');
  console.log(`  • Admin (ID: ${admin.id}) → admin@endurancehub.test / ${PASSWORDS.ADMIN}`);
  console.log(`  • Specialistas (ID: ${specialist.id}) → coach@endurancehub.test / ${PASSWORDS.SPECIALIST}`);
  console.log(`  • Sportininkė Rūta (Vartotojo ID: ${athleteUserOne.id}) → runner@endurancehub.test / ${PASSWORDS.ATHLETE_ONE}`);
  console.log(`  • Sportininkas Tomas (Vartotojo ID: ${athleteUserTwo.id}) → triathlete@endurancehub.test / ${PASSWORDS.ATHLETE_TWO}`);
  console.log('\n📝 Sukurti planai:');
  trainingPlans.forEach((plan) => {
    console.log(`  • [${plan.id}] ${plan.title}`);
  });
  console.log('\n🥗 Mitybos planai:');
  nutritionPlans.forEach((plan) => {
    console.log(`  • [${plan.id}] ${plan.title}`);
  });
};

seed()
  .then(() => sequelize.close())
  .then(() => {
    console.log('\n✅ Baigta.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    return sequelize.close().finally(() => process.exit(1));
  });
