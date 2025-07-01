// @ts-nocheck
import { visit } from 'unist-util-visit';
import { Parent } from 'unist';

const videoServiceMatchers = [
  {
    id: 'youtube',
    regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    embed: (id: string) => `https://www.youtube.com/embed/${id}`,
    type: 'iframe',
  },
  {
    id: 'bilibili',
    regex: /(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9_]+)/i,
    embed: (id: string) => `https://player.bilibili.com/player.html?bvid=${id}&as_wide=1&high_quality=1&danmaku=0`,
    type: 'iframe',
  },
  {
    id: 'qqvideo',
    regex: /(?:https?:\/\/)?v\.qq\.com\/x\/(?:cover\/[a-zA-Z0-9_]+\/|page\/)([a-zA-Z0-9_]+)\.html/i,
    embed: (id: string) => `https://v.qq.com/iframe/player.html?vid=${id}`,
    type: 'iframe',
  },
  {
    id: 'youku',
    regex: /(?:https?:\/\/)?v\.youku\.com\/v_show\/id_([a-zA-Z0-9=]+)\.html/i,
    embed: (id: string) => `https://player.youku.com/embed/${id}`,
    type: 'iframe',
  },
  // MetingJS based embeds - these will require MetingJS to be loaded globally
  {
    id: 'netease_music_song',
    regex: /(?:https?:\/\/)?music\.163\.com\/(?:#\/)?song\?id=(\d+)/i,
    embed: (id: string) => `https://music.163.com/#/song?id=${id}`,
    type: 'meting-js',
  },
  {
    id: 'netease_music_playlist',
    regex: /(?:https?:\/\/)?music\.163\.com\/(?:#\/)?playlist\?id=(\d+)/i,
    embed: (id: string) => `https://music.163.com/#/playlist?id=${id}`,
    type: 'meting-js',
  },
  {
    id: 'qqmusic_song',
    // Example: https://y.qq.com/n/ryqq/songDetail/001QyX1N2z155d
    // Example: https://i.y.qq.com/v8/playsong.html?songid=107547074&source=yqq&ADTAG=hz_zt_newvoice
    // The old regex was complex due to various URL formats. For now, let's simplify for common share links.
    regex: /(?:https?:\/\/)?y\.qq\.com\/n\/ryqq\/songDetail\/([a-zA-Z0-9]+)/i,
    embed: (id: string) => `https://y.qq.com/n/ryqq/songDetail/${id}`, // MetingJS might need a different format
    // For Meting, the old project used: `<meting-js auto='https://y.qq.com/n/yqq/song$1.html'></meting-js>`
    // This needs careful construction or a different regex for the ID meting expects.
    // Let's assume for now a simpler ID for direct link if Meting is not immediately used for this.
    // If using Meting, we'd need to extract the part Meting expects.
    // For now, we'll mark it as meting and use the full URL, assuming Meting can parse it.
    type: 'meting-js-direct', // Special type to indicate direct URL for meting
  },
];

export const remarkVideoEmbed = () => {
  return (tree: Parent) => {
    visit(tree, 'text', (node: any, index, parent: Parent) => {
      if (!node.value) return;

      for (const service of videoServiceMatchers) {
        const match = node.value.match(service.regex);
        if (match && match[1]) {
          const videoId = match[1];
          let embedUrl = '';
          if (typeof service.embed === 'function') {
            embedUrl = service.embed(videoId);
          }

          const embedNode = {
            type: 'html', // Will be rendered as raw HTML by ReactMarkdown if not handled by a component
            value: service.type === 'iframe'
              ? `<div class="video-wrapper aspect-video"><iframe src="${embedUrl}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe></div>`
              : service.type === 'meting-js'
              ? `<meting-js auto="${embedUrl}"></meting-js>`
              : service.type === 'meting-js-direct' // QQ Music may need specific meting format
              ? `<meting-js url="${match[0]}"></meting-js>` // Pass the full matched URL
              : '',
          };

          // Replace the text node with the embed node
          // This logic is simplified. For more robust replacement, one might need to split text nodes.
          // If the matched URL is the entire content of the text node:
          if (node.value.trim() === match[0].trim()) {
            parent.children.splice(index!, 1, embedNode);
          } else {
            // If the URL is part of a larger text, split the text node
            const beforeText = node.value.substring(0, match.index);
            const afterText = node.value.substring(match.index! + match[0].length);

            const newNodes = [];
            if (beforeText) newNodes.push({ type: 'text', value: beforeText });
            newNodes.push(embedNode);
            if (afterText) newNodes.push({ type: 'text', value: afterText });

            parent.children.splice(index!, 1, ...newNodes);
            return [visit.SKIP, index! + newNodes.length]; // Skip the new nodes and adjust index
          }
          return [visit.SKIP, index! + 1]; // Important to skip further processing of this node
        }
      }
    });

    // Also visit link nodes, in case videos are explicitly linked in Markdown
    visit(tree, 'link', (node: any, index, parent: Parent) => {
        if (!node.url) return;

        for (const service of videoServiceMatchers) {
            const match = node.url.match(service.regex);
            if (match && match[1]) {
                const videoId = match[1];
                let embedUrl = '';
                if (typeof service.embed === 'function') {
                    embedUrl = service.embed(videoId);
                }

                const embedNode = {
                    type: 'html',
                    value: service.type === 'iframe'
                    ? `<div class="video-wrapper aspect-video"><iframe src="${embedUrl}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe></div>`
                    : service.type === 'meting-js'
                    ? `<meting-js auto="${embedUrl}"></meting-js>`
                    : service.type === 'meting-js-direct'
                    ? `<meting-js url="${node.url}"></meting-js>`
                    : '',
                };

                // Replace the link node with the embed node
                parent.children.splice(index!, 1, embedNode);
                return [visit.SKIP, index! + 1];
            }
        }
    });
  };
};

// Placeholder for NeoDB/Douban embed plugin
// const NEO_DB_REGEX = /(https:\/\/neodb\.social\/(game|movie|tv\/season|book)\/[0-9a-zA-Z]+)/i;
// const DOUBAN_REGEX = /(https:\/\/(www|movie|book)\.douban\.com\/(game|subject)\/[0-9]+\/).*?/i;

// This will be more complex as it involves an async component.
// Remark plugins are synchronous. A common approach is to:
// 1. Transform the link to a special placeholder HTML tag in the remark plugin.
// 2. Use `rehype-raw` and then a custom rehype plugin or `ReactMarkdown` components option
//    to replace that placeholder tag with the actual React component (`NeoDBEmbed.tsx`).

export const remarkNeoDBEmbedPlaceholder = () => {
  return (tree: Parent) => {
    visit(tree, 'text', (node: any, index, parent: Parent) => {
      if (!node.value) return;
      const NEO_DB_REGEX = /(https:\/\/neodb\.social\/(?:game|movie|tv\/season|book)\/[0-9a-zA-Z]+)/gi;
      let lastIndex = 0;
      const newChildren = [];
      let match;

      while ((match = NEO_DB_REGEX.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          newChildren.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
        }
        newChildren.push({
          type: 'html',
          value: `<div class="neodb-embed-placeholder" data-url="${match[0]}"></div>`,
        });
        lastIndex = NEO_DB_REGEX.lastIndex;
      }

      if (lastIndex < node.value.length) {
        newChildren.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      if (newChildren.length > 0 && !(newChildren.length === 1 && newChildren[0].type === 'text')) {
         parent.children.splice(index!, 1, ...newChildren);
         return [visit.SKIP, index! + newChildren.length];
      }
    });

    visit(tree, 'link', (node: any, index, parent: Parent) => {
        const NEO_DB_LINK_REGEX = /^https:\/\/neodb\.social\/(?:game|movie|tv\/season|book)\/[0-9a-zA-Z]+$/i;
        if (node.url && NEO_DB_LINK_REGEX.test(node.url)) {
            const placeholderNode = {
                type: 'html',
                value: `<div class="neodb-embed-placeholder" data-url="${node.url}"></div>`,
            };
            parent.children.splice(index!, 1, placeholderNode);
            return [visit.SKIP, index! + 1];
        }
    });
  };
};

// In your MemoContent.tsx, you would then use the 'components' prop of ReactMarkdown
// to replace '<div class="neodb-embed-placeholder" data-url="..."></div>'
// with your <NeoDBEmbed url={dataUrl} /> component.
// This requires `rehype-raw` to parse the HTML string first.

/**
 * Helper function to load MetingJS if it's not already loaded.
 * This should be called once, perhaps in _app.tsx or Layout.tsx,
 * or conditionally in MemoContent.tsx if a Meting embed is detected.
 */
export const loadMetingJS = () => {
  if (document.getElementById('meting-js-script')) return;

  const script = document.createElement('script');
  script.id = 'meting-js-script';
  script.src = '/cdn/Meting.min.js'; // Assuming you've copied it to public/cdn
  script.async = true;
  document.body.appendChild(script);

  // APLAYER_CDN_CSS_LINK.href = '/cdn/APlayer.min.css'; // if needed
};

export const ensureMetingJS = (content: string) => {
  if (content.includes('<meting-js')) {
    loadMetingJS();
    // Also need APlayer CSS if not globally included
    if (!document.querySelector('link[href="/cdn/APlayer.min.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/cdn/APlayer.min.css'; // Make sure this path is correct
        document.head.appendChild(link);
    }
    // And Meting API config if not set globally
    if (!(window as any).meting_api) {
        (window as any).meting_api='https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r';
    }
  }
};
