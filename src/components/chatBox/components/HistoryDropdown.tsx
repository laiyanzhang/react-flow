import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dropdown, Spin } from 'antd';
import { History } from 'lucide-react';
import { getConversationHistory } from '@/api/agent';
import styles from './components.module.less'

// 定义历史记录项的类型
interface HistoryItem {
  id: string;
  title: string;
  createTime: string;
  typeDesc: string;
  name: string;
}

interface DropDownProps {
  type: string;
  targetId: number;
  refreshFlag: number;
  conversationId: string;
  onClick: (item: HistoryItem) => void;
  init: (item: HistoryItem | null) => void;
}

const HistoryDropdown: React.FC<DropDownProps> = ({onClick, init, type, targetId, refreshFlag, conversationId}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const hasMore = useMemo(() => historyList.length < total, [historyList, total]);

  // 获取历史记录
  const loadHistory = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    let pageNum = 1;
    if (!reset) {
      pageNum = page + 1;
    }
    try {
      const params = {
        page: pageNum,
        size: 20,
        type,
        targetId,
        pageSortList: [
          {
            field: 'createTime',
            order: 'desc',
            desc: true,
          }
        ]
      };

      const result: any = await getConversationHistory(params);
      const { records, total } = result.data;

      setTotal(total);
      if (reset) {
        setHistoryList(records);
        setPage(1);
        if(records[0]) {
          init(records[0]);
        } else {
          init(null);
        }
      } else {
        setHistoryList(prev => [...prev, ...records]);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, page, targetId]);

  // 初次打开时加载数据
  useEffect(() => {
    if(targetId !== 0) {
      loadHistory(true);
    }
  }, [refreshFlag, targetId]);

  // 处理滚动到底部
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (hasMore) loadHistory();
    }
  };

  const handleClick = (item: HistoryItem) => {
    onClick(item)
  };

  // 渲染历史记录项
  const renderHistoryItem = (item: HistoryItem) => (
    <div
      key={item.id}
      onClick={() => handleClick(item)}
      className={`${styles.historyItem} ${conversationId == item.id ? styles.selected : ''}`}
    >
      <div className={styles.title}>{item.title || '新对话'}</div>
      <div className={styles.name}>{item.typeDesc} · {item.name}</div>
    </div>
  );

  // 下拉菜单内容
  // 替换当前的 menu 变量定义
  const menu = (
    <div
      className={styles.historyList}  
      onScroll={handleScroll}
    >
      {historyList.length > 0 ? (
        <>
          {
            historyList.map((item) => {
              return renderHistoryItem(item)
            })
          }
          {loading && (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <Spin size="small" />
            </div>
          )}
          {!hasMore && historyList.length > 0 && (
            <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px' }}>
              没有更多对话了
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px' }}>
          {loading ? <Spin /> : <div>暂无历史对话</div>}
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => menu}
      open={open}
      onOpenChange={(open) => setOpen(open)}
      trigger={['hover']}
    >
      <div className={styles.operation}>
        <History size={20} />
        <div>历史对话</div>
      </div>
    </Dropdown>
  );
};

export default HistoryDropdown;