/**
 * HYPERION — central event configuration.
 *
 * Every detail that is not yet officially confirmed is `null` and the UI
 * automatically shows a "to be announced" state. Fill these in when the
 * official information is available — no other file needs to change.
 */

export type SocialLink = { label: string; href: string | null }

export type TimelineItem = {
  title: string
  description: string
  /** e.g. "09:00 AM · Day 1". Leave null to display "TIME TBA". */
  time: string | null
}

export const siteConfig = {
  name: 'HYPERION',
  edition: 'ISSUE #01 · INAUGURAL EDITION',
  tagline: 'ONE CAMPUS. 24 HOURS. UNLIMITED POSSIBILITIES.',
  college: 'Sri Venkateshwara College of Engineering',
  collegeShort: 'SVCE',
  venue: 'SVCE Campus, Bengaluru',
  address: 'SVCE Campus, Bengaluru, Karnataka, India',

  /**
   * Official event start in ISO 8601 with timezone, e.g. "2027-02-14T09:00:00+05:30".
   * While null, the countdown displays "DATE TO BE ANNOUNCED".
   */
  eventStart: '2026-12-04T09:00:00+05:30' as string | null,

  /** Human-readable date shown in badges once announced, e.g. "14–15 February 2027". */
  eventDateLabel: '4th & 5th December' as string | null,

  /** Human-readable hackathon event date shown as a badge on the registration page, e.g. "30th November". */
  hackathonDate: '4th & 5th December' as string | null,

  /**
   * Internal registration route. Set to '/register' to enable the built-in
   * registration form, or point to an external Google Form URL.
   * While null, every registration button stays disabled.
   */
  registrationUrl: '/register' as string | null,

  /**
   * ISO 8601 datetime when registration opens, e.g. "2027-01-01T00:00:00+05:30".
   * While null, the status API returns "not_open" and buttons stay disabled.
   */
  registrationOpensAt: new Date().toISOString() as string | null,

  /**
   * ISO 8601 datetime when registration closes. While null, registration stays
   * open indefinitely (until maxTeams is hit, if set).
   */
  registrationClosesAt: null as string | null,

  /**
   * Maximum number of teams. While null, there is no cap.
   * When reached, status becomes "full".
   */
  maxTeams: null as number | null,

  /** Minimum team size. */
  teamSizeMin: 2,

  /** Maximum team size. */
  teamSizeMax: 4,

  /** Prize summary, e.g. "₹50,000 prize pool". While null, shows "PRIZE DETAILS TO BE ANNOUNCED". */
  prizes: '₹25,000 Prize Pool' as string | null,

  /** Official contact email. While null, shows "Official email coming soon". */
  contactEmail: 'hyperion.ascend.svce@gmail.com' as string | null,

  socials: [] as SocialLink[],

  contacts: [
    { name: 'R Vishnuvardhan', phone: '8050082001' },
    { name: 'Aman Vikas AV', phone: '7022959121' },
  ],

  timeline: [
    {
      title: 'Opening & Briefing',
      description: 'Kick-off, rules of engagement and the mission brief.',
      time: '09:00 AM · 4th December',
    },
    {
      title: 'Team Ideation',
      description: 'Teams pin down the problem and sketch their solution.',
      time: '10:00 AM · 4th December',
    },
    {
      title: 'Development Phase',
      description: 'Heads down. Build, wire, code, prototype and iterate.',
      time: '11:00 AM · 4th December',
    },
    {
      title: 'Mentoring Rounds',
      description: 'Check-ins with mentors to sharpen ideas along the way.',
      time: '10:00 PM · 4th December',
    },
    {
      title: 'Evaluation & Presentations',
      description: 'Teams pitch and demo what they built to the jury.',
      time: '09:00 AM · 5th December',
    },
    {
      title: 'Results & Closing',
      description: 'Winners revealed and the story comes to a close.',
      time: '11:00 AM · 5th December',
    },
  ] as TimelineItem[],
}

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'details', label: 'Event Details' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'prizes', label: 'Prizes' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'contact', label: 'Contact' },
]
