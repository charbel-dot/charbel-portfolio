/**
 * Everything the page says, in both languages, plus the contact details.
 * Edit this file to change copy; components only read from it.
 */

import type { CardSpot, SpotId } from './scene/hotspots'

export type Lang = 'en' | 'ar'

/** Contact details used across the page. */
export const CONTACT = {
  email: 'hello@charbelnasseh.dev',
  whatsappNumber: '96171662507',
  instagram: 'charbel.nasseh',
  instagramUrl: 'https://instagram.com/charbel.nasseh',
}

export const mailto = (subject: string, body = '') =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ''
  }`
export const whatsapp = (text: string) =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`

export type ServiceItem = { name: string; note: string }
export type ServiceGroup = {
  id: 'web' | 'systems' | 'servers'
  title: string
  summary: string
  items: ServiceItem[]
}

export type Project = {
  id: 'hum' | 'restaurant' | 'mobitouch'
  title: string
  /** Title split into display lines for the seam. */
  lines: string[]
  discipline: string
  description: string
  link?: { href: string; label: string }
}

export type CardAction = { label: string; href: string; external?: boolean }
export type RoomCard = { title: string; body: string; items?: string[]; actions: CardAction[] }

type Copy = {
  room: {
    hint: string
    listLabel: string
    close: string
    prev: string
    next: string
    loading: string
    names: Record<SpotId, string>
    verbs: Record<SpotId, string>
    cards: Record<CardSpot, RoomCard>
    zones: { city: string; zone: string }[]
  }
  meta: { title: string; description: string }
  nav: { services: string; work: string; about: string; contact: string; switchTo: string; switchLabel: string; menu: string; dark: string }
  hero: {
    name: string[]
    hiddenRole: string
    lead: string
    cta: string
    terminal: string
    sceneLabel: string
    beirut: (time: string, phase: string) => string
    phases: { night: string; dawn: string; day: string; dusk: string }
  }
  services: { heading: string; hint: string; groups: ServiceGroup[] }
  work: { heading: string; sample: string; shots: Record<Project['id'], [string, string]>; projects: Project[] }
  about: {
    heading: string
    name: string
    p1: string
    p2: string
    facts: { label: string; value: string }[]
    photoAlt: string
  }
  places: { heading: string; corniche: string; cedar: string; bay: string; note: string }
  contact: {
    heading: string
    lead: string
    email: string
    whatsapp: string
    instagram: string
    place: (time: string) => string
    status: string
    greeting: string
    greetingLabel: string
    mailSubject: string
    waText: string
    photoAlt: string
  }
  footer: {
    contact: string
    pages: string
    elsewhere: string
    beirut: string
    lebanon: string
    rights: string
    pictures: string
    top: string
  }
  terminal: {
    title: string
    close: string
    placeholder: string
    inputLabel: string
    welcome: string[]
    unknown: (cmd: string) => string
    help: string[]
    whoami: string[]
    status: string[]
    about: string[]
    contact: string[]
    hire: string[]
    sudo: string[]
    time: (t: string) => string[]
    opening: (what: string) => string
  }
}

