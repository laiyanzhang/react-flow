import { ResizablePanel, ResizablePanelGroup } from '@/lib/resizable';
import { PanelResizeHandle } from 'react-resizable-panels';
import { Avatar, Divider, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';

const SlideLeft: React.FC = () => {
  // const { sidebarOpen, toggleSidebar } = useGlobalStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    fetch(
      `https://660d2bd96ddfa2943b33731c.mockapi.io/api/users/?page=${page}&limit=20`
    )
      .then(res => res.json())
      .then(res => {
        const results = Array.isArray(res) ? res : [];
        setData([...data, ...results]);
        setLoading(false);
        setPage(page + 1);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <ResizablePanelGroup direction='horizontal' className='w-screen h-full'>
      <ResizablePanel
        className='relative h-full overflow-auto'
        minSize={18}
        maxSize={40}
        defaultSize={20}
      >
        <div className='border-r overflow-auto h-full'>
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreData}
            hasMore={data.length < 50}
            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
            scrollableTarget='scrollableDiv'
          >
            <List
              dataSource={data}
              className='px-2'
              renderItem={item => (
                <List.Item key={item.email}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href='#'>{item.name}</a>}
                    description={item.email}
                  />
                  <div>Content</div>
                </List.Item>
              )}
            />
          </InfiniteScroll>
        </div>
      </ResizablePanel>
      <PanelResizeHandle />
      <ResizablePanel className='relative'>
        <div className='flex-1 flex-grow bg-accent/50 w-full h-full overflow-auto'>
          右侧列表
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default SlideLeft;
