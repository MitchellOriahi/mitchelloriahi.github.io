/**
 * site.ts
 * Every piece of editable copy on the site, typed so a typo in a key is a build
 * error rather than a blank space on the page.
 *
 * House style: no em dashes anywhere in user facing copy. Use commas, colons,
 * "to" for ranges, or start a new sentence.
 *
 * Highlighting: strings may carry **double asterisk** markers. Components run
 * them through the shared highlight() helper, which renders the marked words
 * as accented <strong> text. Keep highlights to the words that carry numbers
 * or outcomes, not whole clauses.
 */

/* ---------------------------------------------------------------------------
   SHARED TYPES
   ------------------------------------------------------------------------ */

/**
 * A pre-generated responsive image set produced by tools/build-images.ps1.
 * `widths` must match the files actually on disk; `w`/`h` are the intrinsic
 * dimensions of the largest one, used to reserve layout space.
 */
export interface ImageRef {
    slug: string;
    widths: readonly number[];
    w: number;
    h: number;
    ext?: 'jpg' | 'png';
    alt: string;
}

export interface VideoRef {
    src: string;
    poster: string;
    /** Intrinsic pixel size, so layout can reserve space. */
    w: number;
    h: number;
}

export type ProjectKind = 'hardware' | 'software';

export interface FeaturedProject {
    slug: string;
    index: string;
    title: string;
    kind: ProjectKind;
    role: string;
    org: string;
    period: string;
    status?: string;
    summary: string;
    /** Bullet lines; may contain **highlight** markers. */
    detail: string[];
    metrics: { value: string; label: string }[];
    stack: string[];
    gallery: ImageRef[];
    /** Shown inline at natural aspect, never cropped. */
    video?: VideoRef;
    accent: 'marigold' | 'clay' | 'moss';
}

export interface CompactProject {
    slug: string;
    title: string;
    kind: ProjectKind;
    context: string;
    when: string;
    desc: string;
    stack: string[];
    gallery: ImageRef[];
    video?: VideoRef;
}

export interface Role {
    title: string;
    org: string;
    location: string;
    period: string;
    current?: boolean;
    /** Renders as a slimmer entry: for the jobs that shaped me outside engineering. */
    compact?: boolean;
    logo?: ImageRef;
    /** May contain **highlight** markers. */
    points: string[];
    metrics?: string[];
    stack?: string[];
}

/* ---------------------------------------------------------------------------
   IDENTITY
   ------------------------------------------------------------------------ */
export const SITE = {
    name: 'Mitchell Oriahi',
    shortName: 'Mitchell',
    title: 'Mitchell Oriahi, Embedded and Software Engineer',
    role: 'Embedded and Software Engineer',
    description:
        'Mitchell Oriahi builds from the circuit board to the cloud: microcontrollers, custom hardware, and the software and pipelines around them. Computer Engineering at Texas Tech, graduating May 2027.',
    origin: 'https://mitchelloriahi.github.io',
    email: 'MitchelOkuezeOriahi@gmail.com',
    linkedin: 'https://www.linkedin.com/in/mitchell-oriahi-ce',
    github: 'https://github.com/MitchellOriahi',
    resume: '/resume.pdf',
    baseLocation: 'Houston, TX',
    schoolLocation: 'Lubbock, TX',
    availability: 'Open to full time roles',
    graduation: 'May 2027',
} as const;

/* ---------------------------------------------------------------------------
   NAVIGATION
   ------------------------------------------------------------------------ */
export const NAV = [
    { id: 'experience', label: 'Experience' },
    { id: 'work', label: 'Projects' },
    { id: 'toolkit', label: 'Toolkit' },
    { id: 'about', label: 'About' },
] as const;

/* ---------------------------------------------------------------------------
   SHARED IMAGE REFS
   ------------------------------------------------------------------------ */
const LOGO_CBA: ImageRef = {
    slug: 'logo-cba', widths: [96, 192], w: 192, h: 108,
    alt: 'Christian Brothers Automotive',
};
const LOGO_TTU: ImageRef = {
    slug: 'logo-ttu', widths: [96, 192], w: 192, h: 225, ext: 'png',
    alt: 'Texas Tech University',
};