const en: Copy = {
  room: {
    hint: 'Click anything in the room',
    listLabel: 'Things in the room',
    close: 'Back to the room',
    prev: 'Previous',
    next: 'Next',
    loading: 'Waking the room up',
    names: {
      monitor: 'Terminal',
      charbel: 'Charbel',
      server: 'Servers',
      books: 'Bookshelf',
      board: 'Pinboard',
      clock: 'Clock',
      window: 'Window',
      phone: 'Phone',
      print: 'Cedar',
      lamp: 'Desk lamp',
      mug: 'Coffee',
      plant: 'Plant',
      beanbag: 'Beanbag',
    },
    verbs: {
      monitor: 'type a command',
      charbel: 'say hello',
      server: 'see what runs',
      books: 'read the spines',
      board: 'see the projects',
      clock: 'check the time',
      window: 'look outside',
      phone: 'get in touch',
      print: 'read the print',
      lamp: 'switch it',
      mug: 'take a sip',
      plant: 'give it a poke',
      beanbag: 'flop down',
    },
    cards: {
      charbel: {
        title: 'Hi, I’m Charbel',
        body: 'Web developer and IT engineer in Lebanon. I build websites and the systems behind them, for businesses at home and across the Gulf.',
        actions: [
          { label: 'Start a project', href: '#contact' },
          { label: 'About me', href: '#about' },
        ],
      },
      server: {
        title: 'Servers and hosting',
        body: 'The tall screen shows a server’s load. Under the desk is the kind of machine I set up, deploy to and look after.',
        items: ['Linux', 'Docker', 'Proxmox', 'VPS administration', 'Deployment', 'Backups', 'Monitoring'],
        actions: [{ label: 'What I do', href: '#services' }],
      },
      books: {
        title: 'What I build with',
        body: 'The spines on the shelf are the tools I reach for every week.',
        items: ['WordPress', 'WooCommerce', 'React', 'ERPNext', 'Linux', 'Docker', 'Proxmox'],
        actions: [{ label: 'What I do', href: '#services' }],
      },
      board: {
        title: 'On the board',
        body: 'Three projects pinned up: an online store, a restaurant system and my own brand.',
        items: ['HÚM, an online store on WooCommerce', 'Restaurant management, ERPNext with URY', 'MobiTouch, web and IT services'],
        actions: [{ label: 'See the work', href: '#work' }],
      },
      clock: {
        title: 'Beirut time',
        body: 'Beirut is within an hour of Gulf time, so our calls happen inside your working day.',
        actions: [{ label: 'Start a project', href: '#contact' }],
      },
      window: {
        title: 'The view from Lebanon',
        body: 'The window shows the sky over Beirut at this hour: blue by day, orange at sunset, dark at night.',
        actions: [{ label: 'Working from Lebanon', href: '#places' }],
      },
      phone: {
        title: 'Get in touch',
        body: 'Tell me what you need and I’ll reply with next steps.',
        actions: [],
      },
      print: {
        title: 'The cedar',
        body: 'The cedar of Lebanon, the tree on the flag. The oldest still grow in the Cedars of God forest, high on Mount Lebanon.',
        actions: [{ label: 'See the photo', href: '#places' }],
      },
    },
    zones: [
      { city: 'Beirut', zone: 'Asia/Beirut' },
      { city: 'Dubai', zone: 'Asia/Dubai' },
      { city: 'Riyadh', zone: 'Asia/Riyadh' },
    ],
  },
  meta: {
    title: 'Charbel Nasseh — Web developer and IT engineer, Lebanon',
    description:
      'Charbel Nasseh builds websites, online stores, ERPNext business systems and the Linux servers behind them, for businesses in Lebanon and across the Gulf.',
  },
  nav: {
    services: 'Services',
    work: 'Work',
    about: 'About',
    contact: 'Contact',
    switchTo: 'العربية',
    switchLabel: 'اقرأ الموقع بالعربية',
    menu: 'Main',
    dark: 'Dark mode',
  },
  hero: {
    name: ['Charbel', 'Nasseh'],
    hiddenRole: ', web developer and IT engineer in Lebanon',
    lead: 'I build websites and the systems behind them, for businesses in Lebanon and across the Gulf.',
    cta: 'Start a project',
    terminal: 'Use my terminal',
    sceneLabel:
      'A 3D model of my desk: a developer in mint headphones typing at a monitor, a small server humming under the desk, the window showing the sky over Beirut right now.',
    beirut: (time, phase) => `${time} in Beirut, ${phase}.`,
    phases: {
      night: 'the desk lamp is on',
      dawn: 'first coffee',
      day: 'servers humming',
      dusk: 'sun going down over the sea',
    },
  },
  services: {
    heading: 'What I do',
    hint: 'Point at any line to read what it means.',
    groups: [
      {
        id: 'web',
        title: 'Websites and stores',
        summary: 'Fast, mobile-first websites and stores, built to bring in customers.',
        items: [
          { name: 'WordPress', note: 'Sites you can edit yourself after I hand them over.' },
          { name: 'Elementor', note: 'Page layouts your team can change without calling me.' },
          { name: 'React', note: 'Custom interfaces when a theme is not enough.' },
          { name: 'WooCommerce', note: 'Stores with products, stock, shipping and payment.' },
          { name: 'Arabic and English', note: 'Bilingual sites that read right in both directions.' },
          { name: 'Speed', note: 'Pages that load quickly on a phone on mobile data.' },
          { name: 'Search basics', note: 'Titles, structure and sitemaps so Google can read you.' },
        ],
      },
      {
        id: 'systems',
        title: 'Business systems',
        summary: 'ERPNext and point of sale that fit how your business already runs.',
        items: [
          { name: 'ERPNext setup', note: 'Accounts, stock, sales and purchasing in one system.' },
          { name: 'Customization', note: 'Forms, reports and print formats shaped to your work.' },
          { name: 'Restaurant POS', note: 'URY on ERPNext: tables, orders and the kitchen.' },
          { name: 'Retail POS', note: 'Counters that stay in sync with your stock.' },
          { name: 'Invoicing', note: 'Invoices and receipts in your currency and language.' },
          { name: 'Integrations', note: 'Connecting the tools you already pay for.' },
          { name: 'Training', note: 'Your staff learn it on your own data.' },
        ],
      },
      {
        id: 'servers',
        title: 'Servers and hosting',
        summary: 'Linux, Docker and Proxmox: deployed, backed up and monitored.',
        items: [
          { name: 'Linux', note: 'Ubuntu and Debian servers, set up and kept patched.' },
          { name: 'Docker', note: 'Apps in containers, so they move and restart cleanly.' },
          { name: 'Proxmox', note: 'Several machines on one physical server.' },
          { name: 'VPS administration', note: 'Cloud servers sized for what you actually run.' },
          { name: 'Deployment', note: 'From code on a laptop to a live address.' },
          { name: 'Backups', note: 'Copies kept off the server, and tested restores.' },
          { name: 'Monitoring', note: 'Alerts before your customers notice anything.' },
          { name: 'Domains, DNS and email', note: 'Addresses, records and mailboxes that just work.' },
        ],
      },
    ],
  },
  work: {
    heading: 'Selected work',
    sample: 'Sample data',
    shots: {
      hum: ['The HÚM storefront: announcement bar, hero and three products with prices.', 'HÚM collections list with a product added to the cart.'],
      restaurant: ['URY point of sale floor plan with twelve tables, sample data.', 'A kitchen ticket for table 7, sample data.'],
      mobitouch: ['The MobiTouch brand board listing websites, stores, ERPNext and servers.', 'A shell listing MobiTouch services and status.'],
    },
    projects: [
      {
        id: 'hum',
        title: 'HÚM',
        lines: ['HÚM'],
        discipline: 'Online store · WooCommerce',
        description: 'An online store for jewelry and misbaha.',
        link: { href: 'https://humlb.com', label: 'Visit humlb.com' },
      },
      {
        id: 'restaurant',
        title: 'Restaurant management',
        lines: ['Restaurant', 'management'],
        discipline: 'ERPNext with URY · in production',
        description: 'Tables, orders, kitchen and accounts in one system, running every service.',
        link: { href: '#contact', label: 'Ask me about it' },
      },
      {
        id: 'mobitouch',
        title: 'MobiTouch',
        lines: ['MobiTouch'],
        discipline: 'My web and IT services brand',
        description: 'Where my client work for businesses is offered and delivered.',
        link: { href: 'https://mobitouch.tech', label: 'Visit mobitouch.tech' },
      },
    ],
  },
  about: {
    heading: 'About',
    name: 'I’m Charbel Nasseh,',
    p1: 'a web developer and IT engineer in Lebanon. I build the website your customers see, and the systems your business runs on behind it.',
    p2: 'That means the store, the point of sale in the kitchen and the server it all lives on. I work with shops, restaurants and companies at home, and with teams across the Gulf who want one person to carry a project from domain name to deployment, and to still pick up the phone after launch.',
    facts: [
      { label: 'Based in', value: 'Lebanon' },
      { label: 'Working with', value: 'Lebanon and the Gulf' },
      { label: 'Speaks', value: 'Arabic and English' },
    ],
    photoAlt: 'A cedar of Lebanon in the mist, in the Cedars of God forest.',
  },
  places: {
    heading: 'Working from Lebanon',
    corniche: 'Beirut’s Corniche, seen from the sea.',
    cedar: 'A cedar in the Cedars of God, Mount Lebanon.',
    bay: 'Zaytunay Bay, Beirut, after dark.',
    note: 'Beirut is within an hour of Gulf time, so our calls happen inside your working day.',
  },
  contact: {
    heading: 'Start a project',
    lead: 'Tell me what you need and I’ll reply with next steps.',
    email: CONTACT.email,
    whatsapp: 'Message me on WhatsApp',
    instagram: `Instagram @${CONTACT.instagram}`,
    place: (t) => `Lebanon, ${t} now`,
    status: 'Open for new projects',
    greeting: 'Say hello',
    greetingLabel: 'Write me an email',
    mailSubject: 'New project',
    waText: 'Hi Charbel, I have a project in mind.',
    photoAlt: 'Zaytunay Bay in Beirut at night, towers lit over the marina.',
  },
  footer: {
    contact: 'Contact',
    pages: 'On this page',
    elsewhere: 'Elsewhere',
    beirut: 'Beirut time',
    lebanon: 'Lebanon',
    rights: 'Charbel Nasseh · Lebanon',
    pictures: 'Pictures',
    top: 'Back to top',
  },
  terminal: {
    title: 'charbel@dev — terminal',
    close: 'Close terminal',
    placeholder: 'type help',
    inputLabel: 'Terminal command',
    welcome: ['Welcome to my desk. Type help to see what this terminal can do.'],
    unknown: (c) => `command not found: ${c}. Try help.`,
    help: [
      'whoami     who is at this desk',
      'services   what I can build for you',
      'work       projects I have shipped',
      'about      a little more about me',
      'contact    how to reach me',
      'status     am I taking new work',
      'time       the time in Beirut',
      'hire       start a project by email',
      'clear      clean the screen',
      'exit       back to the page',
    ],
    whoami: ['charbel nasseh', 'web developer · sysadmin · Lebanon'],
    status: ['open for new projects', 'usually replies within a working day'],
    about: [
      'I build websites and the systems behind them.',
      'Stores, ERPNext, POS, and the Linux servers they run on.',
    ],
    contact: [`email     ${CONTACT.email}`, `instagram @${CONTACT.instagram}`, 'whatsapp  type hire, or use the button below'],
    hire: ['opening your email app…'],
    sudo: ['nice try. you can hire me instead: type hire'],
    time: (t) => [`${t} in Beirut`],
    opening: (w) => `scrolling to ${w}…`,
  },
}

