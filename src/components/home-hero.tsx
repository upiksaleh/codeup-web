import Image from 'next/image'
import { siteConfig } from '@/site.config'

export function HomeHero() {
  return (
    <section className="home-hero" aria-label={siteConfig.label} lang="en">
      <div className="home-hero-content">
        <span className="home-hero-label">{siteConfig.label}</span>
        <h1>
          {siteConfig.name}
          <span className="brand-dot">.</span>
        </h1>
        <p>{siteConfig.description}</p>
      </div>
      <Image
        className="home-hero-logo"
        src={siteConfig.logo}
        alt=""
        width={150}
        height={150}
        unoptimized
      />
      <span className="home-hero-domain" aria-hidden="true">
        {siteConfig.domain}
      </span>
    </section>
  )
}
