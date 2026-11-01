import { siteConfig } from '@/site.config'
import { PointerTrail } from './pointer-trail'
import { TypingText } from './typing-text'
import { LogoSymbol, LogoWordmark } from './logo'

export function HomeHero() {
  return (
    <section className="home-hero" aria-label={siteConfig.label} lang="en">
      <PointerTrail />
      <div className="home-hero-content">
        <TypingText className="home-hero-label" text={siteConfig.label} />
        <h1>
          <LogoWordmark aria-label={siteConfig.name} width={260} />
          <span className="home-hero-dot" aria-hidden="true" />
        </h1>
        <p>{siteConfig.description}</p>
      </div>
      <LogoSymbol className="home-hero-logo" width={150} />
      <span className="home-hero-domain" aria-hidden="true">
        {siteConfig.domain}
      </span>
    </section>
  )
}
