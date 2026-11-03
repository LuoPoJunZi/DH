// Adapted from jiangnan1224/AddressGenerator, feature/real-addresses (MIT).
// Split and adapted for LUOPO Tools. See ../THIRD_PARTY_NOTICES.md.
import { US_AREA_CODES } from './locations.js';
const namesByCountry = {
  CN: {
    first: [
      'Li',
      'Wang',
      'Zhang',
      'Liu',
      'Chen',
      'Yang',
      'Huang',
      'Zhao',
      'Wu',
      'Zhou',
      'Xu',
      'Sun',
      'Ma',
      'Zhu',
      'Hu',
      'Guo',
      'He',
      'Gao',
      'Lin',
      'Zheng',
    ],
    last: [
      'Wei',
      'Fang',
      'Na',
      'Xiuying',
      'Min',
      'Jing',
      'Li',
      'Qiang',
      'Lei',
      'Jun',
      'Yang',
      'Yong',
      'Yan',
      'Jie',
      'Tao',
      'Ming',
      'Chao',
      'Xiulan',
      'Xia',
      'Ping',
    ],
  },
  JP: {
    first: [
      'Sato',
      'Suzuki',
      'Takahashi',
      'Tanaka',
      'Watanabe',
      'Ito',
      'Yamamoto',
      'Nakamura',
      'Kobayashi',
      'Kato',
    ],
    last: ['Shota', 'Ren', 'Hina', 'Yui', 'Hiroto', 'Sota', 'Yota', 'Misaki', 'Nanami', 'Yuto'],
  },
  KR: {
    first: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Jo', 'Yoon', 'Jang', 'Lim'],
    last: [
      'Minjun',
      'Seojun',
      'Doyun',
      'Jiho',
      'Jihun',
      'Seoyeon',
      'Seoyun',
      'Jiwoo',
      'Seohyun',
      'Minseo',
    ],
  },
  TW: {
    first: ['Chen', 'Lin', 'Huang', 'Chang', 'Lee', 'Wang', 'Wu', 'Liu', 'Tsai', 'Yang'],
    last: [
      'Zhiming',
      'Jianhong',
      'Junjie',
      'Yijun',
      'Shufen',
      'Meiling',
      'Yating',
      'Jiahao',
      'Zhihao',
      'Shuhui',
    ],
  },
  HK: {
    first: ['Chan', 'Lee', 'Wong', 'Cheung', 'Lau', 'Wang', 'Ng', 'Cheng', 'Leung', 'Ho'],
    last: [
      'Chiming',
      'Kayan',
      'Junjie',
      'Wingsze',
      'Kaming',
      'Meiling',
      'Kahao',
      'Winger',
      'Chihao',
      'Shukfan',
    ],
  },
  US: {
    first: [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
    ],
    last: [
      'James',
      'John',
      'Robert',
      'Michael',
      'William',
      'David',
      'Richard',
      'Joseph',
      'Thomas',
      'Christopher',
    ],
  },
  UK: {
    first: [
      'Smith',
      'Jones',
      'Williams',
      'Taylor',
      'Brown',
      'Davies',
      'Evans',
      'Wilson',
      'Thomas',
      'Roberts',
    ],
    last: [
      'Oliver',
      'Jack',
      'Harry',
      'George',
      'Noah',
      'Charlie',
      'Jacob',
      'Oscar',
      'William',
      'Leo',
    ],
  },
  FR: {
    first: [
      'Martin',
      'Bernard',
      'Dubois',
      'Thomas',
      'Robert',
      'Richard',
      'Petit',
      'Durand',
      'Leroy',
      'Moreau',
    ],
    last: [
      'Lucas',
      'Louis',
      'Gabriel',
      'Arthur',
      'Jules',
      'Hugo',
      'Leo',
      'Adam',
      'Raphael',
      'Paul',
    ],
  },
  DE: {
    first: [
      'Mueller',
      'Schmidt',
      'Schneider',
      'Fischer',
      'Weber',
      'Meyer',
      'Wagner',
      'Becker',
      'Schulz',
      'Hoffmann',
    ],
    last: ['Ben', 'Paul', 'Leon', 'Noah', 'Luis', 'Finn', 'Felix', 'Jonas', 'Maximilian', 'Henry'],
  },
  IT: {
    first: [
      'Rossi',
      'Ferrari',
      'Russo',
      'Bianchi',
      'Romano',
      'Gallo',
      'Costa',
      'Fontana',
      'Conti',
      'Esposito',
    ],
    last: [
      'Leonardo',
      'Francesco',
      'Alessandro',
      'Lorenzo',
      'Matteo',
      'Andrea',
      'Gabriele',
      'Marco',
      'Antonio',
      'Giuseppe',
    ],
  },
  ES: {
    first: [
      'Garcia',
      'Rodriguez',
      'Gonzalez',
      'Fernandez',
      'Lopez',
      'Martinez',
      'Sanchez',
      'Perez',
      'Martin',
      'Gomez',
    ],
    last: [
      'Antonio',
      'Jose',
      'Manuel',
      'Francisco',
      'David',
      'Juan',
      'Miguel',
      'Javier',
      'Rafael',
      'Carlos',
    ],
  },
  BR: {
    first: [
      'Silva',
      'Santos',
      'Oliveira',
      'Souza',
      'Rodrigues',
      'Ferreira',
      'Alves',
      'Pereira',
      'Lima',
      'Gomes',
    ],
    last: [
      'Miguel',
      'Arthur',
      'Heitor',
      'Pedro',
      'Davi',
      'Gabriel',
      'Bernardo',
      'Lucas',
      'Matheus',
      'Rafael',
    ],
  },
  RU: {
    first: [
      'Ivanov',
      'Smirnov',
      'Kuznetsov',
      'Popov',
      'Vasiliev',
      'Petrov',
      'Sokolov',
      'Mikhailov',
      'Fedorov',
      'Morozov',
    ],
    last: [
      'Alexander',
      'Dmitry',
      'Maxim',
      'Ivan',
      'Andrey',
      'Mikhail',
      'Artem',
      'Daniel',
      'Roman',
      'Sergey',
    ],
  },
  IN: {
    first: ['Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Shah', 'Verma', 'Rao', 'Reddy', 'Joshi'],
    last: [
      'Aarav',
      'Vihaan',
      'Vivaan',
      'Aditya',
      'Arjun',
      'Reyansh',
      'Ayaan',
      'Sai',
      'Krishna',
      'Ishaan',
    ],
  },
  AU: {
    first: [
      'Smith',
      'Jones',
      'Williams',
      'Brown',
      'Wilson',
      'Taylor',
      'Johnson',
      'White',
      'Anderson',
      'Thompson',
    ],
    last: [
      'Oliver',
      'William',
      'Jack',
      'Noah',
      'Thomas',
      'James',
      'Lucas',
      'Henry',
      'Ethan',
      'Alexander',
    ],
  },
  CA: {
    first: [
      'Smith',
      'Brown',
      'Tremblay',
      'Martin',
      'Roy',
      'Wilson',
      'MacDonald',
      'Taylor',
      'Campbell',
      'Anderson',
    ],
    last: [
      'Liam',
      'Noah',
      'Oliver',
      'William',
      'James',
      'Benjamin',
      'Lucas',
      'Henry',
      'Theodore',
      'Jack',
    ],
  },
  MX: {
    first: [
      'Garcia',
      'Rodriguez',
      'Martinez',
      'Lopez',
      'Gonzalez',
      'Perez',
      'Sanchez',
      'Ramirez',
      'Torres',
      'Flores',
    ],
    last: [
      'Santiago',
      'Mateo',
      'Sebastian',
      'Leonardo',
      'Diego',
      'Daniel',
      'Gabriel',
      'Adrian',
      'David',
      'Alexander',
    ],
  },
  TR: {
    first: [
      'Yilmaz',
      'Kaya',
      'Demir',
      'Sahin',
      'Celik',
      'Yildiz',
      'Erdogan',
      'Ozturk',
      'Aydin',
      'Ozdemir',
    ],
    last: [
      'Yusuf',
      'Eymen',
      'Ömer',
      'Mustafa',
      'Ali',
      'Mehmet',
      'Ahmet',
      'Emir',
      'Hamza',
      'Ibrahim',
    ],
  },
  SA: {
    first: [
      'Al-Saud',
      'Al-Sheikh',
      'Al-Rashid',
      'Al-Qahtani',
      'Al-Ghamdi',
      'Al-Zahrani',
      'Al-Dossari',
      'Al-Shammari',
      'Al-Otaibi',
      'Al-Harbi',
    ],
    last: [
      'Mohammed',
      'Abdullah',
      'Ahmed',
      'Ali',
      'Omar',
      'Ibrahim',
      'Khalid',
      'Hassan',
      'Fahad',
      'Abdul',
    ],
  },
  AR: {
    first: [
      'Gonzalez',
      'Rodriguez',
      'Garcia',
      'Fernandez',
      'Lopez',
      'Martinez',
      'Perez',
      'Romero',
      'Sanchez',
      'Diaz',
    ],
    last: [
      'Mateo',
      'Thiago',
      'Benjamin',
      'Valentino',
      'Santiago',
      'Juan',
      'Lucas',
      'Martin',
      'Nicolas',
      'Joaquin',
    ],
  },
  EG: {
    first: [
      'Mohamed',
      'Ahmed',
      'Mahmoud',
      'Ibrahim',
      'Ali',
      'Hassan',
      'Hussein',
      'Mostafa',
      'Kamal',
      'Samir',
    ],
    last: [
      'Omar',
      'Youssef',
      'Adam',
      'Malik',
      'Zain',
      'Hamza',
      'Kareem',
      'Hassan',
      'Ali',
      'Ibrahim',
    ],
  },
  NG: {
    first: [
      'Okafor',
      'Adebayo',
      'Okonkwo',
      'Eze',
      'Oluwaseun',
      'Adegoke',
      'Afolabi',
      'Ogunleye',
      'Adeniyi',
      'Adesina',
    ],
    last: [
      'Oluwadamilare',
      'Oluwatobiloba',
      'Ayomide',
      'Temitope',
      'Oluwaseun',
      'Adebayo',
      'Chibuike',
      'Chisom',
      'Chidi',
      'Obinna',
    ],
  },
  ID: {
    first: [
      'Wijaya',
      'Kusuma',
      'Suryanto',
      'Halim',
      'Santoso',
      'Tanaka',
      'Wibowo',
      'Susanto',
      'Hidayat',
      'Putra',
    ],
    last: [
      'Muhammad',
      'Ahmad',
      'Abdul',
      'Aditya',
      'Budi',
      'Dimas',
      'Eko',
      'Fajar',
      'Gading',
      'Hadi',
    ],
  },
  ZA: {
    first: [
      'Nkosi',
      'Van der Merwe',
      'Botha',
      'Mkhize',
      'Khumalo',
      'Pretorius',
      'Venter',
      'Ndlovu',
      'Fourie',
      'Nel',
    ],
    last: [
      'Bandile',
      'Themba',
      'Sipho',
      'Thabo',
      'Jabu',
      'Mandla',
      'Blessing',
      'Gift',
      'Lucky',
      'Precious',
    ],
  },
};

