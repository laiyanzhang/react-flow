const AudioPlayer = ({ url }: { url: string }) => {
  // 根据文件后缀返回对应的 MIME 类型
  const getAudioType = (url: string) => {
    if (!url) return 'audio/mpeg'; // 默认类型
    
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'ogg':
      case 'oga':
        return 'audio/ogg';
      case 'aac':
        return 'audio/aac';
      case 'm4a':
        return 'audio/mp4';
      default:
        return 'audio/mpeg'; // 未知类型默认处理
    }
  };

  return (
    <div style={{ 
      maxWidth: '100%',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <audio 
        controls
        style={{ width: '100%', outline: 'none' }}
      >
        <source src={url} type={getAudioType(url)} />
        您的浏览器不支持此音频格式。请尝试使用现代浏览器（如Chrome、Firefox）。
      </audio>
    </div>
  );
};

export default AudioPlayer;