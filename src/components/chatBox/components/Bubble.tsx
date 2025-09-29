import { useState, useEffect, useRef } from 'react';
import styles from './components.module.less';
import chatUser from '@/assets/images/chatUser.png';
import chatAgent from '@/assets/images/chatAgent.png';

interface chatInfo {
  content: string;
  type: string;
  title?: string;
}

interface BubbleProps {
  chatInfo: chatInfo;
  speed?: number;
  onComplete?: () => void;
  typing?: boolean;
}

// 判断URL类型并返回对应的媒体组件
const renderMediaElement = (url: string, key: string | number) => {
  // 简单判断是否为有效URL
  try {
    new URL(url);
  } catch {
    // 如果不是有效URL，返回原文本
    return <span key={key}>{url}</span>;
  }
  
  // 根据文件扩展名判断类型
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  // 图片类型
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  if (imageExtensions.includes(extension)) {
    return (
      <div key={key} style={{ marginTop: '8px' }}>
        <img src={url} alt="Image" style={{ maxWidth: '100%', display: 'block' }} />
      </div>
    );
  }
  
  // 视频类型
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  if (videoExtensions.includes(extension)) {
    return (
      <div key={key} style={{ marginTop: '8px' }}>
        <video controls style={{ maxWidth: '100%', display: 'block', width: '300px', height: '200px' }}>
          <source src={url} type={`video/${extension}`} />
          您的浏览器不支持视频播放。
        </video>
      </div>
    );
  }
  
  // 音频类型
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
  if (audioExtensions.includes(extension)) {
    return (
      <div key={key} style={{ marginTop: '8px' }}>
        <audio controls style={{ display: 'block', width: '100%' }}>
          <source src={url} type={`audio/${extension}`} />
          您的浏览器不支持音频播放。
        </audio>
      </div>
    );
  }
  
  // 其他链接显示为可点击链接
  return (
    <div key={key} style={{ marginTop: '8px' }}>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        {url}
      </a>
    </div>
  );
};

// 解析内容，将文本和URL分离
const parseContent = (content: string) => {
  // 匹配URL的正则表达式
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  // 处理顿号分隔的URL
  const processedParts: (string | string[])[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) { // 这是URL部分
      // 检查前面的文本是否是顿号分隔
      const prevText = i > 0 ? parts[i - 1] : '';
      if (prevText.endsWith('、')) {
        // 移除顿号
        parts[i - 1] = prevText.slice(0, -1);
      }
      
      // 检查是否有顿号分隔的多个URL
      const urls = parts[i].split('、').filter(url => url.trim() !== '');
      if (urls.length > 1) {
        processedParts.push(urls);
      } else {
        processedParts.push(parts[i]);
      }
    } else {
      processedParts.push(parts[i]);
    }
  }
  
  return processedParts;
};

const Bubble = ({ chatInfo, speed = 30, onComplete, typing = false }: BubbleProps) => {
  const [displayedContent, setDisplayedContent] = useState<React.ReactNode[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const previousContentRef = useRef('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const parsedContentRef = useRef<(string | string[])[]>([]);

  // 将解析后的内容转换为React节点
  const convertToReactNodes = (contentParts: (string | string[])[], textIndex: number = contentParts.length) => {
    const nodes: React.ReactNode[] = [];
    
    for (let i = 0; i < Math.min(contentParts.length, textIndex); i++) {
      const part = contentParts[i];
      
      if (typeof part === 'string') {
        // 检查是否为URL
        if (part.match(/^https?:\/\/[^\s]+$/)) {
          nodes.push(renderMediaElement(part, `url-${i}`));
        } else {
          // 普通文本
          nodes.push(<span key={`text-${i}`}>{part}</span>);
        }
      } else if (Array.isArray(part)) {
        // 多个URL的情况
        part.forEach((url, idx) => {
          nodes.push(renderMediaElement(url, `url-${i}-${idx}`));
        });
      }
    }
    
    return nodes;
  };

  useEffect(() => {
    const content = chatInfo.content;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!typing) {
      const parsedContent = parseContent(content);
      parsedContentRef.current = parsedContent;
      setDisplayedContent(convertToReactNodes(parsedContent));
      previousContentRef.current = content;
      if (onComplete) onComplete();
      return;
    }

    if (content !== previousContentRef.current) {
      const oldContent = previousContentRef.current;
      const parsedContent = parseContent(content);
      parsedContentRef.current = parsedContent;
      
      let baseContentParts: (string | string[])[] = [];
      
      if (content.startsWith(oldContent)) {
        // 追加情况
        baseContentParts = parseContent(oldContent);
      } else {
        // 完全不同的内容
        baseContentParts = [];
      }
      
      // 简化处理：重新开始打字效果
      setIsTyping(true);
      currentIndexRef.current = 0;
      
      const typeNextCharacter = () => {
        if (currentIndexRef.current < parsedContent.length) {
          setDisplayedContent(convertToReactNodes(parsedContent, currentIndexRef.current + 1));
          currentIndexRef.current++;
          timerRef.current = setTimeout(typeNextCharacter, speed);
        } else {
          setIsTyping(false);
          previousContentRef.current = content;
          if (onComplete) onComplete();
        }
      };
      
      setDisplayedContent(convertToReactNodes(baseContentParts));
      timerRef.current = setTimeout(typeNextCharacter, speed);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [chatInfo, speed, onComplete, typing]);

  return (
    <div className={`${styles.bubbleContainer} ${chatInfo.type === 'ASSISTANT' ? styles.assistant : ''} ${chatInfo.type === 'TOOL' ? styles.tool : ''}`}>
      {
        chatInfo.type === 'ASSISTANT' ? (
          <div className={styles.assistantIcon}>
            <img src={chatAgent} className={styles.img}></img>
          </div>
        ) :
        chatInfo.type === 'USER' ? (
          <div className={styles.userIcon}>
            <img src={chatUser} className={styles.img}></img>
          </div>
        ) :
        null
      }
      {
        chatInfo.type === 'TOOL' ? (
          <div className={styles.toolBubble}>
            {chatInfo.title && (
              <div className={styles.title}>{chatInfo.title}</div>
            )}
            <div className={styles.content}>
              {displayedContent}
              {isTyping && typing && <span className={styles.cursor}>|</span>}
            </div>
          </div>
        ) : chatInfo.content ? 
          (<div className={styles.messageBubble}>
            {displayedContent}
            {isTyping && typing && <span className={styles.cursor}>|</span>}
          </div>) :
          (<div className={styles.thinkingContainer}>
            <div className={styles.thinkingDot}></div>
            <div className={styles.thinkingDot}></div>
            <div className={styles.thinkingDot}></div>
          </div>)
      }
    </div>
  );
};

export default Bubble;