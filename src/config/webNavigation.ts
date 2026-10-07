import type {
  WebNavigationCategory,
  WebNavigationCategoryId,
  WebNavigationLink,
  WebNavigationSubcategory,
} from '../types/web-navigation';
import liumingyeNavigationData from './liumingye-navigation.data.json';
import customNavigationData from './webNavigation.custom.data.json';

type WebNavigationLinkSource = Omit<WebNavigationLink, 'logoUrl'> & {
  logoUrl?: `https://${string}`;
};

interface CoreNavigationSubcategorySource {
  id: string;
  name: string;
  links: WebNavigationLinkSource[];
}

type CoreNavigationCategorySource = Omit<WebNavigationCategory, 'links' | 'subcategories'> & {
  subcategories: CoreNavigationSubcategorySource[];
};

interface ImportedNavigationLink {
  name: string;
  description: string;
  url: string;
  logoUrl: string;
}

interface ImportedNavigationSubcategory {
  id: string;
  name: string;
  links: ImportedNavigationLink[];
}

interface ImportedNavigationCategory {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  subcategories: ImportedNavigationSubcategory[];
}

interface NavigationSubcategoryCustomization extends WebNavigationSubcategory {
  prependLinks: boolean;
}

const faviconEndpoint = 'https://www.google.com/s2/favicons';

function getWebsiteLogoUrl(url: `https://${string}`): `https://${string}` {
  const domain = encodeURIComponent(new URL(url).hostname);
  return `${faviconEndpoint}?domain=${domain}&sz=64`;
}

function asHttpsUrl(url: string): `https://${string}` {
  if (!url.startsWith('https://')) {
    throw new Error(`网站导航只允许 HTTPS URL：${url}`);
  }

  return url as `https://${string}`;
}

function uniqueLinks(links: WebNavigationLink[]) {
  return Array.from(new Map(links.map((link) => [link.url, link])).values());
}

const coreNavigationCategorySources: CoreNavigationCategorySource[] = [
  {
    id: 'digital',
    name: '数字服务',
    description: 'AI、云平台、域名与网络工具',
    sourceUrl: 'https://blog.luopojunzi.com/p/Website/',
    subcategories: [
      {
        id: 'ai-assistants',
        name: 'AI 助手',
        links: [
          {
            name: 'ChatGPT',
            description: '通用对话、写作与多模态 AI 助手',
            url: 'https://chatgpt.com/',
          },
          {
            name: 'Claude',
            description: '擅长代码与长文档处理的 AI 助手',
            url: 'https://claude.ai/',
          },
          {
            name: 'Gemini',
            description: 'Google 推出的多模态 AI 助手',
            url: 'https://gemini.google.com/',
          },
          {
            name: 'Grok',
            description: 'xAI 推出的对话与代码 AI 助手',
            url: 'https://grok.com/',
          },
          {
            name: 'Microsoft Copilot',
            description: '微软推出的通用 AI 助手',
            url: 'https://copilot.microsoft.com/',
          },
        ],
      },
      {
        id: 'cloud-platforms',
        name: '云与开发',
        links: [
          {
            name: 'Cloudflare',
            description: 'CDN、DNS 与安全服务控制台',
            url: 'https://dash.cloudflare.com/',
          },
          {
            name: 'GitHub',
            description: '代码托管与开源协作社区',
            url: 'https://github.com/',
          },
          {
            name: 'CloudCone',
            description: '云服务器与实例管理平台',
            url: 'https://app.cloudcone.com/?ref=11880',
          },
          {
            name: 'RackNerd',
            description: 'VPS 与云端主机服务平台',
            url: 'https://my.racknerd.com/aff.php?aff=12190',
          },
          {
            name: 'RareCloud',
            description: '云端主机与网络服务平台',
            url: 'https://rarecloud.io/clients/aff.php?aff=585',
          },
          {
            name: 'Alice云',
            description: 'Alice 云服务控制台',
            url: 'https://console.alice.sh/dashboard',
          },
        ],
      },
      {
        id: 'domain-services',
        name: '域名服务',
        links: [
          {
            name: 'Porkbun',
            description: '域名注册与管理平台',
            url: 'https://porkbun.com/',
          },
          {
            name: 'Spaceship',
            description: '域名注册与云服务平台',
            url: 'https://www.spaceship.com/',
          },
          {
            name: 'TLD-List',
            description: '比较不同注册商的顶级域名价格',
            url: 'https://zh-hans.tld-list.com/',
          },
        ],
      },
      {
        id: 'network-checks',
        name: '网络检测',
        links: [
          {
            name: 'ITDOG',
            description: '多节点 Ping、路由与网站质量测试',
            url: 'https://www.itdog.cn/ping/',
          },
          {
            name: 'Speedtest',
            description: '网络速度与延迟测试',
            url: 'https://www.speedtest.net/',
          },
          {
            name: 'Fast.com',
            description: 'Netflix 提供的简洁网络测速工具',
            url: 'https://fast.com/',
          },
          {
            name: 'IP.SB',
            description: '快速查看当前公网 IP 与网络信息',
            url: 'https://ip.sb/',
          },
          {
            name: 'IPData',
            description: 'IP 地理位置与威胁情报查询',
            url: 'https://ipdata.co/',
          },
          {
            name: 'IP123',
            description: '查看全球 IP 归属与网络信息',
            url: 'https://ip123.in/',
          },
          {
            name: 'IPinfo',
            description: '查询 IP 运营商、位置与网络详情',
            url: 'https://ipinfo.io/',
          },
          {
            name: 'DNSPod 工具箱',
            description: '域名 DNS、解析与网络检测工具',
            url: 'https://tool.dnspod.cn/',
          },
        ],
      },
      {
        id: 'network-clients',
        name: '网络客户端',
        links: [
          {
            name: 'v2rayN',
            description: 'Windows 网络代理客户端发布页',
            url: 'https://github.com/2dust/v2rayN/releases/',
          },
          {
            name: 'NekoBox',
            description: 'Android 网络代理客户端项目',
            url: 'https://github.com/MatsuriDayo/NekoBoxForAndroid',
          },
          {
            name: 'sing-box',
            description: '跨平台通用代理工具文档',
            url: 'https://sing-box.sagernet.org/',
          },
          {
            name: 'Shadowrocket',
            description: 'iOS 网络代理客户端 App Store 页面',
            url: 'https://apps.apple.com/app/shadowrocket/id932747118',
          },
          {
            name: 'Clash Verge Rev',
            description: '跨平台 Clash 桌面客户端项目',
            url: 'https://github.com/clash-verge-rev/clash-verge-rev',
          },
          {
            name: 'Hiddify',
            description: '基于多种协议的跨平台网络客户端',
            url: 'https://github.com/hiddify/hiddify-app',
          },
        ],
      },
      {
        id: 'personal-sites',
        name: '个人站点',
        links: [
          {
            name: '个人博客',
            description: '落魄君子的个人博客',
            url: 'https://blog.luopojunzi.com/',
          },
          {
            name: '落魄鸡窝',
            description: '落魄君子的社区站点',
            url: 'https://komari.luopojunzi.com/',
          },
        ],
      },
    ],
  },
];