const ar: Copy = {
  room: {
    hint: 'انقر على أي شيء في الغرفة',
    listLabel: 'أشياء في الغرفة',
    close: 'العودة إلى الغرفة',
    prev: 'السابق',
    next: 'التالي',
    loading: 'الغرفة تستيقظ',
    names: {
      monitor: 'الطرفية',
      charbel: 'شربل',
      server: 'الخوادم',
      books: 'رف الكتب',
      board: 'لوحة الملاحظات',
      clock: 'الساعة',
      window: 'النافذة',
      phone: 'الهاتف',
      print: 'الأرزة',
      lamp: 'مصباح المكتب',
      mug: 'القهوة',
      plant: 'النبتة',
      beanbag: 'الكرسي الطري',
    },
    verbs: {
      monitor: 'اكتب أمراً',
      charbel: 'قل مرحباً',
      server: 'شاهد ما يعمل',
      books: 'اقرأ العناوين',
      board: 'شاهد المشاريع',
      clock: 'اعرف الوقت',
      window: 'انظر إلى الخارج',
      phone: 'تواصل معي',
      print: 'اقرأ اللوحة',
      lamp: 'شغّله أو أطفئه',
      mug: 'رشفة قهوة',
      plant: 'المسها',
      beanbag: 'اجلس',
    },
    cards: {
      charbel: {
        title: 'مرحباً، أنا شربل',
        body: 'مطوّر مواقع ومهندس معلوماتية في لبنان. أبني المواقع والأنظمة التي تعمل خلفها، للشركات هنا وفي الخليج.',
        actions: [
          { label: 'ابدأ مشروعاً', href: '#contact' },
          { label: 'من أنا', href: '#about' },
        ],
      },
      server: {
        title: 'الخوادم والاستضافة',
        body: 'الشاشة الطويلة تعرض حمل الخادم. وتحت المكتب جهاز من النوع الذي أُعدّه وأنشر عليه وأعتني به.',
        items: ['لينكس', 'دوكر', 'بروكسموكس', 'إدارة VPS', 'النشر', 'النسخ الاحتياطي', 'المراقبة'],
        actions: [{ label: 'ماذا أقدّم', href: '#services' }],
      },
      books: {
        title: 'أدواتي',
        body: 'العناوين على الرف هي الأدوات التي أستخدمها كل أسبوع.',
        items: ['WordPress', 'WooCommerce', 'React', 'ERPNext', 'Linux', 'Docker', 'Proxmox'],
        actions: [{ label: 'ماذا أقدّم', href: '#services' }],
      },
      board: {
        title: 'على اللوحة',
        body: 'ثلاثة مشاريع مثبّتة: متجر إلكتروني، ونظام مطاعم، وعلامتي الخاصة.',
        items: ['HÚM، متجر إلكتروني على ووكومرس', 'إدارة المطاعم، ERPNext مع URY', 'MobiTouch، خدمات الويب والمعلوماتية'],
        actions: [{ label: 'شاهد الأعمال', href: '#work' }],
      },
      clock: {
        title: 'توقيت بيروت',
        body: 'توقيت بيروت قريب من توقيت الخليج بساعة أو أقل، فتكون اتصالاتنا ضمن يوم عملك.',
        actions: [{ label: 'ابدأ مشروعاً', href: '#contact' }],
      },
      window: {
        title: 'المنظر من لبنان',
        body: 'تُظهر النافذة سماء بيروت في هذه الساعة: زرقاء نهاراً، برتقالية عند الغروب، ومظلمة ليلاً.',
        actions: [{ label: 'أعمل من لبنان', href: '#places' }],
      },
      phone: {
        title: 'تواصل معي',
        body: 'أخبرني بما تحتاجه وسأرد عليك بالخطوات التالية.',
        actions: [],
      },
      print: {
        title: 'الأرزة',
        body: 'أرزة لبنان، الشجرة التي على العلم. أقدمها ما زال ينمو في غابة أرز الربّ، عالياً في جبل لبنان.',
        actions: [{ label: 'شاهد الصورة', href: '#places' }],
      },
    },
    zones: [
      { city: 'بيروت', zone: 'Asia/Beirut' },
      { city: 'دبي', zone: 'Asia/Dubai' },
      { city: 'الرياض', zone: 'Asia/Riyadh' },
    ],
  },
  meta: {
    title: 'شربل ناصح — مطوّر مواقع ومهندس معلوماتية، لبنان',
    description:
      'شربل ناصح يبني المواقع والمتاجر الإلكترونية وأنظمة ERPNext والخوادم التي تعمل عليها، للشركات في لبنان والخليج.',
  },
  nav: {
    services: 'الخدمات',
    work: 'الأعمال',
    about: 'من أنا',
    contact: 'تواصل',
    switchTo: 'English',
    switchLabel: 'Read this site in English',
    menu: 'القائمة الرئيسية',
    dark: 'الوضع الداكن',
  },
  hero: {
    name: ['شربل', 'ناصح'],
    hiddenRole: '، مطوّر مواقع ومهندس معلوماتية في لبنان',
    lead: 'أبني المواقع والأنظمة التي تعمل خلفها، للشركات في لبنان وفي الخليج.',
    cta: 'ابدأ مشروعاً',
    terminal: 'استخدم الطرفية',
    sceneLabel:
      'نموذج ثلاثي الأبعاد لمكتبي: مطوّر بسمّاعات بلون النعناع يكتب أمام الشاشة، وخادم صغير تحت المكتب، والنافذة تُظهر سماء بيروت الآن.',
    beirut: (time, phase) => `الساعة ${time} في بيروت، ${phase}.`,
    phases: {
      night: 'مصباح المكتب مضاء',
      dawn: 'القهوة الأولى',
      day: 'الخوادم تعمل',
      dusk: 'الشمس تغيب فوق البحر',
    },
  },
  services: {
    heading: 'ماذا أقدّم',
    hint: 'مرّر المؤشر على أي سطر لتقرأ معناه.',
    groups: [
      {
        id: 'web',
        title: 'مواقع ومتاجر',
        summary: 'مواقع ومتاجر سريعة ومصمّمة للهاتف أولاً، تجلب لك الزبائن.',
        items: [
          { name: 'ووردبريس', note: 'مواقع تعدّلها بنفسك بعد التسليم.' },
          { name: 'إلمنتور', note: 'صفحات يغيّرها فريقك من دون الاتصال بي.' },
          { name: 'ريأكت', note: 'واجهات خاصة حين لا يكفي القالب الجاهز.' },
          { name: 'ووكومرس', note: 'متاجر بالمنتجات والمخزون والشحن والدفع.' },
          { name: 'عربي وإنكليزي', note: 'مواقع ثنائية اللغة تُقرأ صحيحاً بالاتجاهين.' },
          { name: 'السرعة', note: 'صفحات تفتح بسرعة على الهاتف وبيانات الجوال.' },
          { name: 'أساسيات البحث', note: 'عناوين وبنية وخرائط موقع ليقرأك غوغل.' },
        ],
      },
      {
        id: 'systems',
        title: 'أنظمة الأعمال',
        summary: 'ERPNext ونقاط بيع تناسب طريقة عمل شركتك.',
        items: [
          { name: 'إعداد ERPNext', note: 'الحسابات والمخزون والمبيعات والمشتريات في نظام واحد.' },
          { name: 'التخصيص', note: 'نماذج وتقارير وفواتير مطبوعة على مقاس عملك.' },
          { name: 'نقاط بيع للمطاعم', note: 'URY على ERPNext: الطاولات والطلبات والمطبخ.' },
          { name: 'نقاط بيع للمتاجر', note: 'صناديق متزامنة دائماً مع مخزونك.' },
          { name: 'الفوترة', note: 'فواتير وإيصالات بعملتك ولغتك.' },
          { name: 'الربط', note: 'وصل الأدوات التي تدفع ثمنها أصلاً.' },
          { name: 'التدريب', note: 'يتعلّم فريقك النظام على بياناتكم.' },
        ],
      },
      {
        id: 'servers',
        title: 'الخوادم والاستضافة',
        summary: 'لينكس ودوكر وبروكسموكس: نشر ونسخ احتياطي ومراقبة.',
        items: [
          { name: 'لينكس', note: 'خوادم أوبونتو وديبيان، مُعدّة ومحدّثة باستمرار.' },
          { name: 'دوكر', note: 'تطبيقات في حاويات، تنتقل وتعيد التشغيل بسلاسة.' },
          { name: 'بروكسموكس', note: 'عدّة أجهزة على خادم فعلي واحد.' },
          { name: 'إدارة VPS', note: 'خوادم سحابية بحجم ما تشغّله فعلاً.' },
          { name: 'النشر', note: 'من الكود على الحاسوب إلى عنوان حيّ على الإنترنت.' },
          { name: 'النسخ الاحتياطي', note: 'نسخ خارج الخادم، واسترجاع مُجرَّب.' },
          { name: 'المراقبة', note: 'تنبيهات قبل أن يلاحظ زبائنك أي شيء.' },
          { name: 'النطاقات والبريد', note: 'عناوين وسجلات وصناديق بريد تعمل ببساطة.' },
        ],
      },
    ],
  },
  work: {
    heading: 'أعمال مختارة',
    sample: 'بيانات تجريبية',
    shots: {
      hum: ['واجهة متجر HÚM: شريط الإعلانات والصورة الرئيسية وثلاثة منتجات بأسعارها.', 'قائمة مجموعات HÚM مع منتج مضاف إلى السلة.'],
      restaurant: ['مخطط طاولات نقطة البيع URY، بيانات تجريبية.', 'تذكرة مطبخ للطاولة 7، بيانات تجريبية.'],
      mobitouch: ['لوحة علامة MobiTouch: مواقع، متاجر، ERPNext، خوادم.', 'طرفية تعرض خدمات MobiTouch وحالتها.'],
    },
    projects: [
      {
        id: 'hum',
        title: 'HÚM',
        lines: ['HÚM'],
        discipline: 'متجر إلكتروني · ووكومرس',
        description: 'متجر إلكتروني للمجوهرات والمسابح.',
        link: { href: 'https://humlb.com', label: 'زُر humlb.com' },
      },
      {
        id: 'restaurant',
        title: 'إدارة المطاعم',
        lines: ['إدارة', 'المطاعم'],
        discipline: 'ERPNext مع URY · قيد التشغيل',
        description: 'الطاولات والطلبات والمطبخ والحسابات في نظام واحد، يعمل في كل خدمة.',
        link: { href: '#contact', label: 'اسألني عنه' },
      },
      {
        id: 'mobitouch',
        title: 'MobiTouch',
        lines: ['MobiTouch'],
        discipline: 'علامتي لخدمات الويب والمعلوماتية',
        description: 'حيث أقدّم عملي للشركات وأسلّمه.',
        link: { href: 'https://mobitouch.tech', label: 'زُر mobitouch.tech' },
      },
    ],
  },
  about: {
    heading: 'من أنا',
    name: 'أنا شربل ناصح،',
    p1: 'مطوّر مواقع ومهندس معلوماتية في لبنان. أبني الموقع الذي يراه زبائنك، والأنظمة التي تعمل عليها شركتك خلفه.',
    p2: 'أي المتجر، ونقطة البيع في المطبخ، والخادم الذي يحمل كل ذلك. أعمل مع المتاجر والمطاعم والشركات هنا، ومع فرق في الخليج تريد شخصاً واحداً يحمل المشروع من اسم النطاق حتى النشر، ويبقى حاضراً بعد الإطلاق.',
    facts: [
      { label: 'المقرّ', value: 'لبنان' },
      { label: 'أعمل مع', value: 'لبنان والخليج' },
      { label: 'اللغات', value: 'العربية والإنكليزية' },
    ],
    photoAlt: 'أرزة لبنانية في الضباب، في غابة أرز الربّ.',
  },
  places: {
    heading: 'أعمل من لبنان',
    corniche: 'كورنيش بيروت من البحر.',
    cedar: 'أرزة في غابة أرز الربّ، جبل لبنان.',
    bay: 'خليج الزيتونة في بيروت ليلاً.',
    note: 'توقيت بيروت قريب من توقيت الخليج بساعة أو أقل، فتكون اتصالاتنا ضمن يوم عملك.',
  },
  contact: {
    heading: 'ابدأ مشروعاً',
    lead: 'أخبرني بما تحتاجه وسأرد عليك بالخطوات التالية.',
    email: CONTACT.email,
    whatsapp: 'راسلني على واتساب',
    instagram: `إنستغرام @${CONTACT.instagram}`,
    place: (t) => `لبنان، الساعة ${t} الآن`,
    status: 'متاح لمشاريع جديدة',
    greeting: 'قل مرحباً',
    greetingLabel: 'اكتب لي بريداً',
    mailSubject: 'مشروع جديد',
    waText: 'مرحباً شربل، لديّ مشروع في بالي.',
    photoAlt: 'خليج الزيتونة في بيروت ليلاً، الأبراج مضاءة فوق المرفأ.',
  },
  footer: {
    contact: 'تواصل',
    pages: 'في هذه الصفحة',
    elsewhere: 'في أماكن أخرى',
    beirut: 'توقيت بيروت',
    lebanon: 'لبنان',
    rights: 'شربل ناصح · لبنان',
    pictures: 'الصور',
    top: 'إلى الأعلى',
  },
  terminal: {
    title: 'charbel@dev — الطرفية',
    close: 'أغلق الطرفية',
    placeholder: 'اكتب help',
    inputLabel: 'أمر الطرفية',
    welcome: ['أهلاً بك على مكتبي. اكتب help لترى ما تستطيع هذه الطرفية فعله.'],
    unknown: (c) => `الأمر غير معروف: ${c}. جرّب help.`,
    help: [
      'whoami     من يجلس إلى هذا المكتب',
      'services   ما أستطيع بناءه لك',
      'work       مشاريع سلّمتها',
      'about      المزيد عني',
      'contact    كيف تصل إليّ',
      'status     هل أقبل عملاً جديداً',
      'time       الساعة في بيروت',
      'hire       ابدأ مشروعاً بالبريد',
      'clear      امسح الشاشة',
      'exit       العودة إلى الصفحة',
    ],
    whoami: ['شربل ناصح', 'مطوّر مواقع · مدير أنظمة · لبنان'],
    status: ['متاح لمشاريع جديدة', 'أرد عادةً خلال يوم عمل'],
    about: ['أبني المواقع والأنظمة التي تعمل خلفها.', 'متاجر، ERPNext، نقاط بيع، وخوادم لينكس.'],
    contact: [`البريد     ${CONTACT.email}`, `إنستغرام  @${CONTACT.instagram}`, 'واتساب    اكتب hire أو استخدم الزر أدناه'],
    hire: ['جارٍ فتح تطبيق البريد…'],
    sudo: ['محاولة لطيفة. يمكنك توظيفي بدلاً من ذلك: اكتب hire'],
    time: (t) => [`الساعة ${t} في بيروت`],
    opening: (w) => `الانتقال إلى ${w}…`,
  },
}

export const COPY: Record<Lang, Copy> = { en, ar }
export type { Copy }

/** Pictures found in open collections; credited in the footer. */
export const CREDITS = [
  {
    title: 'Beirut Corniche from Sea',
    creator: 'Wusel007',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Beirut_Corniche_from_Sea.JPG',
  },
  {
    title: 'Cedar of Lebanon (Cedar of God), Lebanon',
    creator: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    page: 'https://commons.wikimedia.org/w/index.php?curid=92872076',
  },
  {
    title: 'Zaytunay Bay, Beirut',
    creator: 'abdallahh',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    page: 'https://www.flickr.com/photos/22168167@N00/11182732765',
  },
]