/* ---------------------------------------------------------------------------
   HERO
   ------------------------------------------------------------------------ */
export const HERO = {
    greeting: "Hi, I'm Mitchell.",
    // `accent` renders in italic marigold inside the display heading.
    headlineBefore: 'From the circuit board ',
    headlineAccent: 'to the cloud',
    headlineAfter: '.',
    lede: `I'm a Computer Engineering senior at Texas Tech, equally at home
           programming microcontrollers, designing custom hardware, and building
           the cloud software that ships around them. I enjoy every stage of a
           build, from first sketch to finished product.`,
    facts: [
        { value: '3.46', label: 'GPA / 4.00' },
        { value: 'B.S. + M.S.', label: 'Accelerated track' },
        { value: 'May 2027', label: 'Graduating' },
    ],
    portrait: {
        slug: 'portrait-cutout', widths: [600, 900, 1200], w: 1200, h: 1423,
        ext: 'png' as const,
        alt: 'Mitchell Oriahi',
    },
} as const;

/* ---------------------------------------------------------------------------
   PROOF SQUARES
   Four cards: both internships, the research post, and the degree.
   `logo` picks the mark: 'cba' | 'ttu' | 'coe'. The CoE card renders a text
   lockup of the Whitacre College wordmark beside the Double T.
   ------------------------------------------------------------------------ */
export interface ProofCard {
    role: string;
    org: string;
    note: string;
    period: string;
    logo: 'cba' | 'ttu' | 'coe';
}

export const PROOF: ProofCard[] = [
    {
        role: 'Software Engineer Intern',
        org: 'Christian Brothers Automotive',
        note: 'SDET, canary releases, test automation',
        period: 'Summer 2026',
        logo: 'cba',
    },
    {
        role: 'Data Engineering Intern',
        org: 'Christian Brothers Automotive',
        note: 'Cloud data pipelines on Azure',
        period: 'Summer 2025',
        logo: 'cba',
    },
    {
        role: 'Semiconductor Researcher',
        org: 'TTU Nano Tech Center',
        note: 'Microfabrication and metrology',
        period: '2026 to present',
        logo: 'ttu',
    },
    {
        role: 'B.S. Computer Engineering',
        org: 'Whitacre College of Engineering',
        note: 'Accelerated M.S. track',
        period: 'Class of 2027',
        logo: 'coe',
    },
];

/** Scrolling technology ticker under the proof squares. */
export const TICKER = [
    'Microcontrollers', 'FreeRTOS', 'C', 'Python', 'Azure DevOps', 'CI/CD',
    'PCB design', 'TouchGFX', 'Verilog', 'Cosmos DB', 'MySQL', 'Linux',
    'Oscilloscope', 'AutoCAD', 'LTspice', 'Java', 'SPI', 'I2C', 'UART', 'DMA',
] as const;

/* ---------------------------------------------------------------------------
   EXPERIENCE
   ------------------------------------------------------------------------ */
