import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.fullshine.autos'

  return [
    { url: base,                                                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1    },
    { url: `${base}/reservar`,                                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9  },
    { url: `${base}/sellado-ceramico-concepcion`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/pulido-auto-concepcion`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/lavado-tapiz-concepcion`,                      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/lavado-detallado-concepcion`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/blog`,                                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${base}/blog/cuanto-cuesta-sellado-ceramico-concepcion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/blog/pulido-vs-ceramico-auto`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
  ]
}
