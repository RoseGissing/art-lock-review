export const translations = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      submit: "Submit",
      close: "Close",
    },
    navigation: {
      gallery: "Gallery",
      leaderboard: "Leaderboard",
      auctions: "Auctions",
    },
    wallet: {
      connect: "Connect Wallet",
      disconnect: "Disconnect",
      connected: "Connected",
      notConnected: "Not Connected",
    },
    artwork: {
      create: "Create Artwork",
      title: "Title",
      description: "Description",
      rating: "Rating",
      review: "Review",
      submitRating: "Submit Rating",
    },
    messages: {
      ratingSubmitted: "Rating submitted successfully",
      artworkCreated: "Artwork created successfully",
      connectionRequired: "Please connect your wallet first",
    },
  },
  zh: {
    common: {
      loading: "加载中...",
      error: "错误",
      success: "成功",
      cancel: "取消",
      confirm: "确认",
      submit: "提交",
      close: "关闭",
    },
    navigation: {
      gallery: "画廊",
      leaderboard: "排行榜",
      auctions: "拍卖",
    },
    wallet: {
      connect: "连接钱包",
      disconnect: "断开连接",
      connected: "已连接",
      notConnected: "未连接",
    },
    artwork: {
      create: "创建艺术品",
      title: "标题",
      description: "描述",
      rating: "评分",
      review: "评论",
      submitRating: "提交评分",
    },
    messages: {
      ratingSubmitted: "评分提交成功",
      artworkCreated: "艺术品创建成功",
      connectionRequired: "请先连接钱包",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export const useTranslation = (lang: Language = 'en') => {
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return { t, lang };
};