export const ROLES: Role[] = [
    {
        title: 'Software Engineer Intern, SDET',
        org: 'Christian Brothers Automotive',
        location: 'Katy, TX',
        period: 'May 2026 to Aug 2026',
        logo: LOGO_CBA,
        points: [
            'Built a **canary release system** on Azure deployment slots that ramps live production traffic from **0 to 25 percent** and alerts the deploying engineer. Now standard across **7 major services**.',
            'Automated **cross service regression testing**: publishing a shared Python library triggers pipelines that deploy 5 consuming services and test **48 endpoints** against the new version.',
            'Cut release verification to **under 5 minutes** with an Azure Function that turns pipeline results into per service pass, fail, and trace reports delivered to **Slack**.',
            'Migrated **4 production services** from Python 3.10 to 3.13 ahead of an Azure runtime deprecation.',
            'Built a **self updating documentation site** covering **46 Azure DevOps projects**, refreshed daily from each repository.',
        ],
        metrics: ['7 services on canary', '48 endpoints tested', 'Verify in under 5 min'],
        stack: ['Azure DevOps', 'Python', 'CI/CD', 'Azure Functions', 'Slack API'],
    },
    {
        title: 'Undergraduate Research Assistant',
        org: 'Texas Tech Nano Tech Center',
        location: 'Lubbock, TX',
        period: 'Jan 2026 to Present',
        current: true,
        logo: LOGO_TTU,
        points: [
            'Design **photolithography masks** in AutoCAD for test structures that measure how semiconductor sample resistance shifts with **voltage and temperature**.',
            'Pattern and deposit **gold contacts** through photoresist lithography, etching, and development across **15+ documented fabrication runs**, improving repeatability for the lab.',
            'Deliver **surface topography data** to 5+ faculty and student researchers through Profilm3D optical profilometry.',
        ],
        metrics: ['15+ fabrication runs', '5+ researchers supported'],
        stack: ['AutoCAD', 'Photolithography', 'Thin film deposition', 'Profilometry'],
    },
    {
        title: 'Data Engineering Intern',
        org: 'Christian Brothers Automotive',
        location: 'Katy, TX',
        period: 'May 2025 to Aug 2025',
        logo: LOGO_CBA,
        points: [
            'Replaced a manual ingestion process with a **Python and Azure Functions pipeline** that pulls **10+ new vehicle records weekly** from external REST APIs into MySQL and **Azure Cosmos DB** for the appointment scheduler behind every CBA shop.',
            'Engineered **change detection logic** with an approval workflow through **Azure Queues and Slack**, so only new or modified records are processed, cutting redundant database writes by **90 percent**.',
            'Built the transform layer as a **modular, production ready application** that filters and shapes records before insertion, with Cosmos DB tracking every change for **traceability across environments**.',
            'Integrated Cosmos DB, MySQL, and Storage Queues into one **message based architecture** carrying data reliably across dev, staging, and production.',
        ],
        metrics: ['10+ records weekly', '90% fewer redundant writes', '3 environments'],
        stack: ['Python', 'Azure Functions', 'MySQL', 'Cosmos DB', 'Storage Queues', 'REST APIs'],
    },
];

/* ---------------------------------------------------------------------------
   FEATURED PROJECTS
   ------------------------------------------------------------------------ */