const phoneFormats = {
  US: {
    format: '+1 (XXX) XXX-XXXX',
    areaCodeRanges: [[201, 989]],
  },
  CN: {
    format: '+86 1XX-XXXX-XXXX',
    mobilePrefix: [
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
      '50',
      '51',
      '52',
      '53',
      '55',
      '56',
      '57',
      '58',
      '59',
      '66',
      '70',
      '71',
      '72',
      '73',
      '75',
      '76',
      '77',
      '78',
      '79',
      '80',
      '81',
      '82',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '89',
    ],
  },
  JP: {
    format: '+81 XX-XXXX-XXXX',
    mobilePrefix: ['70', '80', '90'],
  },
  KR: {
    format: '+82 10-XXXX-XXXX',
  },
  UK: {
    format: '+44 7XXX XXXXXX',
    mobilePrefix: ['7'],
  },
  FR: {
    format: '+33 6 XX XX XX XX',
    mobilePrefix: ['6', '7'],
  },
  DE: {
    format: '+49 15X XXXXXXXX',
    mobilePrefix: ['15', '16', '17'],
  },
  TW: {
    format: '+886 9XX-XXX-XXX',
  },
  HK: {
    format: '+852 XXXX XXXX',
    mobilePrefix: ['5', '6', '9'],
  },
  AU: {
    format: '+61 4XX XXX XXX',
    mobilePrefix: ['4'],
  },
  CA: {
    format: '+1 (XXX) XXX-XXXX',
    areaCodeRanges: [[204, 989]],
  },
  MX: {
    format: '+52 1XX XXX XXXX',
  },
  TR: {
    format: '+90 5XX XXX XXXX',
    mobilePrefix: ['5'],
  },
  SA: {
    format: '+966 5XX XXX XXXX',
    mobilePrefix: ['5'],
  },
  AR: {
    format: '+54 9XX XXXX-XXXX',
  },
  EG: {
    format: '+20 1XX XXX XXXX',
    mobilePrefix: ['1'],
  },
  NG: {
    format: '+234 8XX XXX XXXX',
    mobilePrefix: ['7', '8', '9'],
  },
  ID: {
    format: '+62 8XX-XXXX-XXXX',
    mobilePrefix: ['8'],
  },
  ZA: {
    format: '+27 8X XXX XXXX',
    mobilePrefix: ['6', '7', '8'],
  },
  // 巴西手机号：地区码（DDD）+ 9 开头的 9 位号码；地区码按种子城市匹配
  BR: {
    format: '+55 XX 9XXXX-XXXX',
    mobilePrefix: ['11', '21'],
  },
  // 印度手机号：10 位，首位 6-9
  IN: {
    format: '+91 XXXXX XXXXX',
    mobilePrefix: ['6', '7', '8', '9'],
  },
  // 俄罗斯手机号以 9 开头
  RU: {
    format: '+7 9XX XXX-XX-XX',
  },
  // 意大利手机号以 3 开头
  IT: {
    format: '+39 3XX XXX XXXX',
  },
  // 西班牙手机号以 6 或 7 开头
  ES: {
    format: '+34 XXX XX XX XX',
    mobilePrefix: ['6', '7'],
  },
};

