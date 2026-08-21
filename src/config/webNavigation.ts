import type { WebNavigationCategory, WebNavigationLink } from '../types/web-navigation';

type WebNavigationLinkSource = Omit<WebNavigationLink, 'logoUrl'> & {
  logoUrl?: `https://${string}`;
};

type WebNavigationCategorySource = Omit<WebNavigationCategory, 'links'> & {
  links: WebNavigationLinkSource[];
};

const faviconEndpoint = 'https://www.google.com/s2/favicons';

function getWebsiteLogoUrl(url: `https://${string}`): `https://${string}` {
  const domain = encodeURIComponent(new URL(url).hostname);
  return `${faviconEndpoint}?domain=${domain}&sz=64`;
}

const webNavigationCategorySources: WebNavigationCategorySource[] = [
  {
    id: 'ai',
    name: 'AI',
    description: '常用对话、代码与多模态 AI 助手',
    sourceUrl: 'https://dh.luopojunzi.com/',
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
    ],
  },
  {
    id: 'cloud',
    name: '云服务',
    description: '代码托管、域名与云端主机平台',
    sourceUrl: 'https://dh.luopojunzi.com/',
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
    id: 'network',
    name: '网络',
    description: '个人站点、网络检测与代理工具',
    sourceUrl: 'https://dh.luopojunzi.com/',
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
      {
        name: 'IT-PING',
        description: '多节点网站 Ping 与网络质量测试',
        url: 'https://www.itdog.cn/ping/',
      },
      {
        name: 'Speedtest',
        description: '网络速度与延迟测试',
        url: 'https://www.speedtest.net/',
      },
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
    ],
  },
  {
    id: 'video',
    name: '影视',
    description: '影视检索与在线播放站点',
    sourceUrl: 'https://tools.liumingye.cn/category/video',
    links: [
      {
        name: 'No视频',
        description: '以海外影视剧资源为主的在线追剧站点',
        url: 'https://www.novipnoad.uk/',
      },
      {
        name: '注视影视',
        description: '海外影视剧与国内高口碑影视内容',
        url: 'https://gazes.top/',
      },
      {
        name: '厂长资源',
        description: '高清影视内容在线播放',
        url: 'https://www.cz4k.com/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/Mis53u9.png',
      },
      {
        name: '西瓜TV',
        description: '提供多线路与弹幕的影视站点',
        url: 'https://www.xiguatv.club/',
        logoUrl: 'https://s3.liumingye.cn/files/2026/06/18004975.webp',
      },
      {
        name: 'SA 影视',
        description: '影视内容与影像资讯站点',
        url: 'https://safilm69.com/',
      },
      {
        name: '威尔伯TV',
        description: '面向海外用户的中文影视站点',
        url: 'https://wei2bo.com/',
        logoUrl: 'https://s3.liumingye.cn/files/2026/05/20260526185307065.png',
      },
      {
        name: 'LIBVIO',
        description: '以海外影视内容为主的老牌站点',
        url: 'https://www.libhd.com/',
        logoUrl: 'https://s3.liumingye.cn/files/2026/05/20260503142143405.png',
      },
      {
        name: '青禾影视',
        description: '高清影视内容在线观看',
        url: 'https://movie.qhdaohang.cn/',
      },
    ],
  },
  {
    id: 'anime',
    name: '二次元',
    description: '动画、番剧与二次元内容站点',
    sourceUrl: 'https://tools.liumingye.cn/category/cat',
    links: [
      {
        name: 'TvTFun',
        description: '专注日本番剧的在线追番站点',
        url: 'https://www.tvtfun.net/',
      },
      {
        name: '番茶屋',
        description: '日番、国番与美番在线观看',
        url: 'https://www.fcwdm.com/',
      },
      {
        name: '花子动漫',
        description: '日本动画在线观看站点',
        url: 'https://www.huazidm.com/',
      },
      {
        name: '动漫窝',
        description: '国漫、日漫与美漫在线追番',
        url: 'https://www.dmwo.one/',
      },
      {
        name: '西瓜卡通',
        description: '日番、国番与美番内容站点',
        url: 'https://www.xgcartoon.com/',
      },
      {
        name: 'E站弹幕网',
        description: '在线追番与二次元内容社区',
        url: 'https://www.ezdmw.org/',
      },
      {
        name: 'MuteFun动漫',
        description: '以日本动画为主的在线站点',
        url: 'https://www.2kdm.com/',
      },
      {
        name: 'Anime1.me',
        description: '界面简洁、更新及时的日本动画站点',
        url: 'https://anime1.me/',
      },
    ],
  },
  {
    id: 'music',
    name: '音乐',
    description: '在线听歌、播放器与音乐检索',
    sourceUrl: 'https://tools.liumingye.cn/category/music',
    links: [
      {
        name: '下歌吧',
        description: '音乐检索与下载站点',
        url: 'https://xiageba.liumingye.cn/',
      },
      {
        name: '铜钟',
        description: '专注在线听歌的简洁音乐网站',
        url: 'https://tonzhon.whamon.com/',
      },
      {
        name: 'GD音乐台',
        description: '支持多个平台曲库的在线音乐站点',
        url: 'https://music.gdstudio.org/',
      },
      {
        name: '米兔音乐',
        description: '歌曲在线试听与检索',
        url: 'https://www.qqmp3.vip/',
      },
      {
        name: '布谷音乐',
        description: 'MP3、WAV 与 FLAC 音乐检索',
        url: 'https://www.buguyy.top/',
      },
      {
        name: 'mmPlayer',
        description: '网易云音乐第三方网页播放器',
        url: 'https://netease-music.fe-mm.com/',
      },
      {
        name: '昔枫音乐盒',
        description: '以网易云内容为主的网页播放器',
        url: 'https://mu-jie.cc/musicBox/',
      },
      {
        name: '种子音乐',
        description: '在线听歌与音乐检索站点',
        url: 'https://zz123.com/',
      },
    ],
  },
  {
    id: 'reading',
    name: '阅读',
    description: '电子书、古籍与文档检索',
    sourceUrl: 'https://tools.liumingye.cn/category/book',
    links: [
      {
        name: '安娜的档案',
        description: '开放数据图书馆与文献检索',
        url: 'https://zh.annas-archive.gl/',
      },
      {
        name: '读书派',
        description: 'EPUB、AZW3、MOBI 与 PDF 电子书',
        url: 'https://www.dushupai.com/',
      },
      {
        name: '小力盘',
        description: '电子书资源搜索平台',
        url: 'https://www.xiaolipan.com/',
      },
      {
        name: '书籍知识库',
        description: '书籍与电子书分享站点',
        url: 'https://www.zhishikoo.com/',
      },
      {
        name: '识典古籍',
        description: '古籍数字化在线阅读',
        url: 'https://www.shidianguji.com/',
      },
      {
        name: '书格',
        description: '自由开放的古籍数字图书馆',
        url: 'https://www.shuge.org/',
      },
      {
        name: '鸠摩搜索',
        description: '电子书与文档搜索引擎',
        url: 'https://www.jiumodiary.com/',
      },
      {
        name: '可阅文学网',
        description: '文学、诗歌与散文在线阅读',
        url: 'https://www.kepub.net/',
      },
    ],
  },
  {
    id: 'game',
    name: '游戏',
    description: '经典游戏与网页小游戏',
    sourceUrl: 'https://tools.liumingye.cn/category/gamepad',
    links: [
      {
        name: '谜页集',
        description: '现实互动解谜与网页互动游戏',
        url: 'https://miyeji.cn/',
      },
      {
        name: 'ClassicJoy Games',
        description: '在线体验各类经典游戏',
        url: 'https://classicjoy.games/zh',
      },
      {
        name: 'yikm游戏',
        description: '经典游戏在线游玩平台',
        url: 'https://www.yikm.net/',
      },
      {
        name: '海拥游戏大全',
        description: 'FC、GBA 与休闲网页游戏',
        url: 'https://game.haiyong.site/',
      },
      {
        name: 'Freegame',
        description: '免费网页游戏平台',
        url: 'https://www.freegame.com/',
      },
      {
        name: '在线DOS游戏',
        description: '经典 DOS 游戏在线体验',
        url: 'https://dos.lol/',
      },
      {
        name: 'CrazyGames',
        description: '海外在线小游戏平台',
        url: 'https://www.crazygames.com/',
      },
      {
        name: 'Poki小游戏',
        description: '免费在线小游戏集合',
        url: 'https://poki.com/',
      },
    ],
  },
  {
    id: 'entertainment',
    name: '娱乐',
    description: '壁纸、图库与轻量娱乐内容',
    sourceUrl: 'https://tools.liumingye.cn/category/fan',
    links: [
      {
        name: 'Wallspic',
        description: '4K 手机与电脑壁纸',
        url: 'https://tools.liumingye.cn/site/246/',
        logoUrl: 'https://s3.liumingye.cn/files/2026/05/1378515509.webp',
      },
      {
        name: '哲风壁纸',
        description: '4K、8K 电脑与手机壁纸社区',
        url: 'https://tools.liumingye.cn/site/216/',
        logoUrl: 'https://s3.liumingye.cn/files/2026/03/843609338.webp',
      },
      {
        name: 'ACG壁纸',
        description: 'ACG 主题壁纸站点',
        url: 'https://tools.liumingye.cn/site/169/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/RSSqmpD.png',
      },
      {
        name: '彼岸桌面',
        description: '手机与电脑壁纸站点',
        url: 'https://tools.liumingye.cn/site/129/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/hYcuvQS.png',
      },
      {
        name: '国漫图库',
        description: '国漫风格手机壁纸图库',
        url: 'https://tools.liumingye.cn/site/109/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/rIMJnPL.png',
      },
      {
        name: 'SomeACG壁纸',
        description: '专注 ACG 壁纸的二次元站点',
        url: 'https://tools.liumingye.cn/site/108/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/MIvKJ6Z.png',
      },
      {
        name: '壁纸湖',
        description: '手机壁纸内容站点',
        url: 'https://tools.liumingye.cn/site/53/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/8dr7Gn4.png',
      },
      {
        name: '宝藏图库',
        description: '电脑与手机壁纸图库',
        url: 'https://tools.liumingye.cn/site/52/',
        logoUrl: 'https://cdn.liumingye.cn/imgur/bA57enl.png',
      },
    ],
  },
  {
    id: 'toolbox',
    name: '工具箱',
    description: 'AI、创作与在线效率工具',
    sourceUrl: 'https://tools.liumingye.cn/category/toolbox',
    links: [
      {
        name: '即梦AI',
        description: '一站式 AI 创作平台',
        url: 'https://jimeng.jianying.com/ai-tool/home',
      },
      {
        name: 'LibTV',
        description: 'AI 视频创作工具',
        url: 'https://www.liblib.tv/',
      },
      {
        name: '小云雀',
        description: '智能视频创作平台',
        url: 'https://xyq.jianying.com/',
      },
      {
        name: 'TRAE Work',
        description: 'AI 编程与团队协作工具',
        url: 'https://www.trae.cn/work',
      },
      {
        name: 'OpenCode',
        description: '开源 AI 编程助手',
        url: 'https://opencode.ai/zh',
      },
      {
        name: '豆包AI',
        description: '字节跳动旗下 AI 智能助手',
        url: 'https://www.doubao.com/',
      },
      {
        name: '千问AI',
        description: '工作、学习与生活智能助手',
        url: 'https://www.qianwen.com/',
      },
      {
        name: 'Kimi',
        description: '长文本与资料处理 AI 助手',
        url: 'https://www.kimi.com/',
      },
      {
        name: '秘塔AI搜索',
        description: '面向资料研究的 AI 搜索工具',
        url: 'https://metaso.cn/',
      },
      {
        name: '腾讯元宝',
        description: '腾讯旗下 AI 智能助手',
        url: 'https://yuanbao.tencent.com/',
      },
    ],
  },
  {
    id: 'software',
    name: '软件',
    description: '常用桌面软件与官方下载',
    sourceUrl: 'https://tools.liumingye.cn/category/box',
    links: [
      {
        name: '微信',
        description: '微信桌面与移动客户端',
        url: 'https://weixin.qq.com/',
      },
      {
        name: 'LocalSend',
        description: '跨平台局域网文件传输工具',
        url: 'https://localsend.org/',
      },
      {
        name: 'Steam',
        description: '游戏发行与游戏平台',
        url: 'https://store.steampowered.com/about/',
      },
      {
        name: 'Everything',
        description: 'Windows 文件与文件夹快速搜索',
        url: 'https://www.voidtools.com/zh-cn/',
      },
      {
        name: 'Google Chrome',
        description: 'Google Chrome 浏览器官方下载',
        url: 'https://www.google.cn/intl/zh-CN/chrome/',
      },
      {
        name: 'Microsoft 365',
        description: 'Microsoft Office 官方产品入口',
        url: 'https://www.microsoft.com/zh-cn/microsoft-365',
      },
      {
        name: 'PotPlayer',
        description: '轻量高清视频播放器',
        url: 'https://potplayer.daum.net/?lang=zh_CN',
      },
      {
        name: 'Bandizip',
        description: '文件压缩与解压缩工具',
        url: 'https://www.bandisoft.com/bandizip/',
      },
    ],
  },
] satisfies WebNavigationCategorySource[];

export const webNavigationCategories: WebNavigationCategory[] = webNavigationCategorySources.map(
  (category) => ({
    ...category,
    links: category.links.map((link) => ({
      ...link,
      logoUrl: link.logoUrl ?? getWebsiteLogoUrl(link.url),
    })),
  }),
);

export const webNavigationLinkCount = webNavigationCategories.reduce(
  (total, category) => total + category.links.length,
  0,
);