const coreNavigationCategories: WebNavigationCategory[] = coreNavigationCategorySources.map(
  (category) => {
    const subcategories = category.subcategories.map((subcategory) => ({
      ...subcategory,
      links: subcategory.links.map((link) => ({
        ...link,
        logoUrl: link.logoUrl ?? getWebsiteLogoUrl(link.url),
      })),
    }));

    return {
      ...category,
      links: uniqueLinks(subcategories.flatMap((subcategory) => subcategory.links)),
      subcategories,
    };
  },
);

const importedNavigationCategories: WebNavigationCategory[] = (
  liumingyeNavigationData.categories as ImportedNavigationCategory[]
).map((category) => {
  const subcategories: WebNavigationSubcategory[] = category.subcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    links: subcategory.links.map((link) => ({
      name: link.name,
      description: link.description,
      url: asHttpsUrl(link.url),
      logoUrl: asHttpsUrl(link.logoUrl),
    })),
  }));

  return {
    id: category.id as WebNavigationCategoryId,
    name: category.name,
    description: category.description,
    sourceUrl: asHttpsUrl(category.sourceUrl),
    links: uniqueLinks(subcategories.flatMap((subcategory) => subcategory.links)),
    subcategories,
  };
});

const importedAiSubcategory = importedNavigationCategories
  .find((category) => category.id === 'toolbox')
  ?.subcategories?.find((subcategory) => subcategory.id === 'ai-assistant');

function applyNavigationCustomization(category: WebNavigationCategory): WebNavigationCategory {
  const customization = customNavigationData.find((item) => item.id === category.id);
  const existingSubcategories = (category.subcategories ?? []).filter(
    (subcategory) => category.id !== 'toolbox' || subcategory.id !== 'ai-assistant',
  );
  if (category.id === 'digital' && importedAiSubcategory) {
    const overseasAiIndex = existingSubcategories.findIndex((item) => item.id === 'ai-assistants');
    existingSubcategories.splice(overseasAiIndex + 1, 0, importedAiSubcategory);
  }

  const customSubcategories: NavigationSubcategoryCustomization[] = (
    customization?.subcategories ?? []
  ).map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    prependLinks: 'prependLinks' in subcategory && subcategory.prependLinks === true,
    links: subcategory.links.map((link) => {
      const url = asHttpsUrl(link.url);
      return { ...link, url, logoUrl: getWebsiteLogoUrl(url) };
    }),
  }));

  const subcategories = existingSubcategories.map((subcategory) => {
    const customSubcategory = customSubcategories.find((item) => item.id === subcategory.id);
    const customLinks = customSubcategory?.links ?? [];
    return {
      ...subcategory,
      name: customSubcategory?.name ?? subcategory.name,
      links: uniqueLinks(
        customSubcategory?.prependLinks
          ? [...customLinks, ...subcategory.links]
          : [...subcategory.links, ...customLinks],
      ),
    };
  });

  subcategories.push(
    ...customSubcategories.filter(
      (subcategory) => !existingSubcategories.some((item) => item.id === subcategory.id),
    ),
  );

  return {
    ...category,
    name: customization?.name ?? category.name,
    description: customization?.description ?? category.description,
    links: uniqueLinks(subcategories.flatMap((subcategory) => subcategory.links)),
    subcategories,
  };
}

export const webNavigationCategories: WebNavigationCategory[] = [
  ...coreNavigationCategories,
  ...importedNavigationCategories,
].map(applyNavigationCustomization);

export const webNavigationLinkCount = webNavigationCategories.reduce(
  (total, category) => total + category.links.length,
  0,
);
