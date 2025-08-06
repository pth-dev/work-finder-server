import { DataSource } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export const companiesData = [
  {
    company_name: 'FPT Software',
    description:
      'Leading software company in Vietnam providing innovative IT solutions and services globally. We specialize in digital transformation, software development, and technology consulting.',
    industry: 'Information Technology',
    website: 'https://www.fpt-software.com',
    location: 'Hà Nội',
    address:
      'Tầng 8, Tòa nhà Keangnam Hanoi Landmark, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Viettel Group',
    description:
      'Largest telecommunications company in Vietnam, expanding globally with technology and digital services. Pioneer in 5G technology and digital transformation.',
    industry: 'Telecommunications',
    website: 'https://viettel.com.vn',
    location: 'Hà Nội',
    address:
      'Tầng 10, Tòa nhà Viettel, 285 Cách Mạng Tháng 8, P.12, Q.10, TP.HCM',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'VinGroup',
    description:
      'Largest private conglomerate in Vietnam with businesses spanning real estate, retail, healthcare, education, and technology including VinFast electric vehicles.',
    industry: 'Conglomerate',
    website: 'https://vingroup.net',
    location: 'Hà Nội',
    address:
      '7th Floor, Vincom Center, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Tiki Corporation',
    description:
      'Leading e-commerce platform in Vietnam, revolutionizing online shopping experience with innovative technology and logistics solutions.',
    industry: 'E-commerce',
    website: 'https://tiki.vn',
    location: 'Hồ Chí Minh',
    address: '52 Út Tịch, Phường 4, Tân Bình, Hồ Chí Minh',
    company_size: '500-1000',
    is_verified: true,
  },
  {
    company_name: 'VNG Corporation',
    description:
      'Pioneer technology company in Vietnam, creating innovative digital products and services including Zalo, Zing News, and mobile games.',
    industry: 'Technology',
    website: 'https://vng.com.vn',
    location: 'Hồ Chí Minh',
    address: 'Tầng 8-10, Tòa nhà E-Town 2, 364 Cộng Hòa, Tân Bình, TP.HCM',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Grab Vietnam',
    description:
      'Leading ride-hailing and digital services platform in Southeast Asia, providing transportation, food delivery, and financial services.',
    industry: 'Technology/Transportation',
    website: 'https://grab.com/vn',
    location: 'Hồ Chí Minh',
    address:
      'Lầu 6, Tòa nhà Deutsches Haus, 33 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
    company_size: '500-1000',
    is_verified: true,
  },
  {
    company_name: 'Momo',
    description:
      "Vietnam's leading e-wallet and digital payment platform, providing comprehensive financial services and lifestyle solutions.",
    industry: 'Fintech',
    website: 'https://momo.vn',
    location: 'Hồ Chí Minh',
    address:
      'Tầng 3, Tòa nhà Diamond Plaza, 34 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
    company_size: '500-1000',
    is_verified: true,
  },
  {
    company_name: 'Shopee Vietnam',
    description:
      'Leading e-commerce platform in Southeast Asia and Taiwan, connecting buyers and sellers through mobile-first marketplace.',
    industry: 'E-commerce',
    website: 'https://shopee.vn',
    location: 'Hồ Chí Minh',
    address:
      'Lầu 4-6, Tòa nhà Saigon Centre, 65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Techcombank',
    description:
      'Leading private commercial bank in Vietnam, pioneering digital banking solutions and innovative financial services.',
    industry: 'Banking',
    website: 'https://techcombank.com.vn',
    location: 'Hà Nội',
    address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'VPBank',
    description:
      'One of the largest private banks in Vietnam, offering comprehensive banking and financial services with strong digital transformation focus.',
    industry: 'Banking',
    website: 'https://vpbank.com.vn',
    location: 'Hà Nội',
    address: '89 Láng Hạ, Đống Đa, Hà Nội',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Got It AI',
    description:
      'AI-powered customer service platform providing intelligent chatbot and virtual assistant solutions for businesses globally.',
    industry: 'Artificial Intelligence',
    website: 'https://www.got-it.ai',
    location: 'Hà Nội',
    address:
      'Tầng 12A, Tòa nhà Vincom Tower, 191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    company_size: '100-500',
    is_verified: true,
  },
  {
    company_name: 'KMS Technology',
    description:
      'Global software development and technology consulting company, providing digital transformation solutions and offshore development services.',
    industry: 'Information Technology',
    website: 'https://kms-technology.com',
    location: 'Hồ Chí Minh',
    address:
      'Tầng 12, Tòa nhà AP Tower, 518B Điện Biên Phủ, Bình Thạnh, TP.HCM',
    company_size: '500-1000',
    is_verified: true,
  },
  {
    company_name: 'Base.vn',
    description:
      'Leading digital marketing and e-commerce solutions provider in Vietnam, helping businesses grow online with innovative technology.',
    industry: 'Digital Marketing',
    website: 'https://base.vn',
    location: 'Hà Nội',
    address: 'Tầng 6, Tòa nhà Charmvit, 117 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    company_size: '100-500',
    is_verified: true,
  },
  {
    company_name: 'VinTech',
    description:
      'Technology arm of VinGroup, developing cutting-edge solutions for smart cities, IoT, and digital transformation across industries.',
    industry: 'Technology',
    website: 'https://vintech.city',
    location: 'Hà Nội',
    address:
      'Tầng 46, Tòa nhà Keangnam Hanoi Landmark, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    company_size: '500-1000',
    is_verified: true,
  },
  {
    company_name: 'FPT Telecom',
    description:
      'Leading internet service provider in Vietnam, offering high-speed broadband, digital TV, and innovative telecommunications solutions.',
    industry: 'Telecommunications',
    website: 'https://fpt.vn',
    location: 'Hà Nội',
    address: 'Tầng 3, Tòa nhà FPT, Cầu Giấy, Hà Nội',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Sendo',
    description:
      'Vietnamese e-commerce platform focusing on connecting local sellers with buyers, promoting local products and businesses.',
    industry: 'E-commerce',
    website: 'https://sendo.vn',
    location: 'Hồ Chí Minh',
    address:
      'Tầng 5, Tòa nhà Sài Gòn Riverside, 2A-4A Tôn Đức Thắng, Bến Nghé, Quận 1, TP.HCM',
    company_size: '100-500',
    is_verified: true,
  },
  {
    company_name: 'VietinBank',
    description:
      'One of the largest state-owned commercial banks in Vietnam, providing comprehensive banking and financial services nationwide.',
    industry: 'Banking',
    website: 'https://vietinbank.vn',
    location: 'Hà Nội',
    address: '108 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'Zalo',
    description:
      "Vietnam's most popular messaging app and social platform, part of VNG Corporation, offering communication and digital services.",
    industry: 'Social Media/Technology',
    website: 'https://zalo.me',
    location: 'Hồ Chí Minh',
    address: 'Tầng 8-10, Tòa nhà E-Town 2, 364 Cộng Hòa, Tân Bình, TP.HCM',
    company_size: '500-1000',
    is_verified: true,
  },
  {
    company_name: 'Sacombank',
    description:
      'Leading private commercial bank in Vietnam, offering innovative banking solutions and digital financial services.',
    industry: 'Banking',
    website: 'https://sacombank.com.vn',
    location: 'Hồ Chí Minh',
    address: '266-268 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
    company_size: '1000+',
    is_verified: true,
  },
  {
    company_name: 'CMC Corporation',
    description:
      'Leading IT corporation in Vietnam providing digital transformation, software development, and technology consulting services.',
    industry: 'Information Technology',
    website: 'https://cmc.com.vn',
    location: 'Hà Nội',
    address: 'Tầng 2, Tòa nhà CMC, Duy Tân, Cầu Giấy, Hà Nội',
    company_size: '1000+',
    is_verified: true,
  },
];

export async function seedCompanies(dataSource: DataSource): Promise<void> {
  const companyRepository = dataSource.getRepository(Company);

  // Delete all existing companies using raw query (this will cascade to related tables)
  await dataSource.query('DELETE FROM companies');

  // Reset sequence to start from 1
  await dataSource.query(
    'ALTER SEQUENCE companies_company_id_seq RESTART WITH 1;',
  );

  // Insert new companies
  for (const companyData of companiesData) {
    const company = companyRepository.create(companyData);
    await companyRepository.save(company);
  }
}