export const FEATURED: FeaturedProject[] = [
    {
        slug: 'aprs',
        index: '01',
        title: 'APRS GPS Tracking System',
        kind: 'hardware',
        role: 'Team Lead',
        org: 'TTU ECE 3334',
        period: 'Jan 2026 to May 2026',
        accent: 'marigold',
        summary: `A GPS tracker that packetizes its own position and puts it on the
                  air over VHF and UHF radio, built on an STM32 NUCLEO board.`,
        detail: [
            'Designed a **GPS tracking system** that transmits packetized position data over **VHF and UHF radio**.',
            'Wrote the **Bell 202 software modem** that pushes APRS frames out through the DAC over DMA and decodes them back, carrying frames **end to end** with accurate positioning.',
            'Validated framing, timing, and serial data handling with an **oscilloscope** and UART debugging before touching the RF stage.',
        ],
        metrics: [
            { value: '1200', label: 'Baud link' },
            { value: 'End to end', label: 'TX and RX path' },
        ],
        stack: ['STM32', 'C', 'DMA', 'DAC / ADC', 'APRS', 'RF'],
        gallery: [
            {
                slug: 'proj-aprs-board', widths: [400, 800, 1400], w: 1400, h: 1867,
                alt: 'The APRS presentation board with the tracker hardware and handheld radios',
            },
            {
                slug: 'proj-aprs-team', widths: [400, 800, 1400], w: 1400, h: 1511,
                alt: 'The team presenting the APRS tracking system',
            },
        ],
    },
    {
        slug: 'wav-player',
        index: '02',
        title: 'STM32 WAV Audio Player',
        kind: 'hardware',
        role: 'Solo design and build',
        org: 'Personal project',
        period: 'Jan 2026 to May 2026',
        accent: 'clay',
        summary: `A touchscreen music player running FreeRTOS on bare hardware,
                  with gap free playback and an SD card library you can browse.`,
        detail: [
            'Built a **FreeRTOS music player** with a TouchGFX touchscreen interface: browse an SD card, then play, pause, skip, seek, and shuffle with elapsed time on screen.',
            'Kept playback **gap free** with a double buffered DMA pipeline that refills one half of the audio buffer while the DAC plays the other, clocked by a hardware timer.',
            'Split the firmware into **four FreeRTOS tasks** with a mutex guarding the SD card, so the screen stays responsive and the player **recovers automatically** when a card is pulled mid song.',
        ],
        metrics: [
            { value: '4', label: 'FreeRTOS tasks' },
            { value: '0', label: 'Audio dropouts' },
        ],
        stack: ['FreeRTOS', 'TouchGFX', 'FatFS', 'SDIO', 'DMA', 'C'],
        gallery: [
            {
                slug: 'proj-wav-player', widths: [400, 800, 1400], w: 1400, h: 1867,
                alt: 'The Discovery board running the player, mid song on the touchscreen',
            },
        ],
    },
    {
        slug: 'battlebot',
        index: '03',
        title: 'Red Raider Battle Bot',
        kind: 'hardware',
        role: 'Team Lead',
        org: 'TTU ECE 3331',
        period: 'Aug 2025 to Dec 2025',
        accent: 'moss',
        summary: `A combat robot built from the ground up: custom firmware, a
                  custom power board, a hand built controller, and armor that had
                  to survive a real match.`,
        detail: [
            'Programmed an **MSP430** in C for PWM motor control and a custom **IR remote link** on a UART style protocol, driving the motors through an H bridge.',
            'Designed a **custom PCB** with MOSFET weapon drive, protection circuitry, and **overcurrent limits** for high load conditions.',
            'Built our own **breadboard controller**, and 3D printed the armor dome, front plow, and hammer mount.',
            'Debugged it all on **oscilloscope and multimeter**, documenting edge cases until control was boringly reliable.',
        ],
        metrics: [
            { value: '10 lb', label: 'Weight class' },
            { value: '40 ft', label: 'Control range' },
        ],
        stack: ['MSP430', 'C', 'PWM', 'PCB design', 'IR comms', '3D printing'],
        gallery: [
            {
                slug: 'proj-combat-robot', widths: [400, 800, 1400], w: 1400, h: 1867,
                alt: 'The combat robot on the workbench',
            },
            {
                slug: 'proj-combat-robot-team', widths: [400, 800, 1400], w: 1400, h: 933,
                alt: 'The team with the robot on demonstration day',
            },
        ],
        video: {
            src: '/video/combat-robot.mp4',
            poster: '/video/combat-robot-poster.jpg',
            w: 720, h: 1280,
        },
    },
];

/* ---------------------------------------------------------------------------
   MORE PROJECTS
   ------------------------------------------------------------------------ */