function getRandomName(country) {
  if (!namesByCountry[country]) {
    return null;
  }
  const names = namesByCountry[country];
  const firstName = names.first[Math.floor(Math.random() * names.first.length)];
  const lastName = names.last[Math.floor(Math.random() * names.last.length)];
  return `${firstName} ${lastName}`;
}

function generateAreaCode(ranges) {
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  const [min, max] = range;
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pickUsAreaCodes(seed, stateCode) {
  if (seed && seed.areaCodes && seed.state === stateCode) return seed.areaCodes;
  return US_AREA_CODES[stateCode] || null;
}

function getRandomPhoneNumber(country, areaCodes) {
  const format = phoneFormats[country] || phoneFormats['US'];
  let phone = format.format;

  if (format.areaCodeRanges) {
    // 北美号码（美国、加拿大）
    const areaCode = areaCodes
      ? areaCodes[Math.floor(Math.random() * areaCodes.length)]
      : generateAreaCode(format.areaCodeRanges);
    phone = phone.replace('XXX', areaCode);
    // 北美号码的交换局号（中间三位）首位只能是 2-9
    phone = phone.replace('X', () => 2 + Math.floor(Math.random() * 8));
    phone = phone.replace(/X/g, () => Math.floor(Math.random() * 10));
  } else if (areaCodes || format.mobilePrefix) {
    const prefixes = areaCodes || format.mobilePrefix;
    const prefix = String(prefixes[Math.floor(Math.random() * prefixes.length)]);
    // 先替换前缀
    if (prefix.length === 2) {
      phone = phone.replace(/XX/, prefix);
    } else {
      phone = phone.replace(/X/, prefix);
    }
    // 然后替换剩余的X
    phone = phone.replace(/X/g, () => Math.floor(Math.random() * 10));
  } else {
    phone = phone.replace(/X/g, () => Math.floor(Math.random() * 10));
  }
  return phone;
}
export { getRandomName, getRandomPhoneNumber, pickUsAreaCodes };
