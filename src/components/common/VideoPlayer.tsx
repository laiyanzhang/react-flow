const VideoPlayer = ({ url }: { url: string }) => {
  // 根据文件后缀返回对应的 MIME 类型
  const getVideoType = (url: string) => {
    if (!url) return 'video/mp4'; // 默认类型
    
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'ogg':
      case 'ogv':
        return 'video/ogg';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
      default:
        return 'video/mp4'; // 未知类型默认处理
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', height: '100%' }}>
      <video 
        controls
        style={{ borderRadius: '8px', backgroundColor: '#000', height: '100%', width: "100%" }}
      >
        <source src={url} type={getVideoType(url)} />
        您的浏览器不支持此视频格式。请尝试使用现代浏览器（如Chrome、Firefox或Edge）。
      </video>
    </div>
  );
};

export default VideoPlayer;