export const PROJECTS_MORE: CompactProject[] = [
    {
        slug: 'amplifier',
        title: 'Audio Power Amplifier',
        kind: 'hardware',
        context: 'ECE 3311, circuit design',
        when: 'Nov 2025',
        desc: `A 3 stage discrete BJT amplifier designed and simulated in LTspice:
               5 mV in, over 10 W out across a 4 ohm speaker, through a Darlington
               Class AB push pull output stage with audio band filtering.`,
        stack: ['LTspice', 'BJT', 'Class AB', 'Filter design'],
        gallery: [{
            slug: 'proj-amplifier', widths: [400, 800, 1400], w: 1400, h: 648,
            alt: 'LTspice schematic of the three stage amplifier',
        }],
    },
    {
        slug: 'cos',
        title: 'Customer Order System',
        kind: 'software',
        context: 'CS 2365, object oriented programming',
        when: 'May 2026',
        desc: `A full Java retail application: secure login with multi factor
               authentication, a browsable catalog, cart, and complete order
               processing. Multi class OOP design documented in UML, delivered as
               both a console and a GUI app.`,
        stack: ['Java', 'OOP', 'Swing GUI', 'UML'],
        gallery: [{
            slug: 'proj-cos-uml', widths: [400, 800], w: 800, h: 1067, ext: 'png',
            alt: 'UML class diagram for the customer order system',
        }],
    },
    {
        slug: 'ledsprite',
        title: 'LED Sprite Matrix',
        kind: 'hardware',
        context: 'Microcontrollers with Assembly',
        when: 'Apr 2025',
        desc: `An ATmega328P programmed in AVR Assembly driving a MAX7219 LED
               matrix over SPI. Custom sprite data for 3+ pixel art images, with
               debounced pushbutton input to cycle them in real time.`,
        stack: ['ATmega328P', 'AVR Assembly', 'SPI', 'MAX7219'],
        gallery: [{
            slug: 'proj-led-sprite', widths: [400, 800], w: 800, h: 1422,
            alt: 'The LED dot matrix showing a pixel art sprite',
        }],
        video: {
            src: '/video/led-sprite.mp4',
            poster: '/video/led-sprite-poster.jpg',
            w: 720, h: 1280,
        },
    },
    {
        slug: 'robowars',
        title: 'ROBOWARS 2024',
        kind: 'hardware',
        context: 'Competition, 4th place',
        when: 'Nov 2024',
        desc: `A 10 hour robotics challenge: design and build a working robot in a
               team of six with Arduino, 3D printing, and whatever materials the
               clock allowed. Took 4th place among the competing teams.`,
        stack: ['Arduino', '3D printing', 'Rapid prototyping'],
        gallery: [
            {
                slug: 'proj-robowars-a', widths: [400, 800, 1400], w: 1400, h: 1867,
                alt: 'The ROBOWARS competition robot close up',
            },
            {
                slug: 'proj-robowars-b', widths: [400, 800, 1400], w: 1400, h: 1050,
                alt: 'The team after securing fourth place',
            },
        ],
    },
    {
        slug: 'power',
        title: 'Power Consumption Forecasting',
        kind: 'software',
        context: 'Data science',
        when: 'Dec 2023',
        desc: `Regression models forecasting energy demand across three urban
               zones of Tetuan, Morocco from real weather data, wrapped in an
               interactive tool with live user input and automated data updates.`,
        stack: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib'],
        gallery: [{
            slug: 'proj-power-analysis', widths: [400, 800, 1400], w: 1400, h: 811,
            alt: 'Charts of power consumption across three urban zones',
        }],
    },
    {
        slug: 'website',
        title: 'This Website',
        kind: 'software',
        context: 'Personal',
        when: '2026',
        desc: `Designed and built from scratch: Astro, TypeScript, Tailwind, and
               GSAP, with a media pipeline that turns phone photos into responsive
               WebP. You are looking at it.`,
        stack: ['Astro', 'TypeScript', 'Tailwind', 'GSAP'],
        gallery: [],
    },
];

/* ---------------------------------------------------------------------------
   TOOLKIT
   ------------------------------------------------------------------------ */
export const TOOLKIT = [
    {
        name: 'Languages',
        items: ['C', 'Python', 'Java', 'AVR Assembly', 'Verilog', 'JavaScript', 'HTML', 'CSS'],
    },
    {
        name: 'Embedded',
        items: ['FreeRTOS', 'Register programming', 'DMA', 'Interrupts', 'Device drivers', 'STM32 HAL', 'CubeMX', 'TouchGFX', 'FatFS'],
    },
    {
        name: 'Hardware and protocols',
        items: ['STM32', 'MSP430', 'ATmega328P', 'UART', 'SPI', 'I2C', 'SDIO', 'AFSK', 'PWM', 'PCB design'],
    },
    {
        name: 'Tools and lab',
        items: ['Git', 'Azure DevOps', 'CI/CD', 'MySQL', 'Cosmos DB', 'REST APIs', 'Linux', 'Oscilloscope', 'LTspice', 'AutoCAD'],
    },
] as const;

