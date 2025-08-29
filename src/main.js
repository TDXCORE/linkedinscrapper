// SDK v3 (ESM)
import { Actor, log } from 'apify';

await Actor.main(async () => {
  const input = (await Actor.getInput()) ?? {};

  const {
    profileUrls = [],
    email,
    password,
    geminiApiKey,
    jigsawstackApiKey,
    scrapingOptions = {},
    outputOptions = {},
  } = input;

  // Validación mínima
  if (!Array.isArray(profileUrls) || profileUrls.length === 0) {
    throw new Error('profileUrls es requerido y debe ser un array con al menos 1 URL');
  }

  log.info('Input recibido', {
    count: profileUrls.length,
    hasEmail: Boolean(email),
    hasGemini: Boolean(geminiApiKey),
    hasJigsawstack: Boolean(jigsawstackApiKey),
    scrapingOptions,
    outputOptions,
  });

  const results = [];

  // MOCK de procesamiento por perfil (listo para reemplazar por scraping real)
  for (let i = 0; i < profileUrls.length; i += 1) {
    const url = profileUrls[i];
    log.info(`Procesando [${i + 1}/${profileUrls.length}]: ${url}`);

    const record = {
      profileUrl: url,
      success: true,
      timestamp: new Date().toISOString(),
      profile: {
        name: `Demo User ${i + 1}`,
        headline: 'LinkedIn Profile Scraper Demo - Functional Test',
        location: 'Medellín, CO',
        industry: 'Technology',
        followersCount: Math.floor(Math.random() * 5000) + 500,
        connectionsCount: Math.floor(Math.random() * 1000) + 100,
        about: `Perfil demo ${i + 1} generado por el actor.`,
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            duration: '2022 - Presente',
            location: 'Remote'
          }
        ],
        education: [
          {
            school: 'Universidad Demo',
            degree: 'B. Comp. Sci.',
            years: '2018 - 2022'
          }
        ],
        skills: ['JavaScript', 'Node.js', 'Apify SDK v3']
      },
      posts: [
        {
          id: `post_${i + 1}_1`,
          url: `${url}/posts/demo-post-1`,
          type: 'post',
          publishedAt: new Date(Date.now() - 86_400_000).toISOString(),
          caption: `Post demo de ${i + 1}`,
          reactionsCount: Math.floor(Math.random() * 100) + 20,
          commentsCount: Math.floor(Math.random() * 20) + 3,
          sharesCount: Math.floor(Math.random() * 10) + 1,
          hashtags: ['#demo', '#linkedin']
        }
      ],
      metrics: {
        totalPosts: 1,
        avgReactions: Math.floor(Math.random() * 50) + 25,
        totalEngagement: Math.floor(Math.random() * 200) + 50
      }
    };

    results.push(record);
    await Actor.pushData(record);

    // Delay entre perfiles (configurable)
    const delayMs = scrapingOptions?.delayBetweenRequestsMs ?? 2000;
    if (i < profileUrls.length - 1 && delayMs > 0) {
      await Actor.sleep(delayMs);
    }
  }

  // Resumen final
  await Actor.pushData({
    summary: {
      totalProfiles: results.length,
      successful: results.length,
      failed: 0,
      successRate: 100,
      finishedAt: new Date().toISOString(),
      actorVersion: '0.1.0'
    }
  });

  log.info('Ejecución completada', { total: results.length });
});
