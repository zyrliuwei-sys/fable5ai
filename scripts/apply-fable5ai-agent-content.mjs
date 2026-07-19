// One-shot content rewriter: pivots Fable5AI from "AI Design Tool" to
// "All-in-One AI Agent" (referencing chatlyai.app/agent / OmniAgent).
// Updates both messages/en.json and messages/zh.json. Idempotent on values.
import { readFileSync, writeFileSync } from 'node:fs';

const root = process.cwd();
const enPath = `${root}/messages/en.json`;
const zhPath = `${root}/messages/zh.json`;
const en = JSON.parse(readFileSync(enPath, 'utf8'));
const zh = JSON.parse(readFileSync(zhPath, 'utf8'));

// key -> { en, zh }
const CONTENT = {
  // ---- Metadata ----
  'common.metadata.description': {
    en: 'Fable5AI — The all-in-one AI agent. Chat, generate documents, slides, images, videos, and music from a single intelligent assistant.',
    zh: 'Fable5AI —— 全能 AI 智能体。一个助手，搞定对话、文档、幻灯片、图片、视频和音乐创作。',
  },

  // ---- Nav ----
  'landing.nav.features': { en: 'Features', zh: '功能' },
  'landing.nav.pricing': { en: 'Pricing', zh: '价格' },

  // ---- Hero ----
  'landing.hero.headline': {
    en: 'One agent. Infinite possibilities.',
    zh: '一个智能体，无限可能。',
  },
  'landing.hero.subheadline': {
    en: 'Fable5AI is the all-in-one AI agent that chats, writes, and creates. Generate documents, slides, images, videos, and music — and run deep research — all from a single conversation. Just ask.',
    zh: 'Fable5AI 是一个全能 AI 智能体，能对话、能写作、能创作。文档、幻灯片、图片、视频、音乐，还有深度研究——一次对话全部搞定。直接开口问就好。',
  },
  'landing.hero.cta': { en: 'Start for free', zh: '免费开始' },
  'landing.hero.secondary': { en: 'See how it works', zh: '了解工作方式' },
  'landing.hero.waitlist.placeholder': {
    en: 'Ask Fable5AI to write, design, or create…',
    zh: '让 Fable5AI 帮你写作、设计或创作……',
  },
  'landing.hero.waitlist.button': { en: 'Start chatting', zh: '开始对话' },
  'landing.hero.waitlist.success': {
    en: "You're on the list! We'll notify you when we launch.",
    zh: '已加入候补名单！上线时我们会通知你。',
  },
  'landing.hero.waitlist.duplicate': {
    en: "You're already on the waitlist!",
    zh: '你已经在候补名单中啦！',
  },
  'landing.hero.waitlist.error': {
    en: 'Something went wrong. Please try again.',
    zh: '出了点问题，请重试。',
  },
  'landing.hero.prompt_hint': {
    en: 'No credit card required',
    zh: '无需信用卡',
  },

  // ---- Capability chips (OmniAgent-style pills) ----
  'landing.chips.auth': { en: 'AI Chat', zh: 'AI 对话' },
  'landing.chips.payment': { en: 'Documents', zh: 'AI 文档' },
  'landing.chips.subscription': { en: 'Slides', zh: 'AI 幻灯片' },
  'landing.chips.credits': { en: 'Images', zh: 'AI 图片' },
  'landing.chips.rbac': { en: 'Video', zh: 'AI 视频' },
  'landing.chips.i18n': { en: 'Music', zh: 'AI 音乐' },
  'landing.chips.cms': { en: 'Deep Research', zh: '深度研究' },
  'landing.chips.apikeys': { en: 'Code', zh: 'AI 编程' },

  // ---- Features section ----
  'landing.features.title': {
    en: 'One agent for everything you create',
    zh: '一个智能体，搞定你的所有创作',
  },
  'landing.features.description': {
    en: 'Fable5AI brings chat, content, and media generation into a single intelligent workflow — so you can go from idea to finished output in one place.',
    zh: 'Fable5AI 把对话、内容创作与多媒体生成整合进一个智能工作流——从想法到成品，一站完成。',
  },
  'landing.features.auth.title': { en: 'Unified AI Chat', zh: '统一 AI 对话' },
  'landing.features.auth.description': {
    en: 'Have natural, context-aware conversations. Fable5AI remembers context across messages, so every reply builds on the last.',
    zh: '自然、懂上下文的对话体验。Fable5AI 跨消息记住上下文，每一次回复都建立在之前的基础上。',
  },
  'landing.features.payment.title': { en: 'Documents & Slides', zh: '文档与幻灯片' },
  'landing.features.payment.description': {
    en: 'Turn a short prompt into polished documents, reports, and presentation decks — structured, on-brand, and ready to share.',
    zh: '把一段简短提示词变成精致的文档、报告和演示幻灯片——结构清晰、风格统一，可直接分享。',
  },
  'landing.features.rbac.title': { en: 'Image Creation', zh: '图片创作' },
  'landing.features.rbac.description': {
    en: 'Generate photorealistic images, illustrations, and artwork from a text description. Iterate on style, layout, and composition in seconds.',
    zh: '用文字描述生成写实图片、插画和艺术作品。风格、版式、构图，几秒内反复调整。',
  },
  'landing.features.i18n.title': { en: 'Video Generation', zh: '视频生成' },
  'landing.features.i18n.description': {
    en: 'Create short videos and animations from a single prompt — intros, promos, and social clips with no timeline or editing software.',
    zh: '用一段提示词生成短视频和动画——片头、宣传片、社媒短片，无需时间轴或剪辑软件。',
  },
  'landing.features.cms.title': { en: 'Music & Audio', zh: '音乐与音频' },
  'landing.features.cms.description': {
    en: 'Compose original music, loops, and soundtracks in any genre or mood. Royalty-free audio for your videos, games, and projects.',
    zh: '创作任意风格、任意情绪的原创音乐、循环和配乐。可用于视频、游戏和项目的免版税音频。',
  },
  'landing.features.credits.title': { en: 'Deep Research', zh: '深度研究' },
  'landing.features.credits.description': {
    en: 'Let the agent browse the web, read sources, and return cited, synthesized research on any topic — answers you can trust.',
    zh: '让智能体浏览网页、阅读来源，针对任意主题给出带引用的综合研究——值得信赖的答案。',
  },

  // ---- Features showcase sub-section ----
  'landing.features.showcase.title': {
    en: 'Built to think, not just generate',
    zh: '会思考，而不仅仅是生成',
  },
  'landing.features.showcase.description': {
    en: 'Fable5AI plans, reasons, and uses tools — so complex tasks finish themselves.',
    zh: 'Fable5AI 会规划、会推理、会用工具——复杂任务自己跑完。',
  },
  'landing.features.showcase.memory.title': { en: 'Context Memory', zh: '上下文记忆' },
  'landing.features.showcase.memory.description': {
    en: 'Carries context across the whole conversation, so you never repeat yourself.',
    zh: '贯穿整段对话保留上下文，无需重复说明。',
  },
  'landing.features.showcase.tools.title': { en: 'Tool Use', zh: '工具调用' },
  'landing.features.showcase.tools.description': {
    en: 'Searches the web, runs code, and calls APIs to get real work done.',
    zh: '搜索网页、运行代码、调用 API，真正把事情做完。',
  },
  'landing.features.showcase.multimodal.title': { en: 'Multi-Modal', zh: '多模态' },
  'landing.features.showcase.multimodal.description': {
    en: 'Reads images, writes text, and renders media — all in the same thread.',
    zh: '看图、写文、生成媒体，全部在同一段对话里完成。',
  },
  'landing.features.showcase.fast.title': { en: 'Fast & Reliable', zh: '快速可靠' },
  'landing.features.showcase.fast.description': {
    en: 'Streaming responses and resilient fallbacks keep your work moving.',
    zh: '流式响应加上弹性回退，让你的工作持续推进。',
  },

  // ---- Pricing ----
  'landing.pricing.title': { en: 'Pricing', zh: '价格' },
  'landing.pricing.description': {
    en: 'Start free. Upgrade when you are ready to create more.',
    zh: '免费开始，需要更多算力时再升级。',
  },
  'landing.pricing.monthly': { en: 'Monthly', zh: '按月' },
  'landing.pricing.yearly': { en: 'Yearly', zh: '按年' },
  'landing.pricing.lifetime': { en: 'Lifetime', zh: '终身' },
  'landing.pricing.popular': { en: 'Popular', zh: '热门' },
  'landing.pricing.best_value': { en: 'Best value', zh: '最超值' },
  'landing.pricing.buy_lifetime': { en: 'Buy once', zh: '一次买断' },
  'landing.pricing.starter': { en: 'Starter', zh: '入门版' },
  'landing.pricing.starter_desc': {
    en: 'For trying Fable5AI',
    zh: '适合体验 Fable5AI',
  },
  'landing.pricing.pro': { en: 'Pro', zh: '专业版' },
  'landing.pricing.pro_desc': {
    en: 'For creators and professionals',
    zh: '适合创作者与专业人士',
  },
  'landing.pricing.enterprise': { en: 'Enterprise', zh: '企业版' },
  'landing.pricing.enterprise_desc': {
    en: 'For teams and power users',
    zh: '适合团队与重度用户',
  },
  'landing.pricing.feature_1_project': {
    en: '300 agent messages / month',
    zh: '每月 300 条智能体消息',
  },
  'landing.pricing.feature_5k_credits': {
    en: '200 media generations',
    zh: '200 次媒体生成',
  },
  'landing.pricing.feature_email_support': {
    en: 'Community support',
    zh: '社区支持',
  },
  'landing.pricing.feature_unlimited_projects': {
    en: 'Unlimited messages',
    zh: '无限消息',
  },
  'landing.pricing.feature_50k_credits': {
    en: '1,000 media generations / month',
    zh: '每月 1,000 次媒体生成',
  },
  'landing.pricing.feature_priority_support': {
    en: 'Priority support',
    zh: '优先支持',
  },
  'landing.pricing.feature_api_access': { en: 'API access', zh: 'API 访问' },
  'landing.pricing.feature_everything_pro': {
    en: 'Everything in Pro',
    zh: '包含专业版全部功能',
  },
  'landing.pricing.feature_unlimited_credits': {
    en: 'Higher rate limits',
    zh: '更高的速率上限',
  },
  'landing.pricing.feature_dedicated_support': {
    en: 'Dedicated account manager',
    zh: '专属客户经理',
  },
  'landing.pricing.feature_custom_integrations': {
    en: 'Custom agent fine-tuning',
    zh: '自定义智能体微调',
  },

  // ---- FAQ ----
  'landing.faq.title': { en: 'Frequently asked questions', zh: '常见问题' },
  'landing.faq.description': {
    en: 'Everything you need to know about the Fable5AI agent.',
    zh: '关于 Fable5AI 智能体，你想知道的都在这里。',
  },
  'landing.faq.stack.question': {
    en: 'What can Fable5AI do?',
    zh: 'Fable5AI 能做什么？',
  },
  'landing.faq.stack.answer': {
    en: 'Fable5AI is an all-in-one AI agent. In a single conversation you can chat, write documents and slides, generate images, videos, and music, and run cited deep research. Describe what you want in plain language and the agent handles the rest.',
    zh: 'Fable5AI 是一个全能 AI 智能体。在同一段对话里，你可以聊天、写文档和幻灯片、生成图片、视频和音乐，还能进行带引用的深度研究。用大白话描述你的需求，剩下的交给智能体。',
  },
  'landing.faq.payment.question': {
    en: 'How do credits work?',
    zh: '积分是怎么计算的？',
  },
  'landing.faq.payment.answer': {
    en: 'Each generation — a message, image, video, or music track — consumes a small number of credits. Every account starts with free credits, and paid plans add a monthly allowance. Unused credits carry over within your billing period.',
    zh: '每一次生成——一条消息、一张图片、一段视频或一首音乐——都会消耗少量积分。每个账号都有免费起始积分，付费计划会按月追加额度。计费周期内未用完的积分可顺延。',
  },
  'landing.faq.database.question': {
    en: 'Which AI models power Fable5AI?',
    zh: 'Fable5AI 背后用的是什么模型？',
  },
  'landing.faq.database.answer': {
    en: 'Fable5AI routes each task to the best model for the job — frontier language models for chat and writing, and state-of-the-art media models for images, video, and music. You always get the strongest result without picking models yourself.',
    zh: 'Fable5AI 会把每个任务交给最合适的模型——前沿语言模型负责对话与写作，顶尖媒体模型负责图片、视频和音乐。无需自己挑模型，始终获得最强效果。',
  },
  'landing.faq.customize.question': {
    en: 'Can I use what I create commercially?',
    zh: '我创作的内容可以商用吗？',
  },
  'landing.faq.customize.answer': {
    en: 'Yes. All paid plans include full commercial usage rights. Use everything you create — text, images, video, and music — in client work, products, marketing, and more.',
    zh: '可以。所有付费计划均包含完整的商用授权。你创作的一切——文字、图片、视频、音乐——都能用于客户项目、产品、营销等场景。',
  },
  'landing.faq.license.question': {
    en: 'Is there an API?',
    zh: '提供 API 吗？',
  },
  'landing.faq.license.answer': {
    en: 'Yes. Pro and Enterprise plans include API access, so you can embed the Fable5AI agent directly into your own apps, automation, and workflows with full documentation.',
    zh: '提供。专业版与企业版包含 API 访问权限，可把 Fable5AI 智能体直接接入你自己的应用、自动化和工作流，并配有完整文档。',
  },

  // ---- CTA ----
  'landing.cta.headline': {
    en: 'Ready to put your work on autopilot?',
    zh: '准备好让工作自动跑起来了吗？',
  },
  'landing.cta.subheadline': {
    en: 'Join creators and teams using Fable5AI to chat, create, and ship — all from one agent.',
    zh: '加入用 Fable5AI 对话、创作、交付的创作者与团队——一切由一个智能体完成。',
  },
  'landing.cta.button': { en: 'Start for free', zh: '免费开始' },

  // ---- Footer ----
  'landing.footer.tagline': {
    en: 'One agent for everything you create.',
    zh: '一个智能体，搞定你的所有创作。',
  },
  'landing.footer.feature': { en: 'Features', zh: '功能' },
  'landing.footer.product': { en: 'Product', zh: '产品' },
  'landing.footer.resources': { en: 'Resources', zh: '资源' },
  'landing.footer.legal': { en: 'Legal', zh: '法律' },
  'landing.footer.privacy': { en: 'Privacy Policy', zh: '隐私政策' },
  'landing.footer.terms': { en: 'Terms of Service', zh: '服务条款' },
  'landing.footer.settings': { en: 'Settings', zh: '设置' },
  'landing.footer.admin': { en: 'Admin Panel', zh: '管理后台' },
  'landing.footer.docs': { en: 'Documentation', zh: '文档' },
  'landing.footer.github': { en: 'GitHub', zh: 'GitHub' },
  'landing.footer.blog': { en: 'Blog', zh: '博客' },

  // ---- Dashboard: agent page + quick actions ----
  'settings.nav.agent': { en: 'Agent', zh: '智能体' },
  'settings.agent.title': { en: 'Agent', zh: '智能体' },
  'settings.agent.subtitle': {
    en: 'Chat with Fable5AI — your all-in-one AI assistant.',
    zh: '与 Fable5AI 对话——你的全能 AI 助手。',
  },
  'settings.agent.placeholder': {
    en: 'Ask Fable5AI anything…',
    zh: '向 Fable5AI 提问……',
  },
  'settings.agent.empty': {
    en: 'Start the conversation — ask Fable5AI to write, design, research, or create.',
    zh: '开始对话吧——让 Fable5AI 帮你写作、设计、研究或创作。',
  },
  'settings.agent.send': { en: 'Send', zh: '发送' },
  'settings.agent.thinking': {
    en: 'Fable5AI is thinking…',
    zh: 'Fable5AI 正在思考……',
  },
  'settings.agent.error': {
    en: 'Could not get a response. Please try again.',
    zh: '暂时无法获取回复，请重试。',
  },
  'settings.agent.not_configured': {
    en: 'No AI provider configured yet. Add an API key in Admin → Settings to enable the agent.',
    zh: '尚未配置 AI 服务。请在「后台 → 设置」中添加 API 密钥以启用智能体。',
  },
  'settings.agent.welcome': {
    en: "Hi! I'm Fable5AI. Ask me to write, design, research, or create — what would you like to do?",
    zh: '你好！我是 Fable5AI。写作、设计、研究、创作都可以交给我——你想做什么？',
  },
  'settings.agent.clear': { en: 'Clear', zh: '清空' },
  'settings.agent.you': { en: 'You', zh: '你' },
  'settings.overview.action.chat': { en: 'New Chat', zh: '新对话' },
  'settings.overview.action.chat_desc': {
    en: 'Start a conversation with your AI agent.',
    zh: '开始与你的 AI 智能体对话。',
  },
  'settings.overview.action.image': { en: 'Generate Image', zh: '生成图片' },
  'settings.overview.action.image_desc': {
    en: 'Describe it and let Fable5AI create it.',
    zh: '描述一下，让 Fable5AI 帮你创作。',
  },
  'settings.overview.action.video': { en: 'Create Video', zh: '制作视频' },
  'settings.overview.action.video_desc': {
    en: 'Turn a prompt into a short video.',
    zh: '把一段提示词变成短视频。',
  },
  'settings.overview.open_agent': { en: 'Open Agent', zh: '打开智能体' },
};

let updated = 0;
let added = 0;
const locales = [
  { obj: en, lang: 'en' },
  { obj: zh, lang: 'zh' },
];
for (const [key, val] of Object.entries(CONTENT)) {
  for (const { obj: target, lang } of locales) {
    const existed = key in target;
    target[key] = val[lang];
    if (existed) updated++;
    else added++;
  }
}

writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
writeFileSync(zhPath, JSON.stringify(zh, null, 2) + '\n', 'utf8');

console.log(`Done. keys in CONTENT: ${Object.keys(CONTENT).length}`);
console.log(`Existing keys updated (across both locales): ${updated}`);
console.log(`New keys added (across both locales): ${added}`);
console.log(`en.json total keys: ${Object.keys(en).length}`);
console.log(`zh.json total keys: ${Object.keys(zh).length}`);