/* ---------------------------------------------------------------------------
   EDUCATION
   ------------------------------------------------------------------------ */
export const EDUCATION = {
    school: 'Texas Tech University',
    college: 'Edward E. Whitacre Jr. College of Engineering',
    location: 'Lubbock, TX',
    degree: 'B.S. Computer Engineering',
    track: 'Accelerated M.S. Electrical Engineering',
    gpa: '3.46',
    graduation: 'May 2027',
    honors: ["President's Honor List", "Dean's Honor List"],
    coursework: [
        'Embedded Systems',
        'Microcontrollers with Assembly',
        'Electronics',
        'Circuits',
        'Signals and Systems',
        'Control Systems',
        'Network Analysis',
        'Digital Communications Project Lab',
        'Robotics Project Lab',
        'FPGA Project Lab',
        'Microprocessor Architecture',
        'Data Structures and Algorithms',
        'Object Oriented Programming',
    ],
} as const;

/* ---------------------------------------------------------------------------
   ABOUT
   ------------------------------------------------------------------------ */
export const ABOUT = {
    paragraphs: [
        `I'm from Houston. I got into engineering the way most people get into
         anything they love: I wanted to know how things actually work, and I
         never stopped asking.`,
        `Texas Tech gave that curiosity somewhere to go. Since then I've led
         project teams, spent summers building software that real businesses run
         on, and done research in a cleanroom. Every one of those rooms taught me
         something a classroom could not.`,
        `The throughline is simple: I like people, I like hard problems, and I do
         my best work when both are in the room.`,
    ],
} as const;

/** Small, warm, zero jargon. The pitch is the vibe, not the resume. */
export const HOW_I_WORK = [
    {
        title: 'Bring good energy',
        body: 'Teams run on morale as much as skill. I show up positive, ask real questions, and hand out credit loudly.',
    },
    {
        title: 'Finish what I start',
        body: 'Done means tested, documented, and easy for the next person to pick up.',
    },
    {
        title: 'Stay teachable',
        body: 'Every project and every teammate has something to teach. I would rather learn it than pretend I knew it.',
    },
] as const;

export interface Pastime {
    title: string;
    body: string;
    images: ImageRef[];
}

export const BEYOND: Pastime[] = [
    {
        title: 'Training',
        body: 'The gym is a fixed part of my week, and I train Muay Thai and jiu jitsu. It is the fastest way I know to stay sharp.',
        images: [
            { slug: 'beyond-gym', widths: [400, 800], w: 800, h: 1399, alt: 'Training at the gym' },
            { slug: 'beyond-mma', widths: [400, 800, 1400], w: 1400, h: 1050, alt: 'With the Muay Thai and jiu jitsu team' },
        ],
    },
    {
        title: 'Cooking',
        body: 'I cook most days. It scratches the same itch as engineering: read the system, adjust one variable, taste the result.',
        images: [
            { slug: 'beyond-cooking-a', widths: [400, 800, 1400], w: 1400, h: 1867, alt: 'Cooking at home' },
            { slug: 'beyond-cooking-b', widths: [400, 800, 1400], w: 1400, h: 1867, alt: 'A finished dish' },
        ],
    },
    {
        title: 'Trails',
        body: 'Good trails and long views. Getting away from a screen is how I reset between builds.',
        images: [
            { slug: 'beyond-hiking-a', widths: [400, 800, 1400], w: 1400, h: 1050, alt: 'Hiking a ridgeline' },
            { slug: 'beyond-hiking-b', widths: [400, 800, 1400], w: 1400, h: 1867, alt: 'Resting on a hike' },
        ],
    },
];

/* ---------------------------------------------------------------------------
   SCRIPTURE
   ------------------------------------------------------------------------ */
export const SCRIPTURE = {
    text: 'Whatever you do, work at it with all your heart.',
    cite: 'Colossians 3:23',
} as const;
