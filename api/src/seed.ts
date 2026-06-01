import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeação do banco de dados (seeding)...');

  // 1. Limpar anúncios e cupons antigos para evitar duplicidade de chaves primárias
  await prisma.ad.deleteMany({});
  await prisma.coupon.deleteMany({});
  console.log('Anúncios e cupons antigos foram limpos do banco PostgreSQL.');

  // 2. Criar Anúncios Convincentes em Português
  const adsData = [
    {
      id: 'ad_hostcloud_premium',
      title: 'Hospedagem HostCloud Pro',
      description: 'Turbine seus sites e aplicações com servidores VPS e Cloud dedicados. Alto desempenho com 30% de desconto recorrente! Use o cupom CLOUD30.',
      icon: 'cloud',
      color: '#3B82F6',
      createdAt: Date.now(),
    },
    {
      id: 'ad_finances_401',
      title: 'Organize suas Finanças Hoje',
      description: 'Esqueça as planilhas confusas. Controle seus gastos fixos e assinaturas mensais de forma totalmente automatizada. Baixe planilhas premium com 25% OFF!',
      icon: 'pie-chart',
      color: '#10B981',
      createdAt: Date.now(),
    },
    {
      id: 'ad_milesup_rewards',
      title: 'Viaje Grátis com MilesUp',
      description: 'Acumule milhas e pontos em dobro pagando suas assinaturas de streamings e serviços recorrentes. Cadastre seus cartões no aplicativo e ganhe bônus de entrada!',
      icon: 'plane',
      color: '#F59E0B',
      createdAt: Date.now(),
    },
    {
      id: 'ad_nordvpn_protection',
      title: 'Navegação Segura NordVPN',
      description: 'Proteja seus dados contra hackers em redes Wi-Fi públicas e assista catálogos de streamings internacionais com 63% de desconto vitalício!',
      icon: 'shield',
      color: '#4F46E5',
      createdAt: Date.now(),
    },
    {
      id: 'ad_alura_education',
      title: 'Aprenda Programação na Alura',
      description: 'Mude de carreira ou se especialize em React Native, Node.js, Banco de Dados e IA com a maior escola de tecnologia do Brasil. Garanta 10% de desconto pelo link.',
      icon: 'star',
      color: '#16A34A',
      createdAt: Date.now(),
    },
  ];

  for (const ad of adsData) {
    await prisma.ad.create({ data: ad });
  }
  console.log(`Sucesso: ${adsData.length} anúncios convincentes em PT-BR cadastrados!`);

  // 3. Criar Cupons de Afiliados Convincentes em Português
  const couponsData = [
    {
      id: 'coupon_netflix_save15',
      serviceName: 'Netflix',
      description: 'Assista a séries de sucesso e filmes ilimitados com 15% de desconto especial na primeira mensalidade do plano familiar!',
      discountCode: 'NETFLIX15',
      discountPercentage: 15.0,
      externalLink: 'https://www.netflix.com',
      affiliateLink: 'https://www.netflix.com/affiliate',
      category: 'Entretenimento',
      createdAt: Date.now(),
    },
    {
      id: 'coupon_spotify_2months',
      serviceName: 'Spotify Premium',
      description: '2 meses inteiramente gratuitos de música sem anúncios e modo offline nos planos Premium Individual, Duo ou Familiar!',
      discountCode: 'SPOTIFY2M',
      discountPercentage: 20.0,
      externalLink: 'https://www.spotify.com/br-pt',
      affiliateLink: 'https://www.spotify.com/affiliate',
      category: 'Entretenimento',
      createdAt: Date.now(),
    },
    {
      id: 'coupon_adobe_creative',
      serviceName: 'Adobe Creative Cloud',
      description: 'Desconto incrível de 40% para designers, editores, estudantes e professores em mais de 20 softwares do ecossistema Adobe!',
      discountCode: 'ADOBE40STUDENT',
      discountPercentage: 40.0,
      externalLink: 'https://www.adobe.com/br',
      affiliateLink: 'https://www.adobe.com/affiliate',
      category: 'Produtividade',
      createdAt: Date.now(),
    },
    {
      id: 'coupon_github_copilot',
      serviceName: 'GitHub Copilot',
      description: 'Escreva código muito mais rápido com o auxílio da inteligência artificial oficial integrada ao seu VS Code. 1 mês grátis!',
      discountCode: 'COPILOTFREE',
      discountPercentage: 10.0,
      externalLink: 'https://github.com/features/copilot',
      affiliateLink: 'https://github.com/affiliate',
      category: 'Desenvolvimento',
      createdAt: Date.now(),
    },
    {
      id: 'coupon_amazon_prime',
      serviceName: 'Amazon Prime',
      description: 'Assinatura com frete rápido gratuito e ilimitado para todo o país, acesso ao Prime Video, Prime Reading e muito mais por 30 dias grátis!',
      discountCode: 'PRIME30DAYS',
      discountPercentage: 30.0,
      externalLink: 'https://www.amazon.com.br/prime',
      affiliateLink: 'https://www.amazon.com.br/prime/affiliate',
      category: 'Entretenimento',
      createdAt: Date.now(),
    },
    {
      id: 'coupon_youtube_premium',
      serviceName: 'YouTube Premium',
      description: 'Diga adeus às interrupções e anúncios irritantes nos vídeos. Teste gratuitamente por 3 meses com nosso código de afiliado!',
      discountCode: 'YOUTUBE3M',
      discountPercentage: 25.0,
      externalLink: 'https://www.youtube.com/premium',
      affiliateLink: 'https://www.youtube.com/premium/affiliate',
      category: 'Entretenimento',
      createdAt: Date.now(),
    },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log(`Sucesso: ${couponsData.length} cupons de afiliados convincentes em PT-BR cadastrados!`);

  console.log('Seeding concluído com total sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
