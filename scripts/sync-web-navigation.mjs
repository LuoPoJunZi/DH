import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceOrigin = 'https://tools.liumingye.cn';

const categoryDefinitions = [
  {
    id: 'video',
    name: '影视',
    description: '影视检索、在线播放与多端客户端',
    sourceUrl: `${sourceOrigin}/category/video`,
    subcategories: [
      ['watch', '在线看', 3],
      ['download', '下载', 6],
      ['cloud-drive', '网盘', 7],
      ['android', 'Android', 49],
      ['ios', 'iOS', 52],
      ['pc', 'PC', 50],
      ['tv', 'TV', 51],
    ],
  },
  {
    id: 'anime',
    name: '二次元',
    description: '动画、漫画与二次元资源工具',
    sourceUrl: `${sourceOrigin}/category/cat`,
    subcategories: [
      ['anime', '动漫', 5],
      ['comic', '漫画', 8],
      ['download', '下载站', 10],
      ['tools', '神器', 9],
    ],
  },
  {
    id: 'music',
    name: '音乐',
    description: '在线听歌、无损音乐与网络电台',
    sourceUrl: `${sourceOrigin}/category/music`,
    subcategories: [
      ['listen', '听歌', 16],
      ['lossless', '无损音乐', 22],
      ['radio', '电台', 23],
    ],
  },
  {
    id: 'reading',
    name: '阅读',
    description: '电子书、小说与文档资源',
    sourceUrl: `${sourceOrigin}/category/book`,
    subcategories: [
      ['ebooks', '电子书', 17],
      ['novels', '小说', 18],
    ],
  },
  {
    id: 'game',
    name: '游戏',
    description: '经典游戏与网页小游戏',
    sourceUrl: `${sourceOrigin}/category/gamepad`,
    subcategories: [['online-games', '在线小游戏', 33]],
  },
  {
    id: 'entertainment',
    name: '娱乐',
    description: '电视直播、壁纸与轻量娱乐内容',
    sourceUrl: `${sourceOrigin}/category/fan`,
    subcategories: [
      ['live-tv', '电视直播', 25],
      ['wallpaper', '壁纸', 26],
    ],
  },
  {
    id: 'toolbox',
    name: '工具箱',
    description: 'AI 助手与在线效率工具',
    sourceUrl: `${sourceOrigin}/category/toolbox`,
    subcategories: [
      ['ai-assistant', 'AI助手', 42],
      ['online-tools', '在线工具', 34],
    ],
  },
  {
    id: 'software',
    name: '软件',
    description: '装机软件与软件下载',
    sourceUrl: `${sourceOrigin}/category/box`,
    subcategories: [
      ['essentials', '装机必备', 35],
      ['downloads', '软件下载', 40],
    ],
  },
];

function cleanText(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function getHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function getLogoUrl(value, targetUrl) {
  const httpsLogo = getHttpsUrl(value);
  if (httpsLogo) return httpsLogo;

  if (typeof value === 'string' && value.startsWith('http://cdn.liumingye.cn/')) {
    return value.replace('http://', 'https://');
  }

  const domain = encodeURIComponent(new URL(targetUrl).hostname);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

async function fetchSubcategory([id, name, sourceId]) {
  const response = await fetch(`${sourceOrigin}/api?event=category&mid=${sourceId}`);
  if (!response.ok) {
    throw new Error(`分类 ${name} (${sourceId}) 请求失败：HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.status !== 'success') {
    throw new Error(`分类 ${name} (${sourceId}) 返回了无效数据`);
  }

  const records = Array.isArray(payload.data) ? payload.data : [];
  const links = records.map((site) => {
    const fallbackUrl = getHttpsUrl(site.permalink);
    const url = getHttpsUrl(site.url) ?? fallbackUrl;

    if (!url) {
      throw new Error(`站点 ${site.title ?? site.cid ?? '未知'} 没有可用的 HTTPS 地址`);
    }

    return {
      name: cleanText(site.title, '未命名站点'),
      description: cleanText(site.text, '查看网站详情'),
      url,
      logoUrl: getLogoUrl(site.logo, url),
    };
  });

  return { id, name, sourceId, links };
}

async function syncNavigation() {
  const categories = [];

  for (const category of categoryDefinitions) {
    const subcategories = await Promise.all(category.subcategories.map(fetchSubcategory));
    categories.push({
      id: category.id,
      name: category.name,
      description: category.description,
      sourceUrl: category.sourceUrl,
      subcategories,
    });
  }

  const output = {
    source: sourceOrigin,
    categories,
  };

  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const outputPath = resolve(scriptDirectory, '../src/config/liumingye-navigation.data.json');
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  const recordCount = categories.reduce(
    (total, category) =>
      total +
      category.subcategories.reduce(
        (subtotal, subcategory) => subtotal + subcategory.links.length,
        0,
      ),
    0,
  );

  console.log(`Synced ${recordCount} navigation records across ${categories.length} categories.`);
}

await syncNavigation();
